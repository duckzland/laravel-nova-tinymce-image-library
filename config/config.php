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
    'retrieving_model_function' => 'tinymce_imagelibrary_get_model',


    /*
    |--------------------------------------------------------------------------
    | Media collection
    |--------------------------------------------------------------------------
    |
    | The model media collection to assign the newly uploaded file to
    |
    */
    'media_collection' => 'uploaded_media',


    /*
    |--------------------------------------------------------------------------
    | Upload URL
    |--------------------------------------------------------------------------
    | 
    | The upload url callback
    |
    */
    'upload_url' => '/tinymce-image/upload',
    

    /*
    |--------------------------------------------------------------------------
    | Load URL
    |--------------------------------------------------------------------------
    | 
    | The load url callback
    |
    */
    'load_url' => '/tinymce-image/load',


    /*
    |--------------------------------------------------------------------------
    | Delete URL
    |--------------------------------------------------------------------------
    | 
    | The delete url callback
    |
    */
    'delete_url' => '/tinymce-image/delete',


    /*
    |--------------------------------------------------------------------------
    | Allowed mime type
    |--------------------------------------------------------------------------
    | 
    | The allowed mime type for uploading file
    |
    */
    'upload_allowed' => 'image/jpeg,image/gif,image/png,image/jpg',


    /*
    |--------------------------------------------------------------------------
    | Maximum file size
    |--------------------------------------------------------------------------
    | 
    | The maximum file size for upload
    |
    */
    'upload_max_size' => 2 * 1024 * 1024,


    /*
    |--------------------------------------------------------------------------
    | Upload chunk size
    |--------------------------------------------------------------------------
    | 
    | The chunk size for each upload
    |
    */
    'upload_chunk_size' => 1024 * 1024

];
