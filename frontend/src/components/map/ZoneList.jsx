import useZones from "../../hooks/useZones";
import { motion } from "framer-motion";
import Barangay from "../../assets/img/Barangay.png";

const ZoneList = ({ setSelectedZone }) => {
    const { data: zones } = useZones();

    return (
        <motion.div className="max-h-full overflow-y-auto hide-scrollbar space-y-3 pr-2">
            {zones?.map((zoneData, index) => (
                <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl shadow hover:shadow-md transition-all duration-200 cursor-pointer"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setSelectedZone(zoneData)}
                >
                    <div className="flex-shrink-0">
                        <img
                            src={Barangay}
                            alt={zoneData.zone_name}
                            className="w-14 h-14 object-contain rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-base font-semibold text-gray-800 dark:text-white">
                            {zoneData.zone_name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Click to view details
                        </span>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ZoneList;
