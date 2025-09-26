import { motion, AnimatePresence } from "framer-motion";
import useAppState from "../store/useAppState";
import Barangay from "../assets/img/Barangay.png"; // adjust path to your image
import useZoneIncidentDetails from "../hooks/useZonesIncidentDetails";

const ZonalIncidentCard = () => {
    const { open } = useAppState();
    const { data } = useZoneIncidentDetails()


    return (
        <motion.div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto hide-scrollbar pr-1">
            {data?.map((zoneData, index) => (
                <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="grid grid-cols-3 bg-gray-50 dark:bg-slate-800 p-2 rounded-md shadow-sm items-start w-full"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    {/* Zone Image + Name */}
                    <div className="flex flex-col items-center">
                        <img
                            src={Barangay} // fallback image
                            alt={zoneData.zone.zone_name}
                            className="w-12 h-12 object-contain"
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-white mt-1">
                            {zoneData.zone.zone_name}
                        </p>
                    </div>

                    {/* Report Breakdown */}
                    <div className="flex flex-col gap-[2px] text-[11px] text-gray-600 dark:text-gray-300">
                        {zoneData.categories.map((cat, i) => (
                            <div
                                key={i}
                                className="flex justify-between border-b border-gray-200 dark:border-slate-700 last:border-0"
                            >
                                <p className="whitespace-nowrap block">
                                    {(cat.category.category_name.length > 8) &
                                    open
                                        ? cat.category.category_name.slice(
                                              0,
                                              8
                                          ) + "..."
                                        : cat.category.category_name}
                                </p>
                                <p className="font-medium">{cat.count}</p>
                            </div>
                        ))}
                    </div>

                    {/* Zone Info */}
                    <div className="flex flex-col justify-center ml-4 pr-1">
                        <motion.p
                            key={open ? "open" : "closed"}
                            initial={{ x: open ? -20 : 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: open ? 20 : -20, opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                            }}
                            className={`text-xs font-medium text-gray-700 dark:text-white whitespace-nowrap pr-1 ${
                                open ? "text-center" : ""
                            }`}
                        >
                            {!open && (
                                <motion.span
                                    key="violations-text"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="hidden md:inline mr-1"
                                >
                                    Reports
                                </motion.span>
                            )}
                            Count
                        </motion.p>
                        <p className="text-center text-xl mt-4 font-semibold text-green-600">
                            {zoneData.zone_total}
                        </p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ZonalIncidentCard;
