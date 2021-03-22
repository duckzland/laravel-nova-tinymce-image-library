<?php

namespace duckzland\LaravelTinymceImage;

use Illuminate\Support\ServiceProvider;

class LaravelTinymceImageServiceProvider extends ServiceProvider
{

    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        $this->publishes([
            __DIR__.'/../config/config.php' => config_path('tinymce-image-library.php'),
        ], 'tinymce-imagelibrary');

        $this->app->booted(function () {
            Route::middleware(config('tinymce-imagelibrary.middleware', []))
                ->prefix('/tinymce-media')
                ->group(__DIR__.'/../routes/api.php');
        });
    }


    /**
     * Register the application services.
     */
    public function register()
    {
        // Automatically apply the package configuration
        $this->mergeConfigFrom(__DIR__.'/../config/config.php', 'tinymce-imagelibrary');

    }
}
