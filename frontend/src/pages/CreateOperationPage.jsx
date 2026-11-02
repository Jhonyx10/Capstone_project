import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBack, IoLocationSharp } from "react-icons/io5";
import OperationMap from "../components/map/OperationMap";
import useOperations from "../hooks/useOperations";
import { OPERATION_STATUSES } from "../components/operations/StatusBadge";
import { getApiError } from "../functions/OperationApi";
import { getCenter, round8 } from "../functions/geo";
import useZones from "../hooks/useZones";
import { fadeIn } from "../utils/motion"; 

const CARD =
    "rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900";

const INPUT =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:[color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400";

const LABEL =
    "flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200";

const StepBadge = ({ n }) => (
    <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300"
    >
        {n}
    </span>
);

const CreateOperationPage = () => {
    const navigate = useNavigate();
    const { create } = useOperations();

    const [name, setName] = useState("");
    const [status, setStatus] = useState("upcoming");
    const [point, setPoint] = useState(null); // { lat, lng }
    const [geofence, setGeofence] = useState(null); // GeoJSON Polygon
    const [pinning, setPinning] = useState(false);
    const [eventDate, setEventDate] = useState("");
    const [error, setError] = useState("");
    const { data: zones = [], isLoading: zonesLoading } = useZones();
    const [zoneId, setZoneId] = useState("");
    const zone = zones.find((z) => String(z.id) === zoneId);

    const handlePoint = (p) => {
        setPoint(p);
        setPinning(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) return setError("Operation name is required.");
        if (!geofence)
            return setError("Draw the operation's geofence on the map.");

        const location = point ?? getCenter(geofence);

        try {
            const operation = await create.mutateAsync({
                name: name.trim(),
                status,
                zone_id: zoneId || null,
                event_date: eventDate || null,
                latitude: round8(location.lat),
                longitude: round8(location.lng),
                geofence,
            });
            navigate(`/operations/${operation.id}`);
        } catch (err) {
            setError(getApiError(err, "Could not create the operation."));
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div {...fadeIn()} className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/operations")}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                >
                    <IoArrowBack aria-hidden="true" /> Operations
                </button>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    New operation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Fill in the details, then draw the operation's boundary on
                    the map.
                </p>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                {/* Form */}
                <motion.form
                    {...fadeIn(0.05)}
                    onSubmit={handleSubmit}
                    className={`${CARD} flex flex-col lg:h-[640px] overflow-hidden`}
                >
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-4">
                        <label className={LABEL}>
                            Name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={INPUT}
                                placeholder="e.g. Barangay fiesta security"
                            />
                        </label>

                        <label className={LABEL}>
                            Zone
                            <select
                                value={zoneId}
                                onChange={(e) => setZoneId(e.target.value)}
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="">
                                    {zonesLoading
                                        ? "Loading zones..."
                                        : "No zone"}
                                </option>
                                {zones.map((z) => (
                                    <option key={z.id} value={z.id}>
                                        {z.zone_name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className={LABEL}>
                                Status
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={`${INPUT} capitalize cursor-pointer`}
                                >
                                    {OPERATION_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={LABEL}>
                                Event date
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) =>
                                        setEventDate(e.target.value)
                                    }
                                    className={`${INPUT} cursor-pointer`}
                                />
                            </label>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Step 1 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                <StepBadge n={1} />
                                Pin the location
                                <span className="text-xs font-normal text-gray-400">
                                    optional
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPinning((p) => !p)}
                                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                                    pinning
                                        ? "border-green-600 bg-green-600 text-white"
                                        : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                }`}
                            >
                                <IoLocationSharp aria-hidden="true" />
                                {pinning
                                    ? "Click the map to drop the pin"
                                    : "Pin location on map"}
                            </button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {point
                                    ? `${point.lat.toFixed(
                                          6
                                      )}, ${point.lng.toFixed(
                                          6
                                      )}. Drag the pin to adjust.`
                                    : "Skipped: the center of the geofence is used."}
                            </span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                <StepBadge n={2} />
                                Draw the geofence
                                <span className="text-xs font-normal text-gray-400">
                                    required
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Use the polygon tool at the top-left of the map:
                                click to add corners and click the first corner
                                to finish. Drawing again replaces it.
                            </p>
                            <span
                                className={`text-xs font-medium ${
                                    geofence
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-gray-400"
                                }`}
                            >
                                {geofence
                                    ? "Geofence drawn."
                                    : "No geofence yet."}
                            </span>
                        </div>
                    </div>

                    {/* Footer stays visible while the fields scroll */}
                    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                        {error && (
                            <p className="mb-3 text-sm text-red-500">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={create.isPending}
                            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 transition cursor-pointer"
                        >
                            {create.isPending
                                ? "Saving..."
                                : "Create operation"}
                        </button>
                    </div>
                </motion.form>

                {/* Map */}
                <motion.div
                    {...fadeIn(0.1)}
                    className={`${CARD} overflow-hidden h-[420px] lg:h-[640px]`}
                >
                    <OperationMap
                        onDraftGeofenceChange={setGeofence}
                        point={point}
                        onPointChange={handlePoint}
                        pinning={pinning}
                        zones={zones}
                        selectedZoneId={zoneId}
                        onSelectZone={(id) =>
                            setZoneId((prev) =>
                                prev === String(id) ? "" : String(id)
                            )
                        }
                        focus={
                            zone
                                ? {
                                      latitude: Number(zone.latitude),
                                      longitude: Number(zone.longitude),
                                      zoom: 16,
                                  }
                                : null
                        }
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default CreateOperationPage;
