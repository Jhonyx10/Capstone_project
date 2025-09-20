import { motion, AnimatePresence } from "framer-motion";
import useAppState from "../store/useAppState";
import Barangay from "../assets/img/Barangay.png"; // adjust path to your image

const ZonalIncidentCard = () => {
    const { open } = useAppState();
    const zones = [
        {
            image: Barangay,
            zoneName: "Zone 5",
            totalReports: 9000000,
            reports: [
                { type: "Curfew", count: 120000 },
                { type: "Accident", count: 50000 },
                { type: "Robbery", count: 20000 },
                { type: "Others", count: 10000 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 6",
            totalReports: 15,
            reports: [
                { type: "Curfew", count: 7 },
                { type: "Car Accident", count: 3 },
                { type: "Robbery", count: 4 },
                { type: "Others", count: 1 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 7",
            totalReports: 8,
            reports: [
                { type: "Curfew", count: 3 },
                { type: "Car Accident", count: 2 },
                { type: "Robbery", count: 2 },
                { type: "Others", count: 1 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 8",
            totalReports: 22,
            reports: [
                { type: "Curfew", count: 10 },
                { type: "Car Accident", count: 7 },
                { type: "Robbery", count: 3 },
                { type: "Others", count: 2 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 9",
            totalReports: 11,
            reports: [
                { type: "Curfew", count: 5 },
                { type: "Car Accident", count: 3 },
                { type: "Robbery", count: 2 },
                { type: "Others", count: 1 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 10",
            totalReports: 18,
            reports: [
                { type: "Curfew", count: 9 },
                { type: "Car Accident", count: 4 },
                { type: "Robbery", count: 3 },
                { type: "Others", count: 2 },
            ],
        },
        {
            image: Barangay,
            zoneName: "Zone 11",
            totalReports: 25,
            reports: [
                { type: "Curfew", count: 12 },
                { type: "Car Accident", count: 6 },
                { type: "Robbery", count: 5 },
                { type: "Others", count: 2 },
            ],
        },
    ];

    return (
        <motion.div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto hide-scrollbar pr-1">
            {zones.map((zone, index) => (
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
                            src={zone.image}
                            alt={zone.zoneName}
                            className="w-12 h-12 object-contain"
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-white mt-1">
                            {zone.zoneName}
                        </p>
                    </div>

                    {/* Report Breakdown */}
                    <div className="flex flex-col gap-[2px] text-[11px] text-gray-600 dark:text-gray-300">
                        {zone.reports.map((report, i) => (
                            <div
                                key={i}
                                className="flex justify-between border-b border-gray-200 dark:border-slate-700 last:border-0"
                            >
                                <p className="whitespace-nowrap block">
                                    {(report.type.length > 8) & open
                                        ? report.type.slice(0, 8) + "..."
                                        : report.type}
                                </p>
                                <p className="font-medium">{report.count}</p>
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
                            {zone.totalReports}
                        </p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ZonalIncidentCard;
