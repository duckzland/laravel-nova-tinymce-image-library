# laravel-nova-tinymce-image-library
A image library for tinymce


```
php artisan vendor:publish --tag=tinymce-imagelibrary
```


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


```
@include('tinymce_imagelibrary::init')
```


```
    'toolbar' => '... imagelibrary ...',
```
