import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    IoArrowBack,
    IoAddCircleOutline,
    IoLocationOutline,
} from "react-icons/io5";
import OperationMap from "../components/map/OperationMap";
import AreaForm from "../components/operations/AreaForm";
import AreaPersonnelPanel from "../components/operations/AreaPersonnelPanel";
import StatusBadge, {
    OPERATION_STATUSES,
} from "../components/operations/StatusBadge";
import useOperations from "../hooks/useOperations";
import useAreas from "../hooks/useAreas";
import useVolunteers from "../hooks/useVolunteers"; // <-- swap for your tanod roster hook
import { getApiError } from "../functions/OperationApi";
import { round8 } from "../functions/geo";
import { fadeIn, rowFade } from "../utils/motion"; // <-- adjust to where your helpers live

const CARD =
    "rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900";

const OperationDetailsPage = () => {
    const { operationId } = useParams();
    const navigate = useNavigate();

    const {
        details,
        setStatus,
        update,
        personnel: operationPersonnel,
    } = useOperations({ operationId });

    const {
        areas,
        create: createArea,
        remove: removeArea,
    } = useAreas(operationId);

    // each item needs an `id` and a name (`name` or `first_name` + `last_name`)
    const { data: tanods = [] } = useVolunteers();

    const people = operationPersonnel.data ?? [];
    const assignedUserIds = people.map((p) => p.user_id);
    const countBy = (s) => people.filter((p) => p.status === s).length;

    const operation = details.data;
    const areaList = areas.data ?? [];

    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [draftPoint, setDraftPoint] = useState(null);
    const [draftGeofence, setDraftGeofence] = useState(null);
    const [pinning, setPinning] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [areaError, setAreaError] = useState("");

    const selectedArea = areaList.find((a) => a.id === selectedAreaId) ?? null;
    const focus = selectedArea
        ? {
              latitude: selectedArea.latitude,
              longitude: selectedArea.longitude,
              zoom: 17,
          }
        : null;

    const resetDraft = () => {
        setDraftPoint(null);
        setDraftGeofence(null);
        setPinning(false);
        setAreaError("");
        setResetKey((k) => k + 1); // clears the polygon on the map
    };

    const startAdding = () => {
        setSelectedAreaId(null);
        resetDraft();
        setAdding(true);
    };

    const cancelAdding = () => {
        resetDraft();
        setAdding(false);
    };

    const handlePoint = (p) => {
        setDraftPoint(p);
        setPinning(false);
    };

    const handleCreateArea = async ({ name, capacity }) => {
        setAreaError("");
        try {
            const area = await createArea.mutateAsync({
                name,
                capacity,
                latitude: round8(draftPoint.lat),
                longitude: round8(draftPoint.lng),
                geofence: draftGeofence,
            });
            resetDraft();
            setAdding(false);
            setSelectedAreaId(area.id);
        } catch (err) {
            // e.g. "The area must be located inside the operation geofence."
            setAreaError(getApiError(err, "Could not create the area."));
        }
    };

    const handleDeleteArea = async () => {
        if (!selectedArea) return;
        if (
            !window.confirm(
                `Delete "${selectedArea.name}" and its assignments?`
            )
        )
            return;
        await removeArea.mutateAsync({ areaId: selectedArea.id });
        setSelectedAreaId(null);
    };

    if (details.isLoading)
        return (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                Loading operation...
            </div>
        );
    if (details.isError || !operation)
        return (
            <div className="p-6 text-sm text-red-500">
                Failed to load this operation.
            </div>
        );

    const stats = [
        { label: "Areas", value: areaList.length },
        { label: "Active", value: countBy("active") },
        { label: "Standby", value: countBy("standby") },
        { label: "Inactive", value: countBy("inactive") },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div {...fadeIn()} className="mb-6">
                <button
                    onClick={() => navigate("/operations")}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                >
                    <IoArrowBack aria-hidden="true" /> Operations
                </button>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                {operation.name}
                            </h1>
                            <StatusBadge status={operation.status} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {operation.zone?.zone_name ?? "No zone"} · Draw
                            areas on the map, then station personnel in them.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        Event date
                        <input
                            type="date"
                            value={operation.event_date ?? ""}
                            onChange={(e) =>
                                update.mutate({
                                    operationId: operation.id,
                                    form: {
                                        event_date: e.target.value || null,
                                    },
                                })
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        Status
                        <select
                            value={operation.status}
                            onChange={(e) =>
                                setStatus.mutate({
                                    operationId: operation.id,
                                    status: e.target.value,
                                })
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm capitalize text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                        >
                            {OPERATION_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {!operation.geofence && (
                    <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                        This operation has no geofence, so areas can be placed
                        anywhere.
                    </p>
                )}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {stats.map(({ label, value }, i) => (
                    <motion.div
                        key={label}
                        {...rowFade(i)}
                        className={`${CARD} px-4 py-3`}
                    >
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {label}
                        </p>
                        <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                            {value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Map + side column */}
            <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
                <motion.div
                    {...fadeIn(0.1)}
                    className={`${CARD} overflow-hidden h-[420px] lg:h-[640px]`}
                >
                    <OperationMap
                        operationGeofence={operation.geofence}
                        areas={areaList}
                        selectedAreaId={selectedAreaId}
                        onSelectArea={(id) => !adding && setSelectedAreaId(id)}
                        onDraftGeofenceChange={
                            adding ? setDraftGeofence : undefined
                        }
                        resetKey={resetKey}
                        point={adding ? draftPoint : null}
                        onPointChange={adding ? handlePoint : undefined}
                        pinning={adding && pinning}
                        focus={focus}
                    />
                </motion.div>

                <div className="flex flex-col gap-4 lg:max-h-[640px] lg:overflow-y-auto hide-scrollbar">
                    {adding ? (
                        <AreaForm
                            point={draftPoint}
                            geofence={draftGeofence}
                            pinning={pinning}
                            onTogglePin={() => setPinning((p) => !p)}
                            onCancel={cancelAdding}
                            onSubmit={handleCreateArea}
                            submitting={createArea.isPending}
                            error={areaError}
                            operationGeofence={operation.geofence}
                        />
                    ) : (
                        <>
                            <motion.section
                                {...fadeIn(0.15)}
                                className={`${CARD} p-4`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-semibold text-gray-800 dark:text-white">
                                        Areas
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            {areaList.length}
                                        </span>
                                    </h2>
                                    <button
                                        onClick={startAdding}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition cursor-pointer"
                                    >
                                        <IoAddCircleOutline size={18} />
                                        Add area
                                    </button>
                                </div>

                                {areaList.length === 0 ? (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-8 text-center">
                                        <IoLocationOutline
                                            size={24}
                                            className="text-gray-400"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            No areas yet
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Add the first area to start
                                            stationing personnel.
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {areaList.map((area, i) => {
                                            const active =
                                                area.active_personnel_count;
                                            const hasLimit = area.capacity > 0;
                                            const full =
                                                hasLimit &&
                                                active >= area.capacity;
                                            const pct = hasLimit
                                                ? Math.min(
                                                      100,
                                                      Math.round(
                                                          (active /
                                                              area.capacity) *
                                                              100
                                                      )
                                                  )
                                                : 0;
                                            const isSelected =
                                                area.id === selectedAreaId;

                                            return (
                                                <motion.li
                                                    key={area.id}
                                                    {...rowFade(i)}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setSelectedAreaId(
                                                                area.id
                                                            )
                                                        }
                                                        aria-pressed={
                                                            isSelected
                                                        }
                                                        className={`w-full text-left rounded-lg border px-3 py-2.5 transition cursor-pointer ${
                                                            isSelected
                                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                                {area.name}
                                                            </span>
                                                            <span
                                                                className={`text-xs ${
                                                                    full
                                                                        ? "text-amber-600 dark:text-amber-400"
                                                                        : "text-gray-500 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                {active}/
                                                                {hasLimit
                                                                    ? area.capacity
                                                                    : "∞"}
                                                            </span>
                                                        </div>
                                                        {hasLimit && (
                                                            <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        full
                                                                            ? "bg-amber-500"
                                                                            : "bg-green-500"
                                                                    }`}
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </button>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </motion.section>

                            {selectedArea && (
                                <AreaPersonnelPanel
                                    key={selectedArea.id}
                                    area={selectedArea}
                                    candidates={tanods}
                                    assignedUserIds={assignedUserIds}
                                    onDeleteArea={handleDeleteArea}
                                    deleting={removeArea.isPending}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperationDetailsPage;
