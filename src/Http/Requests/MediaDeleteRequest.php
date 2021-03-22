<?php

namespace duckzland\LaravelTinymceImage\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;



class MediaDeleteRequest extends FormRequest
{

    protected function validationData()
    {
        return $this->json()->all();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'media_id' => 'required|numeric',
        ];
    }
}
