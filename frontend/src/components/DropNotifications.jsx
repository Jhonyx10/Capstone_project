import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications, updateNotification } from "../functions/Notification";
import useAppState from "../store/useAppState";
import { MdReport, MdPeopleAlt } from "react-icons/md";
import { IoWarningSharp, IoEye } from "react-icons/io5";

// One place that says where each notification type goes and which icon it uses.
// For sightings, item_id is the watch list entry's id.
const TYPES = {
    "violators-notification": {
        Icon: MdPeopleAlt,
        to: (n) => `/violators-details/${n.item_id}`,
    },
    "request-notification": {
        Icon: IoWarningSharp,
        to: () => "/incident-request",
    },
    "report-notification": {
        Icon: MdReport,
        to: (n) => `/report-details/${n.item_id}`,
    },
    "sighting-notification": {
        Icon: IoEye,
        to: (n) => `/watch-list-details/${n.item_id}`,
    },
};

const DropNotifications = ({ dropdownRef, dropdownOpen }) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => notifications({ base_url, token }),
    });

    const mutation = useMutation({
        mutationFn: ({ id }) => updateNotification({ base_url, token, id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const handleNotificationClick = (id) => {
        mutation.mutate({ id });
    };

    return (
        <AnimatePresence>
            {dropdownOpen && (
                <motion.div
                    ref={dropdownRef}
                    className="absolute top-10 space-y-1 z-20 right-22 mt-2 w-50 md:px-2 
               dark:bg-slate-700 bg-white border-t border-gray-200 dark:border-gray-950 
               rounded-lg shadow-lg py-2 mr-6
               max-h-44 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] 
               [&::-webkit-scrollbar]:hidden"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {data?.length > 0 ? (
                        data.map((notification) => {
                            const config =
                                TYPES[notification.notification_type];
                            const Icon = config?.Icon ?? MdReport;

                            return (
                                <Link
                                    key={notification.id}
                                    to={config ? config.to(notification) : "#"}
                                    onClick={() =>
                                        handleNotificationClick(notification.id)
                                    }
                                    className="flex flex-row items-center gap-3 text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-2 py-1.5"
                                >
                                    <Icon color="tomato" size={22} />

                                    <span>
                                        {notification.body ??
                                            notification.message ??
                                            notification.title ??
                                            notification.notification_type}
                                    </span>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-300 px-2">
                            No notifications yet
                        </p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DropNotifications;
