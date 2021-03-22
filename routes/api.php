<?php


use duckzland\LaravelTinymceImage\Http\Controllers\MediaController;

Route::post('/load', [ MediaController::class, 'index' ]);
Route::post('/upload', [ MediaController::class, 'upload' ]);
Route::post('/delete', [ MediaController::class, 'delete' ]);
