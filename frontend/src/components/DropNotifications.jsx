import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    notifications,
    updateNotification,
} from "../functions/Notification";
import useAppState from "../store/useAppState";
import { MdReport } from "react-icons/md";
import { MdPeopleAlt } from "react-icons/md";
import { IoWarningSharp } from "react-icons/io5";

const DropNotifications = ({ dropdownRef, dropdownOpen }) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => notifications({ base_url, token }),
    });
    
    const getNotificationLink = (notification) => {
        switch (notification.notification_type) {
            case "violators-notification":
                return `/violators-details/${notification.item_id}`;
            case "request-notification":
                return `/incident-request`;
            case "report-notification":
                return `/report-details/${notification.item_id}`;
            default:
                return "#";
        }
    };

    const mutation = useMutation({
        mutationFn: ({ id }) => updateNotification({ base_url, token, id }),
        onSuccess: () => {
            queryClient.invalidateQueries(["notifications"]);
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
                        data.map((notification) => (
                            <Link
                                key={notification.id}
                                to={getNotificationLink(notification)}
                                onClick={() =>
                                    handleNotificationClick(notification.id)
                                }
                                className="flex flex-row items-center gap-3 text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-2 py-1.5"
                            >
                                {notification.notification_type ===
                                "violators-notification" ? (
                                    <MdPeopleAlt color="tomato" size={22} />
                                ) : notification.notification_type ===
                                  "request-notification" ? (
                                    <IoWarningSharp color="tomato" size={22} />
                                ) : (
                                    <MdReport color="tomato" size={22} />
                                )}

                                <span>
                                    {notification.message ??
                                        notification.notification_type}
                                </span>
                            </Link>
                        ))
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
