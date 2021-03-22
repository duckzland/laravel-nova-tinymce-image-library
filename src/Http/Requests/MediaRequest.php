<?php

namespace duckzland\LaravelTinymceImage\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;



class MediaRequest extends FormRequest
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
            'search_text' => 'sometimes|nullable|string',
            'page' => 'sometimes|nullable|numeric',
            'per_page' => 'sometimes|nullable|numeric'
        ];
    }
}
