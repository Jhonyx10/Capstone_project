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
use App\Http\Controllers\HotlineController;
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



Route::get('/send-notification', [FCMController::class, 'sendFCMNotification']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
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

    //admin and tanods shared routes for multi role access.
    Route::middleware('role:admin,tanod')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/get-zones', [GeoLocationController::class, 'getZones']);
        Route::get('/get-locations', [GeoLocationController::class, 'getLocations']);
        Route::get('/get-incident-locations', [GeoLocationController::class, 'getIncidentLocations']);
        Route::post('/add-incident-type', [IncidentTypesController::class, 'addIncidentType']);
        Route::get('/get-incident-types', [IncidentTypesController::class, 'getIncidentTypes']);
        Route::get('/reports', [ReportController::class, 'getIncidentReports']);
        Route::get('/report-details/{id}', [ReportController::class, 'reportDetails']);
        Route::get('/report-violators/{id}', [ReportController::class, 'getReportViolators']);
        Route::get('/get-violators', [ReportController::class, 'getViolators']);
        Route::get('/violator-details/{id}', [ViolatorController::class, 'getViolatorsDetails']);
        Route::get('/violators-record/{id}', [ViolatorController::class, 'violatorsRecords']);
        Route::get('/violators-violations', [ViolatorController::class, 'violatorsViolationCount']);
        Route::get('/request', [ReportController::class, 'getRequest']);

        Route::get('/location-details/{id}', [GeoLocationController::class, 'locationDetails']);

        //analytics reports here.
        Route::get('/total-reports', [AnalyticController::class, 'totalReports']);
        Route::get('/recent-reports', [AnalyticController::class, 'recentReports']);
        Route::get('/total-reports-by-zone', [AnalyticController::class, 'zoneIncidentTotal']);

        Route::get('/analytics', [AnalyticController::class, 'analytics']);
        //analytics for violators here.
        Route::get('/violators-total-violation', [AnalyticController::class, 'ViolatorTotalViolations']);

        //analytics for incident response time.
        Route::get('/average-response-time', [AnalyticController::class, 'averageResponseTime']);
        Route::get('/average-response-time-by-zone/{id}', [AnalyticController::class, 'averageResponseTimeByZone']);
        Route::get('/months-current-previous', [AnalyticController::class, 'currentPreviousChanges']);
        Route::get('/registered-users', [AnalyticController::class, 'registeredResidents']);
    });
    
    Route::apiResource('/hotline', HotlineController::class);
    Route::get('/get-categories', [IncidentTypesController::class, 'getIncidentCategories']);
    Route::post('/add-profile', [UserController::class, 'addProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Route::post('/update-location', function(Request $request) {
    //     broadcast(new TanodLocationUpdated(
    //         $request->user_id, $request->latitude, $request->longitude
    //     ));
    //     return response()->json(['status' => 'okay']);
    // });
    
    //resident api request routes
    Route::post('/send-request', [ReportController::class, 'sendRequest']);
    Route::get('/user-request/{id}',[TanodLocationController::class, 'userRequest']);



    Route::post('/tanod/location', [TanodLocationController::class, 'update']);// might remove this route.
    Route::apiResource('/user-device', UserDeviceController::class); //might remove this route also.

});

