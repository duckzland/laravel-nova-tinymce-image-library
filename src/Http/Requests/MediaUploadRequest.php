<?php

namespace duckzland\LaravelTinymceImage\Http\Requests;

use Illuminate\Http\Request as HttpRequest;
use Symfony\Component\HttpFoundation\HeaderBag as HeaderBag;

class MediaUploadRequest extends HttpRequest {

    public $rawContent = false;

    
    public function initialize(array $query = array(), array $request = array(), array $attributes = array(), array $cookies = array(), array $files = array(), array $server = array(), $content = null)
    {

        parent::initialize($query, $request, $attributes, $cookies, $files, $server, $content);

        // Get all headers, filedrop send different headers
        $this->headers = new HeaderBag(\getallheaders());
    }



    public function getRawContent() {
        if (!$this->rawContent) {
            $this->rawContent = file_get_contents('php://input');
        }
        return $this->rawContent;
    }


    protected function validationData()
    {
        return $this->headers;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'X-File-Name' => 'required',
            'X-File-Type' => 'required',
            'X-File-Size' => 'required',
        ];
    }
}