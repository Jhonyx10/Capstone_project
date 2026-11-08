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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ChatBoxController;
use App\Events\TanodLocationUpdated;
use App\Http\Controllers\PDFController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\AreaPersonnelController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\WatchListController;
use App\Http\Controllers\SightingReportController;


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
Route::post('/resident-login', [AuthController::class, 'residentLogin']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('users', UserController::class);

    Route::middleware('role:admin')->group(function () {
        Route::post('/add-zone', [GeoLocationController::class, 'addZone']);
        Route::post('/add-category', [IncidentTypesController::class, 'addCategory']);
        Route::get('/request/records', [ReportController::class,'getRequestRecords']);
        Route::get('/residents', [ViolatorController::class, 'getResidents']);
        Route::put('/block/user/{id}', [ViolatorController::class, 'blockUser']);
        Route::get('/unanswered-requests', [ReportController::class, 'getUnansweredRequests']);
        Route::get('/groups', [GroupController::class, 'index']);
        Route::post('/groups', [GroupController::class, 'store']);
        Route::post('/groups/{id}/members', [GroupController::class, 'assign']);
        Route::delete('/users/{id}/group', [GroupController::class, 'unassign']);
        Route::get('/users/{id}/group-history', [GroupController::class, 'history']);
        //operations
        Route::apiResource('operations', OperationController::class)->except(['index', 'show']);
        Route::put('/operations/{operation}/geofence', [OperationController::class, 'updateGeofence']);
        Route::patch('/operations/{operation}/status', [OperationController::class, 'updateStatus']);
        //area of operation routes
        Route::post('/operations/{operation}/areas', [AreaController::class, 'store']);
        Route::put('/areas/{area}', [AreaController::class, 'update']);
        Route::delete('/areas/{area}', [AreaController::class, 'destroy']);
        //personnel for operations
         Route::post('/areas/{area}/personnel', [AreaPersonnelController::class, 'store']);
        Route::post('/areas/{area}/personnel/bulk', [AreaPersonnelController::class, 'storeMany']);
        Route::patch('/areas/{area}/personnel/{userId}', [AreaPersonnelController::class, 'update']);
        Route::delete('/areas/{area}/personnel/{userId}', [AreaPersonnelController::class, 'destroy']);
        Route::post('/areas/{area}/personnel/{userId}/transfer', [AreaPersonnelController::class, 'transfer']);
        //resident
        Route::get('residents/{id}', [ViolatorController::class, 'residentDetails']);
        Route::get('residents/{id}/photo', [ViolatorController::class, 'residentPhoto']);
        Route::post('residents/{id}/approve', [ViolatorController::class, 'approveResident']);
        Route::post('residents/{id}/reject', [ViolatorController::class, 'rejectResident']);
    });

    //tanod only routes, for brgy tanods specific functions.
    Route::middleware('role:tanod')->group(function () {
        Route::post('/add-location', [GeoLocationController::class, 'addIncidentLocation']);
        Route::post('/file-report', [ReportController::class, 'fileReport']);
        Route::post('/create-violators-profile', [ReportController::class, 'createViolatorsProfile']);
        Route::put('/reject/request/{id}',[ReportController::class, 'rejectRequest']);
    });

    //admin and tanods shared routes for multi role access.
    Route::middleware('role:admin,tanod')->group(function () {
        Route::get('tanod/analytics', [AnalyticController::class, 'tanodHome']);
        // Route::apiResource('users', UserController::class);
        Route::get('/get-zones', [GeoLocationController::class, 'getZones']);
        Route::get('/get-locations', [GeoLocationController::class, 'getLocations']);
        Route::post('/add-incident-type', [IncidentTypesController::class, 'addIncidentType']);
        Route::get('/get-incident-types', [IncidentTypesController::class, 'getIncidentTypes']);
        Route::get('/reports', [ReportController::class, 'getIncidentReports']);
        Route::get('/report-details/{id}', [ReportController::class, 'reportDetails']);
        Route::get('/report-violators/{id}', [ReportController::class, 'getReportViolators']);
        Route::get('/get-violators', [ReportController::class, 'getViolators']);
        Route::get('/violator-details/{id}', [ViolatorController::class, 'getViolatorsDetails']);
        Route::get('/violators-violations', [ViolatorController::class, 'violatorsViolationCount']);
        
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
        Route::get('/total-requests', [AnalyticController::class, 'totalRequest']);
        //group details
        Route::get('/groups/{id}', [GroupController::class, 'show']);
        Route::get('/my-group', [GroupController::class, 'myGroup']);
        //operations
        Route::apiResource('operations', OperationController::class)->only(['index', 'show']);
        Route::get('/operations/{operation}/personnel', [OperationController::class, 'personnel']);
        Route::get('/operations/{operation}/areas', [AreaController::class, 'index']);
        Route::get('/areas/{area}', [AreaController::class, 'show']);
        Route::get('/areas/{area}/personnel', [AreaPersonnelController::class, 'index']);

        Route::post('watch-lists/{id}/restore', [WatchListController::class, 'restore']);
        Route::apiResource('watch-lists', WatchListController::class)
            ->except(['index', 'show']);
    });
    
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/update-notification/{id}', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    
    Route::apiResource('/hotline', HotlineController::class);
    Route::get('/get-categories', [IncidentTypesController::class, 'getIncidentCategories']);
    Route::post('/add-profile', [UserController::class, 'addProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/news', [ReportController::class, 'news']);
    //resident api request routes
    Route::post('/send-request', [ReportController::class, 'sendRequest']);
    Route::get('/user-request/{id}',[TanodLocationController::class, 'userRequest']);
    Route::get('/request', [ReportController::class, 'getRequest']);
    Route::get('/messages/{id}', [ChatBoxController::class, 'getMessages']);
    Route::post('/send-message', [ChatBoxController::class, 'sendMessage']);

    Route::post('/tanod/location', [TanodLocationController::class, 'update']);// might remove this route.
    Route::apiResource('/user-device', UserDeviceController::class); //might remove this route also.

    Route::get('watch-lists', [WatchListController::class, 'index']);
    Route::get('watch-lists/{watch_list}', [WatchListController::class, 'show']);

    Route::post('sighting-reports', [SightingReportController::class, 'store'])
        ->middleware('throttle:20,1'); // max 20 sightings per minute per user
    Route::apiResource('sighting-reports', SightingReportController::class)
        ->except(['store']);
});

