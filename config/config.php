<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | The middlewares to be applied at the image library api callbacks
    |
    */
    'middleware' => [],    


    /*
    |--------------------------------------------------------------------------
    | Model instance
    |--------------------------------------------------------------------------
    |
    | The single model instance for all the media, uploaded media will be
    | attached to this media instance.
    |
    | Create a function that return a single laravel model instance
    |
    */
    'retrieving_model_function' => env('TINYMCE_IMAGELIBRARY_RETRIEVING_MODEL_FUNCTION_NAME', 'tinymce_imagelibrary_get_model'),


    /*
    |--------------------------------------------------------------------------
    | Media collection
    |--------------------------------------------------------------------------
    |
    | The model media collection to assign the newly uploaded file to
    |
    */
    'media_collection' => env('TINYMCE_IMAGELIBRARY_MEDIA_COLLECTION', 'uploaded_media'),



    /*
    |--------------------------------------------------------------------------
    | Media Thumbnail
    |--------------------------------------------------------------------------
    |
    | The media conversion name for thumbnail
    |
    */
    'media_thumbnail' => env('TINYMCE_IMAGELIBRARY_MEDIA_THUMBNAIL', 'thumbnail'),


    /*
    |--------------------------------------------------------------------------
    | Upload URL
    |--------------------------------------------------------------------------
    | 
    | The upload url callback
    |
    */
    'upload_url' => env('TINYMCE_IMAGELIBRARY_UPLOAD_URL', '/tinymce-image/upload'),
    

    /*
    |--------------------------------------------------------------------------
    | Load URL
    |--------------------------------------------------------------------------
    | 
    | The load url callback
    |
    */
    'load_url' => env('TINYMCE_IMAGELIBRARY_LOAD_URL', '/tinymce-image/load'),


    /*
    |--------------------------------------------------------------------------
    | Delete URL
    |--------------------------------------------------------------------------
    | 
    | The delete url callback
    |
    */
    'delete_url' => env('TINYMCE_IMAGELIBRARY_DELETE_URL', '/tinymce-image/delete'),


    /*
    |--------------------------------------------------------------------------
    | Allowed mime type
    |--------------------------------------------------------------------------
    | 
    | The allowed mime type for uploading file
    |
    */
    'upload_allowed' => env('TINYMCE_IMAGELIBRARY_UPLOAD_ALLOWED_MIME', 'image/jpeg,image/gif,image/png,image/jpg'),


    /*
    |--------------------------------------------------------------------------
    | Maximum file size
    |--------------------------------------------------------------------------
    | 
    | The maximum file size for upload
    |
    */
    'upload_max_size' => env('TINYMCE_IMAGELIBRARY_UPLOAD_MAX_SIZE', 2 * 1024 * 1024),


    /*
    |--------------------------------------------------------------------------
    | Upload chunk size
    |--------------------------------------------------------------------------
    | 
    | The chunk size for each upload
    |
    */
    'upload_chunk_size' => env('TINYMCE_IMAGELIBRARY_UPLOAD_CHUNK_SIZE', 1024 * 1024),



    /*
    |--------------------------------------------------------------------------
    | Pexels support
    |--------------------------------------------------------------------------
    | 
    | Insert the pexels api keys to enable fetching image from pexels
    |
    */
    'api_key_pexels' => env('TINYMCE_IMAGELIBRARY_PEXELS_API_KEY', false),


    /*
    |--------------------------------------------------------------------------
    | Unsplash support
    |--------------------------------------------------------------------------
    | 
    | Insert the unsplash api keys to enable the fetching image from unsplash
    |
    */
    'api_key_unsplash' => env('TINYMCE_IMAGELIBRARY_UNSPLASH_API_KEY', false)

];
