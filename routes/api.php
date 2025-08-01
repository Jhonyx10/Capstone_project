<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GeoLocationController;
use App\Http\Controllers\IncidentTypesController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::post('/add-profile', [UserController::class, 'addProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/add-zone', [GeoLocationController::class, 'addZone']);
    Route::get('/get-zones', [GeoLocationController::class, 'getZones']);

    Route::post('/add-category', [IncidentTypesController::class, 'addCategory']);
    Route::post('/add-incident-type', [IncidentTypesController::class, 'addIncidentType']);
    Route::get('/get-categories', [IncidentTypesController::class, 'getIncidentCategories']);

    Route::post('/file-report', [ReportController::class, 'fileReport']);
    Route::post('/create-violators-profile', [ReportController::class, 'createViolatorsProfile']);
    Route::get('/reports', [ReportController::class, 'getIncidentReports']);
    Route::get('/report-violators/{id}', [ReportController::class, 'getReportViolators']);
});

