import { motion } from "framer-motion";
import useAppState from "../../store/useAppState";
import { useQueryClient } from "@tanstack/react-query";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const RequestDetails = ({ requestId, onClose, tanodLocations }) => {
    const { darkMode } = useAppState();
    const queryClient = useQueryClient();
    const requests = queryClient.getQueryData(["request"]);
    const requestDetails = requests?.find((r) => r.id === requestId);

    // find tanod currently assigned to this request
    const assignedTanod = Object.values(tanodLocations).find(
        (loc) => String(loc.requestId) === String(requestId)
    );

    const distance =
        assignedTanod && requestDetails
            ? haversineDistance(
                  Number(requestDetails.latitude),
                  Number(requestDetails.longitude),
                  Number(assignedTanod.lat),
                  Number(assignedTanod.lng)
              ).toFixed(2)
            : null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`w-[320px] p-5 border-l rounded-lg shadow-lg relative flex-shrink-0 
                ${
                    darkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-200"
                }
            `}
        >
            <button
                onClick={onClose}
                className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition"
            >
                ✕
            </button>

            {requestDetails ? (
                <>
                    <h2
                        className={`text-xl font-bold mb-4 ${
                            darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        Incident Request {requestDetails.id}
                    </h2>

                    <div className="space-y-3">
                        <p
                            className={`text-sm font-medium ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        >
                            <span className="font-semibold text-green-600">
                                Category:
                            </span>{" "}
                            {requestDetails.category_name}
                        </p>

                        <p
                            className={`text-sm font-medium ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        >
                            <span className="font-semibold text-green-600">
                                Coordinates:
                            </span>{" "}
                            {requestDetails.latitude},{" "}
                            {requestDetails.longitude}
                        </p>

                        {distance ? (
                            <p
                                className={`text-sm font-medium ${
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                            >
                                <span className="font-semibold text-green-600">
                                    Distance to Tanod:
                                </span>{" "}
                                {distance} km
                            </p>
                        ) : (
                            <p
                                className={`text-sm italic ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                                No active tanod assigned.
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <p
                    className={`text-sm italic ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                    No details found in cache.
                </p>
            )}
        </motion.div>
    );
};

export default RequestDetails;
