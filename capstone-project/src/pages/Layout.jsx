import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import useAppState from "../store/useAppState";
import DropDown from "../components/Dropdown";
import { useEffect, useRef } from "react";

const Layout = () => {
    const { dropdownOpen, setDropdownOpen } = useAppState();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [dropdownOpen, dropdownRef, setDropdownOpen]);

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
