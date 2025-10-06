import { motion } from "framer-motion";
import { locationDetails } from "../../functions/LocationApi";
import { useQuery } from "@tanstack/react-query";
import useAppState from "../../store/useAppState";

const LocationDetails = ({ locationId, onClose}) => {
    const { token, base_url, darkMode } = useAppState();

    // Fetch location details
    const { data, isLoading, isError } = useQuery({
        queryKey: ["location_details", locationId],
        queryFn: () => locationDetails({ base_url, token, locationId }),
        enabled: !!locationId,
    });

    if (isLoading)
        return (
            <motion.div
                className="w-[300px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Loading location details...
                </p>
            </motion.div>
        );

    if (isError || !data)
        return (
            <motion.div
                className="w-[300px] p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p className="text-red-500 text-sm">
                    Failed to load location details.
                </p>
            </motion.div>
        );

    // Extract data from API response
    const location = data?.location;
    const details = location?.location_details;
    const categories = location?.reports_by_category || [];

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="w-[320px] bg-white dark:bg-slate-800 p-4 border-l rounded-lg border-gray-200 dark:border-slate-700 shadow-lg relative flex-shrink-0"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute right-2 top-2 text-gray-500 hover:text-red-500 transition"
            >
                ✕
            </button>

            {/* Location Header */}
            <div className="items-center gap-3 mb-3">
                <img
                    src={details?.landmark}
                    alt={details?.location_name}
                    className="w-70 h-30 object-fit rounded-lg border"
                />
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {details?.location_name || "Unknown Location"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Zone: {details?.zone?.zone_name || "N/A"}
                    </p>
                </div>
            </div>

            {/* Total Reports */}
            <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                    Total Reports:{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                        {location?.total_reports ?? 0}
                    </span>
                </p>
            </div>

            {/* Category Breakdown */}
            <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 underline mb-1">
                    Reports by Category
                </p>

                {categories.length > 0 ? (
                    <ul className="space-y-1">
                        {categories.map((cat) => (
                            <li
                                key={cat.category_id}
                                className="text-sm text-gray-700 dark:text-gray-300 flex justify-between"
                            >
                                <span>{cat.category_name}</span>
                                <span className="font-semibold">
                                    {cat.total}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">
                        No reports available.
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default LocationDetails;
