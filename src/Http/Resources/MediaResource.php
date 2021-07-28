<?php

namespace duckzland\LaravelTinymceImage\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $original = $thumbnail = $this->resource->getFullUrl();

        // We need to jail this inside try block to prevent script breaks when spatie collection went awol!
        try {              
            $thumbnail = url($this->resource->getUrl(config('tinymce-imagelibrary.media_thumbnail', $this->resource->collection_name)));
        }
        catch (\Exception $e) {

        }
                    
        return [
            'id' => $this->resource->getKey(),
            'url' => $original,
            'thumbnail' => $thumbnail
        ];
    }
}
