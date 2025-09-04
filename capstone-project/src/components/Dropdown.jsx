import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import Settings from "../assets/animation/Settings.json";
import Profile from "../assets/animation/Profile.json";
import { IoIosLogOut } from "react-icons/io";
import Logout from "./Logout";

const DropDown = ({ dropdownRef, dropdownOpen }) => {
    return (
        <div>
            {dropdownOpen && (
                <motion.div
                    ref={dropdownRef}
                    className="absolute top-10 space-y-1 z-20 right-3 mt-2  w-28 md:px-1  dark:bg-slate-700 bg-white border-t-1 border-gray-200 dark:border-gray-950  rounded-lg shadow-lg py-2 mr-6"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                    layout
                >
                    <Link
                        // to={`/user-profile/${userId}`}
                        className="flex flex-row items-center pt-1 text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md"
                    >
                        <Lottie
                            className="size-6 mr-1"
                            animationData={Profile}
                            loop={false}
                            autoPlay={true}
                        />
                        Profile
                        {/* {userProfile?.profile?.name || "Profile"} */}
                    </Link>

                    <Link
                        to="/settings"
                        className="flex flex-row items-center  text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md"
                    >
                        <Lottie
                            className="w-6 h-6 mr-1"
                            animationData={Settings}
                            loop={false}
                            autoPlay={true}
                        />
                        Settings
                    </Link>
                    <div className="flex flex-row space-x-2 items-center dark:hover:bg-gray-500 rounded-md p-1">
                        <IoIosLogOut color="#83e81e" />
                        <p className="flex flex-row items-center text-sm dark:text-white">
                            <Logout />
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DropDown;
