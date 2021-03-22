<?php

namespace duckzland\LaravelTinymceImage;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Blade;


class LaravelTinymceImageServiceProvider extends ServiceProvider
{

    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        // Publish the config
        $this->publishes([
            __DIR__.'/../config/config.php' => config_path('tinymce-imagelibrary.php'),
        ], 'tinymce-imagelibrary');

        // Publish the assets
        $this->publishes([
            __DIR__.'/../dist' => public_path('vendor/tinymce-imagelibrary'),
        ], 'tinymce-imagelibrary');

        $this->publishes([
            __DIR__.'/../src/templates' => resource_path('views/vendor/tinymce-imagelibrary'),
        ], 'tinymce-imagelibrary');

        $this->loadViewsFrom(resource_path('views/vendor/tinymce-imagelibrary'), 'tinymce_imagelibrary');

        // Registering the routes
        $this->app->booted(function () {
            Route::middleware(config('tinymce-imagelibrary.middleware', []))
                ->prefix('/tinymce-image')
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
