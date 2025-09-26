import { FaMoon } from "react-icons/fa";
import { CiLight } from "react-icons/ci";
import Avatar from "../assets/img/Avatar.jpg";
import { IoIosArrowDown } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { GoBellFill } from "react-icons/go";

import { motion } from "framer-motion";
import Bell from "../assets/animation/Bell.json";
import Search from "../assets/animation/Search.json";
import useAppState from "../store/useAppState";
import useWeather from "../hooks/useWeather";
import Lottie from "lottie-react";
import React, { useRef } from "react";

const TopNav = () => {
    const { user } = useAppState();
    const {
        currentDateTime,
        weather,
        darkMode,
        toggleDarkMode,
        dropdownOpen,
        setDropdownOpen,
        open,
    } = useAppState();
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    // trigger weather fetch (updates Zustand internally)
    useWeather();

    return (
        <motion.nav
            layout
            className="z-10 sticky top-0 border-b border-slate-300 dark:border-slate-950 dark:bg-slate-900 bg-white p-2.5 pl-5 pr-5"
        >
            <motion.div layout className="flex justify-between items-center">
                {/* time + weather */}
                <motion.div layout className="flex md:space-x-1 items-center">
                    <motion.img
                        layout
                        className="size-6 hidden md:block rounded-md"
                        src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@2x.png`}
                        alt="Weather Icon"
                    />
                    <motion.p
                        layout
                        className="text-xs  pr-2 font-extralight dark:text-white"
                    >
                        {weather?.main?.temp
                            ? `${Math.round(weather.main.temp)}°C`
                            : "N/A"}
                    </motion.p>
                    <motion.p
                        layout
                        key="label"
                        // initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-extralight hidden lg:block dark:text-white"
                    >
                        {currentDateTime}
                    </motion.p>
                </motion.div>

                {/* search bar */}
                {/* <motion.div layout className="relative">
                    <div>
                        <FaSearch
                            className="absolute top-1.5 left-1"
                            size={20}
                            color="#22c55e"
                        />
                        <Lottie
                            className="absolute size-8"
                            animationData={Search}
                            loop={false}
                            autoPlay={true}
                            lottieRef={searchRef}
                        />
                    </div>
                    search bar
                    <input
                        type="text"
                        placeholder="Search"
                        className={`transition-all duration-300 text-sm text-gray-700 
        dark:text-gray-300 dark:bg-gray-500 bg-gray-200 
        dark:border-gray-600 border-2 border-gray-200 
        rounded-md border-opacity-5 placeholder-gray-500 
        dark:placeholder-gray-100 placeholder-opacity-50 pl-6 p-1 sm:w-xs
        
       `}
                    />
                </motion.div>
 */}
                {/* profile + notifications */}
                <div>
                    <motion.div
                        layout
                        className="flex flex-row space-x-1 pr-2 items-center justify-center"
                    >
                        <motion.div
                            layout
                            // initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: 0.5,
                            }}
                            onClick={toggleDarkMode}
                            className="flex items-center justify-center rounded-md size-8 dark:bg-slate-600 bg-gray-100"
                        >
                            {!darkMode ? (
                                <FaMoon size={11} color="black"></FaMoon>
                            ) : (
                                <CiLight color="black" />
                            )}
                        </motion.div>
                        <motion.div style={{ width: 32 }}>
                            <GoBellFill color="#22c55e" size={20} />
                        </motion.div>
                        <div className="w-px h-6 bg-gray-300 dark:bg-white mr-2"></div>
                        <motion.div layout>
                            <img
                                src={Avatar}
                                className="rounded-full border-2 dark:border-black border-gray-400"
                                style={{ width: 32 }}
                            />
                        </motion.div>
                        <motion.div
                            layout
                            className="flex-col hidden lg:block"
                            ref={dropdownRef}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from reaching document
                                setDropdownOpen(!dropdownOpen);
                            }}
                        >
                            <span className="block text-xs font-semibold dark:text-white ">
                                Alpha Roger
                            </span>
                            <span className="block font-light text-xs text-slate-500 dark:text-gray-400">
                                {user.role}
                            </span>
                        </motion.div>
                        <motion.div
                            layout
                            className="lg:pl-2"
                            ref={dropdownRef}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from reaching document
                                setDropdownOpen(!dropdownOpen);
                            }}
                        >
                            <IoIosArrowDown
                                size={12}
                                className={`transition-transform dark:text-white text-black ${
                                    dropdownOpen && "rotate-180"
                                }`}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.nav>
    );
};

export default TopNav;
