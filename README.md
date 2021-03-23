# laravel-nova-tinymce-image-library
A image library for tinymce, this package is for personal usage only, no support or warranties whatsoever.

Requirement
============

This packages requires :
- PHP 7.4
- Laravel 7
- Spatie Media Library 7.x
- Instance of TinyMCE such as emilianotisato/nova-tinymce


Installing
==========

This package hasn't been published to composer repository yet. You will need to adjust
composer.json to fetch from this github repository

```
    "require": {
        "duckzland/laravel-tinymce-image": "dev-master"
    },
    "repositories": {
        "duckzland/laravel-tinymce-image": {
            "type": "git",
            "url": "https://github.com/duckzland/laravel-tinymce-image.git"
        },
    }

```



Publishing Assets
=================

This packages requires config file, blade file and assets (javascript and css) files to be publlished by invoking:

```
php artisan vendor:publish --tag=tinymce-imagelibrary
```



Configuration
==============

At the very least, you need to create a function that will return a valid single model instance that is linked
to spatie media library

```

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
    'retrieving_model_function' => 'app_tinymce_imagelibrary_get_model',

```

```

if (!function_exists('app_tinymce_imagelibrary_get_model')) {
    function app_tinymce_imagelibrary_get_model()
    {
        return MyModel::where('name', '=', "something")->get()->first();
    }
}

```


Initializing
============

To initiallize the plugin, include the blade into the blade that has the tinymce editor

```
@include('tinymce_imagelibrary::init')
```


In the tinymce editor configuration, at the toolbar section add imagelibrary as a button

```
    'toolbar' => '... imagelibrary ...',
```


