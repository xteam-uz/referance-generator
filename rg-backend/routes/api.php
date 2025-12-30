<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ReferenceController;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route for PHP settings (development only)
Route::get('/test-php-settings', function () {
    $sapiName = php_sapi_name();
    $isCliServer = $sapiName === 'cli-server';

    return response()->json([
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'max_execution_time' => ini_get('max_execution_time'),
        'max_input_time' => ini_get('max_input_time'),
        'memory_limit' => ini_get('memory_limit'),
        'php_sapi_name' => $sapiName,
        'is_cli_server' => $isCliServer,
        'note' => $isCliServer
            ? "Laravel built-in server (php artisan serve) ishlatilmoqda. Bu CLI PHP sozlamalarini ishlatadi. PHP-FPM sozlamalarini ko'rish uchun Nginx/Apache orqali ishga tushiring."
            : "Bu web server (PHP-FPM) sozlamalarini ko'rsatadi.",
        'solution' => $isCliServer
            ? "CLI PHP sozlamalarini o'zgartirish: sudo nano /etc/php/8.5/cli/php.ini yoki Nginx/Apache orqali ishga tushiring."
            : null,
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('references', ReferenceController::class);
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
});
