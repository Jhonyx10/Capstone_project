import { motion } from "framer-motion";
import useZoneIncidentDetails from "../../hooks/useZonesIncidentDetails";
import Barangay from "../../assets/img/Barangay.png";
import { useQuery } from "@tanstack/react-query";
import { zoneAverageResponseTimeById } from "../../functions/Analytics";
import useAppState from "../../store/useAppState";

const ZoneDetails = ({ zone, onClose}) => {
    const { data } = useZoneIncidentDetails();
    const { token, base_url} = useAppState();

    const zoneDetails = data?.find((z) => z.zone.id === zone.id);

    const { data: averageTime } = useQuery({
        queryKey: ["zone_response_time", zone.id],
        queryFn: () =>
            zoneAverageResponseTimeById({ base_url, token, zoneId: zone.id }),
        enabled: !!zone?.id,
    });


    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="w-[300px] bg-white dark:bg-slate-800 p-4 border-l rounded-lg border-gray-200 dark:border-slate-700 shadow-lg flex-shrink-0"
        >
            <div className="items-center mb-3 p-2">
                <div className="flex items-center gap-2">
                    <img
                        src={Barangay}
                        alt={zoneDetails?.zone?.zone_name}
                        className="w-14 h-14 object-contain rounded-lg"
                    />
                    {!zoneDetails ? (
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {zone?.zone_name}
                        </h2>
                    ) : (
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {zoneDetails?.zone?.zone_name}
                        </h2>
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 underline">
                    Categories
                </p>
                {!zoneDetails || !zoneDetails.categories?.length ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No incident data available for this zone.
                    </p>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="mt-2 border-r border-gray-200 dark:border-gray-700 pr-2">
                            {zoneDetails.categories.map((c) => (
                                <p
                                    key={c.category.id}
                                    className="text-sm text-gray-600 dark:text-gray-300"
                                >
                                    {c.category.category_name}: {c.count}
                                </p>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Total incidents: {zoneDetails.zone_total}
                        </p>
                    </div>
                )}
                {!averageTime || averageTime.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        No Response Data.
                    </p>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Avg response time:{" "}
                        {averageTime.avg_response_time ?? "N/A"} mins
                    </p>
                )}
                <button
                    onClick={onClose}
                    className="absolute right-2 top-0 text-gray-500 hover:text-red-500 transition"
                >
                    ✕
                </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300"></p>
        </motion.div>
    );
};

export default ZoneDetails;
