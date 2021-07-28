<?php

namespace duckzland\LaravelTinymceImage\Http\Controllers;

use duckzland\LaravelTinymceImage\Http\Requests\MediaRequest;
use duckzland\LaravelTinymceImage\Http\Requests\MediaUploadRequest;
use duckzland\LaravelTinymceImage\Http\Requests\MediaDeleteRequest;

use duckzland\LaravelTinymceImage\Http\Receiver\MediaReceiver;
use duckzland\LaravelTinymceImage\Http\Resources\MediaResource;

use Symfony\Component\HttpFoundation\File\UploadedFile;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

use Exception;

class MediaController extends Controller
{


    /**
     * Method for listing all avaiblle media that is attached to a single media instance.
     *
     * @param MediaRequest $request
     * @return JsonResponse
     */
    public function index(MediaRequest $request): JsonResponse
    {

        try {
            // Use configuration from spatie media library config
            $mediaClass = config('medialibrary.media_model');

            if (empty($mediaClass)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $getMedia = config('tinymce-imagelibrary.retrieving_model_function', false);

            if (empty($getMedia) || !function_exists($getMedia)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $model = $getMedia();

            if (empty($model)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $page = $request->json()->get('page', 0);
            $searchText = $request->json()->get('search_text') ?: null;
            $perPage = $request->json()->get('per_page') ?: 10;
            $className = get_class($model);

            $query = $mediaClass::query()
                ->where('model_id', '=', $model->getKey())
                ->where('model_type', '=', $className);

            $mime = explode(',', config('tinymce-imagelibrary.upload_allowed'));

            if (!empty($mime)) {
                $query->whereIn('mime_type', $mime);
            }
    
            if ($searchText) {
                $query
                    ->where(function ($query) use ($searchText) {
                        $query->where('name', 'LIKE', '%' . $searchText . '%');
                        $query->orWhere('file_name', 'LIKE', '%' . $searchText . '%');
                    });
            }

            $query->orderBy('id', 'DESC');
            
            $results = $query->paginate($perPage, ['*'], false, $page);

            return response()->json(array_merge([
                'status' => 'OK',
                'data' => MediaResource::collection($results)
            ], Arr::except($results->toArray(), [ 'first_page_url', 'last_page_url', 'prev_page_url', 'next_page_url', 'path', 'from', 'to'])));

        }

        catch (\Throwable $e) {
            report($e);
            return response()->json([ 
                'status' => 'ERROR', 
                'message' => $e->getMessage() 
            ]);
        }
    }



    /**
     * Method for uploading a new media to a single media instance
     *
     * @param MediaUploaderRequest $request
     * @return JsonResponse
     */
    public function upload(MediaUploadRequest $request): JsonResponse 
    {
        try {
            $file  = false;
            $receiver = new MediaReceiver($request);
            $filename = false;
            $fileurl = '';
            $media_id = null;

            $getMedia = config('tinymce-imagelibrary.retrieving_model_function', false);

            if (empty($getMedia) || !function_exists($getMedia)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $model = $getMedia();

            if (empty($model)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $receiver->receive(function ($f) use (&$filename, &$fileurl, &$media_id, $model) {
                if (is_a($f, UploadedFile::class)) {
                    $m =  $model->addMedia($f)->toMediaCollection(config('tinymce-imagelibrary.media_collection', 'uploaded_media'));
                    $filename = $f->getFileName();
                    $fileurl = $m->getFullUrl();
                    $media_id = $m->getKey();
                }
            });

            if (empty($filename) || empty($fileurl)) {
                throw new Exception(__('Failed to upload file'));
            }

            return response()->json([ 
                'status' => 'OK', 
                'message' => __('Upload complete'), 
                'filename' => $filename, 
                'url' => $fileurl,
                'media_id' => $media_id
            ]);
        }

        catch (\Throwable $e) {
            report($e);
            return response()->json([ 
                'status' => 'ERROR', 
                'message' => $e->getMessage() 
            ]);
        }
    }



    /**
     * Method for deleting a single media from a single media instance
     *
     * @param MediaDeleteRequest $request
     * @return JsonResponse
     */
    public function delete(MediaDeleteRequest $request): JsonResponse 
    {
        try {

            $getMedia = config('tinymce-imagelibrary.retrieving_model_function', false);

            if (empty($getMedia) || !function_exists($getMedia)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $model = $getMedia();

            if (empty($model)) {
                throw new Exception(__('Failed to retrieve valid media'));
            }

            $model->deleteMedia($request->json()->get('media_id'));

            return response()->json([ 
                'status' => 'OK', 
                'message' => __('Delete complete'), 
            ]);
        }

        catch (\Throwable $e) {
            report($e);
            return response()->json([ 
                'status' => 'ERROR', 
                'message' => $e->getMessage() 
            ]);
        }
    }

}
