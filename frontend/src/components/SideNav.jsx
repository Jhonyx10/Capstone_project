// assets
import { AiFillHome } from "react-icons/ai";
import { MdPeopleAlt, MdReport } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { FaMapLocationDot } from "react-icons/fa6";
import {
    IoCall,
    IoCalendar,
    IoAnalytics,
    IoLocationSharp,
    IoAlertSharp,
    IoFolderOpenSharp,
    IoFileTrayStacked,
    IoPeopleCircleSharp,
    IoApps,
    IoChevronDown,
    IoShieldCheckmark,
} from "react-icons/io5";
// components and hooks
import useAppState from "../store/useAppState";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TitleSection from "./TittleSection";
import Option from "./Option";

// Edit this list to add, move, or rename links.
// An item with `children` becomes a dropdown; `dropdown` says which
// open/closed state in the store controls it.
const NAV_GROUPS = [
    {
        label: "Overview",
        items: [
            { to: "/dashboard", title: "Dashboard", Icon: AiFillHome },
            { to: "/analytics", title: "Analytics", Icon: IoAnalytics },
        ],
    },
    {
        label: "Incidents",
        items: [
            {
                title: "Map",
                Icon: FaMapLocationDot,
                dropdown: "map",
                children: [
                    { to: "/map", title: "HeatMap", Icon: IoLocationSharp },
                    {
                        to: "/incident-request",
                        title: "Incident Request",
                        Icon: IoAlertSharp,
                    },
                ],
            },
            {
                title: "Records",
                Icon: IoFileTrayStacked,
                dropdown: "records",
                children: [
                    {
                        to: "/reports",
                        title: "Reports Records",
                        Icon: IoFolderOpenSharp,
                    },
                    {
                        to: "/request",
                        title: "Request Records",
                        Icon: BiSolidReport,
                    },
                    { to: "/violators", title: "Violators", Icon: MdReport },
                ],
            },
            { to: "/category", title: "Categories", Icon: IoApps },
        ],
    },
    {
        label: "Community",
        items: [
            { to: "/volunteers", title: "Volunteers", Icon: MdPeopleAlt },
            {
                to: "/residents",
                title: "Registered Residents",
                Icon: IoPeopleCircleSharp,
            },
            { to: "/hotline", title: "Hotline", Icon: IoCall },
        ],
    },
    {
        label: "Planning",
        items: [
            {
                to: "/operations",
                title: "Operations",
                Icon: IoShieldCheckmark,
            },
            { to: "/meetings", title: "Meetings", Icon: IoCalendar },
        ],
    },
];

const GroupHeader = ({ label, open, first }) =>
    open ? (
        <p className="px-2 pb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            {label}
        </p>
    ) : (
        // Collapsed sidebar: a thin divider stands in for the label
        !first && (
            <div className="mx-2 mb-2 border-t border-slate-300 dark:border-slate-700" />
        )
    );

const NavDropdown = ({
    item,
    isOpen,
    onToggle,
    open,
    selected,
    setSelected,
}) => (
    <div>
        <div
            className="relative mb-1 cursor-pointer"
            onClick={onToggle}
            role="button"
            aria-expanded={isOpen}
        >
            <Option
                Icon={item.Icon}
                title={item.title}
                selected={selected}
                setSelected={setSelected}
                open={open}
            />
            {open && (
                <IoChevronDown
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            )}
        </div>

        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col space-y-1 overflow-hidden relative ${
                        open ? "ml-6" : "ml-0"
                    }`}
                >
                    {item.children.map(({ to, title, Icon }) => (
                        <Link key={to} to={to}>
                            <Option
                                Icon={Icon}
                                title={title}
                                selected={selected}
                                setSelected={setSelected}
                                open={open}
                            />
                        </Link>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const SideNav = () => {
    // Select only what's needed so the per-second clock doesn't re-render the nav
    const open = useAppState((s) => s.open);
    const selected = useAppState((s) => s.selected);
    const setSelected = useAppState((s) => s.setSelected);
    const mapOpen = useAppState((s) => s.mapOpen);
    const setMapOpen = useAppState((s) => s.setMapOpen);
    const reportOpen = useAppState((s) => s.reportOpen);
    const setReportOpen = useAppState((s) => s.setReportOpen);

    const dropdowns = {
        map: [mapOpen, setMapOpen],
        records: [reportOpen, setReportOpen],
    };

    return (
        <motion.nav
            layout
            initial={false}
            animate={{
                width: open ? 225 : 64,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="sticky top-0 h-screen shrink-0 border-r border-slate-300 
               dark:border-slate-950 dark:bg-slate-900 bg-white p-2 flex flex-col z-50"
        >
            <div className="mr-1 flex min-h-0 flex-1 flex-col">
                <TitleSection open={open} />

                <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {NAV_GROUPS.map((group, i) => (
                        <div key={group.label}>
                            <GroupHeader
                                label={group.label}
                                open={open}
                                first={i === 0}
                            />
                            <div className="flex flex-col space-y-1">
                                {group.items.map((item) => {
                                    if (item.children) {
                                        const [isOpen, setIsOpen] =
                                            dropdowns[item.dropdown];
                                        return (
                                            <NavDropdown
                                                key={item.title}
                                                item={item}
                                                isOpen={isOpen}
                                                onToggle={() =>
                                                    setIsOpen(!isOpen)
                                                }
                                                open={open}
                                                selected={selected}
                                                setSelected={setSelected}
                                            />
                                        );
                                    }
                                    return (
                                        <Link key={item.to} to={item.to}>
                                            <Option
                                                Icon={item.Icon}
                                                title={item.title}
                                                selected={selected}
                                                setSelected={setSelected}
                                                open={open}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.nav>
    );
};
export default SideNav;
