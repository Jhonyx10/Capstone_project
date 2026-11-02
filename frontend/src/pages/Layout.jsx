import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import useAppState from "../store/useAppState";
import DropDown from "../components/Dropdown";
import DropNotifications from "../components/Dropnotifications";
import { useEffect, useRef } from "react";

const Layout = () => {
    const {
        dropdownOpen,
        setDropdownOpen,
        setDropNotificationsOpen,
        dropNotificationsOpen,
    } = useAppState();
    const dropdownRef = useRef(null);
    const dropNotificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (dropdownRef &&
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target)) ||
                (dropNotificationsRef &&
                    dropNotificationsRef.current &&
                    !dropNotificationsRef.current.contains(event.target))
            ) {
                setDropdownOpen(false);
                setDropNotificationsOpen(false);
            }
        };

        if (dropdownOpen || dropNotificationsOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [dropdownOpen, dropdownRef, setDropdownOpen, dropNotificationsOpen, dropNotificationsRef, setDropNotificationsOpen]);

    return (
        <motion.div
            layout
            className="flex bg-gray-50 dark:bg-slate-700"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <SideNav />
            <motion.div
                layout="position"
                className="h-[100vh] w-full dark:bg-slate-800 overflow-y-auto overflow-x-auto"
            >
                <motion.div className="position">
                    <TopNav />
                    <DropNotifications
                        dropdownOpen={dropNotificationsOpen}
                        dropdownRef={dropNotificationsRef}
                    />
                    <DropDown
                        dropdownOpen={dropdownOpen}
                        dropdownRef={dropdownRef}
                    />
                    <motion.div className="z-30">
                        <Outlet />
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Layout;
