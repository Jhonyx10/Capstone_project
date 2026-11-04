<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSightingReportRequest;
use App\Http\Requests\UpdateSightingReportRequest;
use App\Http\Resources\SightingReportResource;
use App\Models\SightingReport;
use App\Policies\SightingReportPolicy;
use App\Services\SightingReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SightingReportController extends Controller
{
    public function __construct(private SightingReportService $service)
    {
    }

    // GET /sighting-reports?subject_id=&reporter_id=&from=&to=&per_page=15&paginate=false
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', SightingReport::class);

        $filters = $request->only(['subject_id', 'reporter_id', 'from', 'to']);

        // Residents only ever see their own sightings; admin and tanod see all
        if (! SightingReportPolicy::isStaff($request->user())) {
            $filters['reporter_id'] = $request->user()->id;
        }

        $query = $this->service->query($filters);

        $items = $request->boolean('paginate', true)
            ? $query->paginate($request->integer('per_page', 15))
            : $query->get();

        return SightingReportResource::collection($items);
    }

    // POST /sighting-reports
    public function store(StoreSightingReportRequest $request): JsonResponse
    {
        $this->authorize('create', SightingReport::class);

        $sighting = $this->service->create($request->validated(), $request->user()->id);

        return (new SightingReportResource($sighting))
            ->response()
            ->setStatusCode(201);
    }

    // GET /sighting-reports/{sighting_report}
    public function show(SightingReport $sightingReport): SightingReportResource
    {
        $this->authorize('view', $sightingReport);

        return new SightingReportResource($sightingReport->load(['subject', 'reporter:id,name']));
    }

    // PUT /sighting-reports/{sighting_report}
    public function update(UpdateSightingReportRequest $request, SightingReport $sightingReport): SightingReportResource
    {
        $this->authorize('update', $sightingReport);

        return new SightingReportResource(
            $this->service->update($sightingReport, $request->validated())
        );
    }

    // DELETE /sighting-reports/{sighting_report}
    public function destroy(SightingReport $sightingReport): JsonResponse
    {
        $this->authorize('delete', $sightingReport);

        $this->service->delete($sightingReport);

        return response()->json(['message' => 'Sighting report deleted.']);
    }
}