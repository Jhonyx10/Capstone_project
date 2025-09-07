<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnalyticController;
use App\Http\Controllers\GeoLocationController;
use App\Http\Controllers\IncidentTypesController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ViolatorController;
use App\Http\Controllers\UserDeviceController;
use App\Http\Controllers\FCMController;
use App\Http\Controllers\TanodLocationController;
use App\Events\TanodLocationUpdated;

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

Route::get('test-notifications', [FCMController::class, 'sendFCMNotification']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    //admin only routes, for admins specific job.
    Route::middleware('role:admin')->group(function () {
        Route::post('/add-zone', [GeoLocationController::class, 'addZone']);
        Route::post('/add-category', [IncidentTypesController::class, 'addCategory']);
    });

    //tanod only routes, for brgy tanods specific functions.
    Route::middleware('role:tanod')->group(function () {
        Route::post('/add-location', [GeoLocationController::class, 'addIncidentLocation']);
        Route::post('/file-report', [ReportController::class, 'fileReport']);
        Route::post('/create-violators-profile', [ReportController::class, 'createViolatorsProfile']);
    });

    //residents only route, for residents specific work.
    Route::middleware('role:resident')->group(function () {
        Route::post('/send-request', [ReportController::class, 'sendRequest']);
        Route::get('/user-request/{id}',[TanodLocationController::class, 'userRequest']);
    });

    //admin and tanods shared routes for multi role access.
    Route::middleware('role:admin,tanod')->group(function () {
        Route::get('/get-zones', [GeoLocationController::class, 'getZones']);
        Route::get('/get-locations', [GeoLocationController::class, 'getLocations']);
        Route::get('/get-incident-locations', [GeoLocationController::class, 'getIncidentLocations']);
        Route::post('/add-incident-type', [IncidentTypesController::class, 'addIncidentType']);
        Route::get('/get-incident-types', [IncidentTypesController::class, 'getIncidentTypes']);
        Route::get('/reports', [ReportController::class, 'getIncidentReports']);
        Route::get('/report-violators/{id}', [ReportController::class, 'getReportViolators']);
        Route::get('/get-violators', [ReportController::class, 'getViolators']);
        Route::get('/violator-details/{id}', [ViolatorController::class, 'getViolatorsDetails']);
        Route::get('/request', [ReportController::class, 'getRequest']);
        //analytics parts.
        Route::get('/total-reports', [AnalyticController::class, 'totalReports']);
        Route::get('/recent-reports', [AnalyticController::class, 'recentReports']);
        Route::get('/monthly-reports', [AnalyticController::class, 'monthlyReports']);
        Route::get('/total-reports-by-zone', [AnalyticController::class, 'zoneIncidentTotal']);
        Route::get('/violators-total-violation', [AnalyticController::class, 'ViolatorTotalViolations']);
    });

    Route::get('/get-categories', [IncidentTypesController::class, 'getIncidentCategories']);
    Route::apiResource('users', UserController::class);
    Route::post('/add-profile', [UserController::class, 'addProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/update-location', function(Request $request) {
        broadcast(new TanodLocationUpdated(
            $request->user_id, $request->latitude, $request->longitude
        ));
        return response()->json(['status' => 'okay']);
    });
    
    


    Route::post('/tanod/location', [TanodLocationController::class, 'update']);// might remove this route.
    Route::apiResource('/user-device', UserDeviceController::class); //might remove this route also.


});



