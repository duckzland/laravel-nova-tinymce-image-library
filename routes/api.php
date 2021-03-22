<?php


use duckzland\LaravelTinymceImage\Http\Controllers\MediaController;

Route::post('/tinymce-media/load', [ MediaController::class, 'index' ]);
Route::post('/tinymce-media/upload', [ MediaController::class, 'upload' ]);
Route::post('/tinymce-media/delete', [ MediaController::class, 'delete' ]);
