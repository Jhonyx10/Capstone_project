<?php

namespace App\Services;

use App\Models\WatchList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

class WatchListService
{
    private const DISK = 'public';
    private const DIR  = 'watch-lists';

    /** Filterable list query: type, status, search, trashed. */
    public function query(array $filters = [], bool $public = false): Builder
    {
        return WatchList::query()
            ->when(! $public, fn ($q) => $q->withCount('sightings')->with('latestSighting'))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->ofType($v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['search'] ?? null, function ($q, $term) use ($public) {
                $q->where(function ($q) use ($term, $public) {
                    $q->where('identifier', 'like', "%{$term}%")
                    ->orWhere('details', 'like', "%{$term}%");

                    // Residents can't search the "reason" they can't see
                    if (! $public) {
                        $q->orWhere('reason', 'like', "%{$term}%");
                    }
                });
            })
            ->when(! empty($filters['trashed']) && ! $public, fn ($q) => $q->onlyTrashed())
            ->latest();
    }

    public function create(array $data, UploadedFile $image): WatchList
    {
        $path = $image->store(self::DIR, self::DISK);

        try {
            return WatchList::create([...$data, 'image' => $path]);
        } catch (Throwable $e) {
            // Don't leave an orphaned file if the insert fails
            Storage::disk(self::DISK)->delete($path);
            throw $e;
        }
    }

    public function update(WatchList $watchList, array $data, ?UploadedFile $image = null): WatchList
    {
        $oldImage = null;

        if ($image) {
            $oldImage      = $watchList->image;
            $data['image'] = $image->store(self::DIR, self::DISK);
        }

        $watchList->update($data);

        if ($oldImage) {
            Storage::disk(self::DISK)->delete($oldImage);
        }

        return $watchList->refresh();
    }

    /** Soft delete. The image is kept so the entry can be restored. */
    public function delete(WatchList $watchList): void
    {
        $watchList->delete();
    }

    public function restore(int $id): WatchList
    {
        $watchList = WatchList::onlyTrashed()->findOrFail($id);
        $watchList->restore();

        return $watchList;
    }
}