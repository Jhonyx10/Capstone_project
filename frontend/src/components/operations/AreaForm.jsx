import { useState } from "react";
import { motion } from "framer-motion";
import { IoLocationSharp } from "react-icons/io5";
import { isPointInPolygon } from "../../functions/geo";
import { fadeIn } from "../../utils/motion"; // <-- adjust path

const INPUT =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400";

const AreaForm = ({
    point,
    geofence,
    pinning,
    onTogglePin,
    onCancel,
    onSubmit,
    submitting,
    error,
    operationGeofence,
}) => {
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState(0);
    const [localError, setLocalError] = useState("");

    const outside =
        point &&
        operationGeofence &&
        !isPointInPolygon(point.lng, point.lat, operationGeofence);

    const submit = (e) => {
        e.preventDefault();
        if (!name.trim()) return setLocalError("Area name is required.");
        if (!point) return setLocalError("Pin the area's location on the map.");
        if (outside)
            return setLocalError(
                "The pin must be inside the operation geofence."
            );
        setLocalError("");
        onSubmit({ name: name.trim(), capacity: Number(capacity) || 0 });
    };

    return (
        <motion.form
            {...fadeIn()}
            onSubmit={submit}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
            <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">
                    New area
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Pin where personnel will be stationed.
                </p>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                Name
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT}
                    placeholder="e.g. Post 1"
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                Capacity
                <input
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={INPUT}
                />
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    0 means no limit.
                </span>
            </label>

            <div className="flex flex-col gap-1.5">
                <button
                    type="button"
                    onClick={onTogglePin}
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
                <span
                    className={`text-xs ${
                        outside
                            ? "text-red-500"
                            : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                    {point
                        ? outside
                            ? "This pin is outside the operation geofence."
                            : `${point.lat.toFixed(6)}, ${point.lng.toFixed(
                                  6
                              )}. Drag the pin to adjust.`
                        : "Required."}
                </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional: draw the area's boundary with the polygon tool on the
                map.
                {geofence && (
                    <span className="ml-1 text-green-600 dark:text-green-400">
                        Boundary drawn.
                    </span>
                )}
            </p>

            {(localError || error) && (
                <p className="text-sm text-red-500">{localError || error}</p>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 transition cursor-pointer"
                >
                    {submitting ? "Saving..." : "Save area"}
                </button>
            </div>
        </motion.form>
    );
};

export default AreaForm;
