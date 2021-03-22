<?php

namespace duckzland\LaravelTinymceImage\Http\Receiver;

use Closure;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use duckzland\LaravelTinymceImage\Http\Requests\MediaUploadRequest as UploaderRequest;

class MediaReceiver
{

    protected $request;
    protected $filename;
    protected $filetype;
    protected $filesize;
    protected $chunk;
    protected $chunks;
    protected $content;



    public function __construct(UploaderRequest $request)
    {
        $this->request  = $request;
        $this->filename = $this->request->header('X-File-Name');
        $this->filetype = $this->request->header('X-File-Type');
        $this->filesize = $this->request->header('X-File-Size');
        $this->chunks   = (int) $this->request->header('X-Chunks');
        $this->chunk    = (int) $this->request->header('X-Chunk');
        $this->content  = $this->request->getRawContent();
    }



    public function getPath($filename = false)
    {
        $path = storage_path('tmp');

        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }

        if ($filename) {
            $path .= DIRECTORY_SEPARATOR . $filename;
        }

        return $path;
    }

    function sanitize($string, $time = true)
    {

        $path_parts = pathinfo($string);
        $filename   = $path_parts['filename'];
        $extension  = isset($path_parts['extension']) ? $path_parts['extension'] : '';
        $strip      = array("~", "`", "!", "@", "#", "$", "%20%", "%", "^", "&", "*", "(", ")", "_", "=", "+", "[", "{", "]",
            "}", "\\", "|", ";", ":", "\"", "'", "&#8216;", "&#8217;", "&#8220;", "&#8221;", "&#8211;", "&#8212;",
            "—", "–", ",", "<", ".", ">", "/", "?", " ");

        $clean      = trim(str_replace($strip, "", strip_tags($filename)));
        $clean      = preg_replace('/\s+/', "-", $clean);
        $clean      = preg_replace("/[^a-zA-Z0-9]/", "", $clean);

        if (function_exists('mb_strtolower')) {
            mb_strtolower($clean, 'UTF-8');
        }
        else {
            strtolower($clean);
        }

        // Don't allow super long filename
        $clean = substr($clean, 0, 200);

        // Don't allow js or php file
        $extension = str_replace(['php', 'js'], ['php.txt', 'js.txt'], $extension);

        // Add extra timestamps
        if ($time) {
            $clean = $this->uniqid(str_replace($strip, '', $clean) . '-ccz');
        }

        if (!empty($extension)) {
            $clean .= '.' . $extension;
        }

        return $clean;
    }


    function uniqid($prefix, $length = 13) {
        // uniqid gives 13 chars, but you could adjust it to your needs.
        if (function_exists("random_bytes")) {
            $bytes = random_bytes(ceil($length / 2));
        } 
        
        elseif (function_exists("openssl_random_pseudo_bytes")) {
            $bytes = openssl_random_pseudo_bytes(ceil($length / 2));
        } 
        
        else {
            return uniqid($prefix);
        }

        return $prefix . substr(bin2hex($bytes), 0, $length);
    }


    public function receiveSingle(Closure $handler) {

        $filename = $this->sanitize($this->filename);
        $filepath = $this->getPath($filename);

        return $handler($this->storeFile($filepath, $filename));
    }




    public function storeFile($filepath, $filename, $put = true) {

        if ($put) {
            file_put_contents($filepath, $this->content);
        }

        return new UploadedFile($filepath, $filename, 'blob', UPLOAD_ERR_OK, true);
    }



    public function detectChunks() {

        $files = array();

        // Populating all chunks
        for ($i=0; $i < $this->chunks; $i++) {
            $path = $this->getPath($this->sanitize($this->filename . '.part-' . $i, false));
            if (@file_exists($path)) {
                $files[] = $path;
            }
        }

        return $files;
    }


    public function mergeChunks($filepath) {

        $files = $this->detectChunks();

        // Merging all chunks
        if (count($files) == $this->chunks) {
            foreach ($files as $path) {
                $size = filesize($path);
                if ($size > 0) {
                    $file = fopen($path, 'rb');
                    $buff = fread($file, $size);
                    fclose($file);

                    $final = fopen($filepath, 'ab');
                    $write = fwrite($final, $buff);
                    fclose($final);
                }

                unlink($path);
            }
        }
    }


    public function cleanChunks() {
        $files = $this->detectChunks();
        foreach ($files as $path) {
            unlink($path);
        }
    }


    public function receiveChunks(Closure $handler)
    {
        $result = 'chunked';

        $filename = $this->sanitize($this->filename);
        $filepath = $this->getPath($filename);

        // Storing current chunk
        $chunkname = $this->sanitize($this->filename . '.part-' . $this->chunk, false);
        $chunkpath = $this->getPath($chunkname);
        $this->storeFile($chunkpath, $chunkname);

        // Merging Chunks
        if ($this->chunk == $this->chunks - 1) {
            $this->mergeChunks($filepath);
            $result = $handler($this->storeFile($filepath, $filename, false));
        }

        return $result;
    }


    public function receive(Closure $handler)
    {
        $response = [];
        $response['jsonrpc'] = '2.0';

        if ($this->chunks) {
            $result = $this->receiveChunks($handler);
        }
        else {
            $result = $this->receiveSingle($handler);
        }

        $response['result'] = $result;
        return $response;
    }
}