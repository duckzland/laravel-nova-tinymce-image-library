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

    'upload_url' => '/tinymce-image/upload',
    
    'load_url' => '/tinymce-image/load',

    'delete_url' => '/tinymce-image/delete',

    'upload_allowed' => 'image/jpeg,image/gif,image/png,image/jpg',

    'upload_max_size' => 2 * 1024 * 1024,

    'upload_chunk_size' => 1024 * 1024

];
