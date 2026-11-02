import { useState } from "react";
import CreateTanodAccount from "../forms/CreateTanodAccount";
import GroupModal from "../forms/GroupForm";
import TanodCard from "../components/TanodCard";
import GroupList from "../components/GroupList";
import {
    IoAddCircleOutline,
    IoPeopleOutline,
    IoLayersOutline,
} from "react-icons/io5";

const TABS = [
    { key: "roster", label: "Roster", icon: IoPeopleOutline },
    { key: "groups", label: "Groups", icon: IoLayersOutline },
];

const Volunteers = () => {
    const [tab, setTab] = useState("roster");
    const [accountOpen, setAccountOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);

    const isRoster = tab === "roster";

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Volunteers
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isRoster
                            ? "Manage tanod accounts, zones, and passwords."
                            : "Organize tanods into responder groups."}
                    </p>
                </div>
                <button
                    onClick={() =>
                        isRoster ? setAccountOpen(true) : setGroupOpen(true)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition cursor-pointer"
                >
                    <IoAddCircleOutline size={20} />
                    {isRoster ? "New account" : "New group"}
                </button>
            </div>

            {/* Roster / Groups toggle */}
            <div
                role="group"
                aria-label="Volunteers view"
                className="mb-5 inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
            >
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        aria-pressed={tab === key}
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                            tab === key
                                ? "bg-green-600 text-white"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Modals */}
            {accountOpen && (
                <CreateTanodAccount onClose={() => setAccountOpen(false)} />
            )}
            {groupOpen && <GroupModal onClose={() => setGroupOpen(false)} />}

            {/* Content */}
            {isRoster ? <TanodCard /> : <GroupList />}
        </div>
    );
};

export default Volunteers;
