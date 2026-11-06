<?php

namespace App\Services;

use App\Models\ViolatorsProfile;
use App\Models\ViolatorsRecord;
use App\Models\User;
use App\Models\BlockedNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ViolatorService
{
    public function getViolatorsDetails(int $id): ViolatorsProfile
    {
        $violator = ViolatorsProfile::with(['zone', 'reports.incidentType.category', 'reports.location.zone'])
                                    ->findOrFail($id);
        $violator->photo = asset('storage/' . $violator->photo);

        return $violator;
    }

    public function violatorsViolationCount()
    {
        return ViolatorsProfile::withCount(['violationRecords as total_violations' => function ($query) {
                            $query->join('incident_reports', 'incident_reports.id', '=', 'violators_records.report_id');
                            }])
                            ->orderByDesc('total_violations')
                            ->limit(5)
                            ->get(['id', 'first_name'])
                            ->map(function ($violator) {
                                if($violator->photo) {
                                    if(!str_starts_with($violator->photo, 'http')) {
                                        $violator->photo = asset('storage/'. $violator->photo);
                                    }
                                }
                            return $violator;
                            });
    }

    public function getResidents()
    {
        return User::with('requests')
            ->where('role', 'resident')
            ->orderByRaw("status = 'pending' desc")   // pending first
            ->latest()
            ->get()
            ->each(fn ($u) => $u->makeHidden(['identification', 'device_id', 'id_number_hash']));
    }

    public function getResidentDetails(int $id): array
    {
        $user = User::with('requests')->where('role', 'resident')->findOrFail($id);

        $sameDevice = $user->device_id
            ? User::where('device_id', $user->device_id)
                ->where('id', '!=', $user->id)
                ->get(['id', 'name', 'email', 'status'])
            : collect();

        $onBlockList = BlockedNumber::where('phone', $user->email)
            ->when($user->device_id, fn ($q) => $q->orWhere('device_id', $user->device_id))
            ->exists();

        return [
            'id'                  => $user->id,
            'name'                => $user->name,
            'phone'               => $user->email,
            'status'              => $user->status,
            'created_at'          => $user->created_at,
            'device_id'           => $user->device_id,
            'has_photo'           => $user->identification
                                        && Storage::disk('local')->exists($user->identification),
            'reviewed_by'         => $user->reviewed_by ? User::find($user->reviewed_by)?->name : null,
            'reviewed_at'         => $user->reviewed_at,
            'reject_reason'       => $user->reject_reason,
            'block_reason'        => $user->block_reason,
            'blocked_at'          => $user->blocked_at,
            'on_block_list'       => $onBlockList,
            'same_device'         => $sameDevice,
            'requests_total'      => $user->requests->count(),
            'requests_by_status'  => $user->requests->groupBy('status')->map->count(),
        ];
    }

    public function residentPhoto(int $id)
    {
        $user = User::where('role', 'resident')->findOrFail($id);

        abort_unless(
            $user->identification && Storage::disk('local')->exists($user->identification),
            404
        );

        return Storage::disk('local')->response($user->identification);
    }

    public function approveResident(int $id, int $adminId): User
    {
        $user = User::where('role', 'resident')->findOrFail($id);
        abort_unless(in_array($user->status, ['pending', 'rejected']), 422, 'This resident cannot be approved.');

        $user->update([
            'status'        => 'active',
            'reject_reason' => null,
            'reviewed_by'   => $adminId,
            'reviewed_at'   => now(),
        ]);

        return $user;
    }

    public function rejectResident(int $id, int $adminId, string $reason): User
    {
        $user = User::where('role', 'resident')->findOrFail($id);
        abort_unless($user->status === 'pending', 422, 'Only pending residents can be rejected.');

        $user->update([
            'status'        => 'rejected',
            'reject_reason' => $reason,
            'reviewed_by'   => $adminId,
            'reviewed_at'   => now(),
        ]);
        $user->tokens()->delete();

        return $user;
    }

    // Toggles: active -> block, block -> active
    public function blockUser(int $id, ?int $adminId = null, ?string $reason = null): User
    {
        $user = User::where('role', 'resident')->findOrFail($id);

        DB::transaction(function () use ($user, $adminId, $reason) {
            if ($user->status === 'block') {
                BlockedNumber::where('phone', $user->email)->delete();
                $user->update(['status' => 'active', 'block_reason' => null, 'blocked_at' => null]);
            } else {
                BlockedNumber::updateOrCreate(
                    ['phone' => $user->email],
                    ['reason' => $reason, 'device_id' => $user->device_id, 'blocked_by' => $adminId]
                );
                $user->update(['status' => 'block', 'block_reason' => $reason, 'blocked_at' => now()]);
                $user->tokens()->delete();
            }
        });

        return $user->fresh();
    }
}
