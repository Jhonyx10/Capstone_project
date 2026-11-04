<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWatchListRequest;
use App\Http\Requests\UpdateWatchListRequest;
use App\Http\Resources\WatchListResource;
use App\Models\WatchList;
use App\Policies\SightingReportPolicy;
use App\Services\WatchListService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

class WatchListController extends Controller
{
    public function __construct(private WatchListService $service)
    {
    }

    // GET /watch-lists?search=&type=&status=&trashed=1&per_page=15&paginate=false
    public function index(Request $request): AnonymousResourceCollection
    {
        $isStaff = SightingReportPolicy::isStaff($request->user());

        $filters = $request->only(['search', 'type', 'status', 'trashed']);

        // Residents only ever see active, non-deleted entries
        if (! $isStaff) {
            $filters = Arr::only($filters, ['search', 'type']);
            $filters['status'] = WatchList::STATUS_ACTIVE;
        }

        $query = $this->service->query($filters, public: ! $isStaff);

        $items = $request->boolean('paginate', true)
            ? $query->paginate($request->integer('per_page', 15))
            : $query->get();

        return WatchListResource::collection($items);
    }

    // POST /watch-lists   (multipart/form-data)
    public function store(StoreWatchListRequest $request): JsonResponse
    {
        $entry = $this->service->create(
            Arr::except($request->validated(), ['image']),
            $request->file('image')
        );

        return (new WatchListResource($entry))
            ->response()
            ->setStatusCode(201);
    }

    // GET /watch-lists/{watch_list}
    public function show(Request $request, WatchList $watchList): WatchListResource
    {
        if (! SightingReportPolicy::isStaff($request->user())) {
            // An inactive entry looks like it doesn't exist to residents
            abort_unless($watchList->isActive(), 404);

            return new WatchListResource($watchList);
        }

        $watchList->loadCount('sightings')
            ->load(['sightings' => fn ($q) => $q->latest()]);

        return new WatchListResource($watchList);
    }

    // PUT /watch-lists/{watch_list}
    public function update(UpdateWatchListRequest $request, WatchList $watchList): WatchListResource
    {
        $entry = $this->service->update(
            $watchList,
            Arr::except($request->validated(), ['image']),
            $request->file('image')
        );

        return new WatchListResource($entry);
    }

    // DELETE /watch-lists/{watch_list}  (soft delete)
    public function destroy(WatchList $watchList): JsonResponse
    {
        $this->service->delete($watchList);

        return response()->json(['message' => 'Watch list entry deleted.']);
    }

    // POST /watch-lists/{id}/restore
    public function restore(int $id): WatchListResource
    {
        return new WatchListResource($this->service->restore($id));
    }
}