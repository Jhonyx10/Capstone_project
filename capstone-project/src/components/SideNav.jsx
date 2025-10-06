import { useState } from "react";
// assets
import { AiFillHome } from "react-icons/ai";
import { MdPeopleAlt } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { MdReport } from "react-icons/md";
import { IoCall, IoBook, IoAnalytics } from "react-icons/io5";
import { FaMapLocationDot } from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import { IoAlertSharp } from "react-icons/io5";
// components and hooks
import useAppState from "../store/useAppState";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ToggleClose from "./ToggleClose";
import TitleSection from "./TittleSection";
import Option from "./Option";

const SideNav = () => {
    const { open, setOpen, selected, setSelected, mapOpen, setMapOpen } =
        useAppState();
    

    return (
        <motion.nav
            layout
            initial={false}
            animate={{
                width: open ? 225 : 64,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="sticky top-0 h-screen shrink-0 border-r border-slate-300 
               dark:border-slate-950 dark:bg-slate-900 bg-white p-2 flex flex-col justify-between z-50"
        >
            <div className="mr-1">
                <TitleSection open={open} />
                <div className="flex flex-col space-y-1">
                    <Link to="/dashboard">
                        <Option
                            Icon={AiFillHome}
                            title="Dashboard"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                    <Link to="/analytics">
                        <Option
                            Icon={IoAnalytics}
                            title="Analytics"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>

                    {/* Dropdown for Map */}
                    <div>
                        <div
                            className="mb-1"
                            onClick={() => setMapOpen(!mapOpen)}
                        >
                            <Option
                                Icon={FaMapLocationDot}
                                title="Map"
                                selected={selected}
                                setSelected={setSelected}
                                open={open}
                            />
                        </div>

                        {mapOpen && (
                            <motion.div
                                className={`flex flex-col space-y-1 overflow-hidden relative ${
                                    open ? "ml-6" : "ml-0"
                                }`}
                            >
                                <Link to="/map">
                                    <Option
                                        Icon={IoLocationSharp}
                                        title="HeatMap"
                                        selected={selected}
                                        setSelected={setSelected}
                                        open={open}
                                    />
                                </Link>
                                <Link to="/incident-request">
                                    <Option
                                        Icon={IoAlertSharp}
                                        title="Incident Request"
                                        selected={selected}
                                        setSelected={setSelected}
                                        open={open}
                                    />
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    <Link to="/reports">
                        <Option
                            Icon={BiSolidReport}
                            title="Reports"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                    <Link to="/violators">
                        <Option
                            Icon={MdReport}
                            title="Violators"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                    <Link to="/volunteers">
                        <Option
                            Icon={MdPeopleAlt}
                            title="Volunteers"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                </div>
            </div>

            <motion.div layout className="flex flex-col space-y-14 mr-1">
                <div className="flex flex-col space-y-1 border-t pt-2 border-slate-300 dark:border-slate-950">
                    <Link to="/hotline">
                        <Option
                            Icon={IoCall}
                            title="Hotline"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                    <Link to="/hotline">
                        <Option
                            Icon={IoBook}
                            title="Help"
                            selected={selected}
                            setSelected={setSelected}
                            open={open}
                        />
                    </Link>
                </div>

                {/* ToggleClose stays at the very bottom */}
                <ToggleClose open={open} setOpen={setOpen} />
            </motion.div>
        </motion.nav>
    );
};
export default SideNav;
