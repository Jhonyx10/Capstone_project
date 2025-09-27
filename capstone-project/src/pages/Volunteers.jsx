import { useState } from "react";
import CreateTanodAccount from "../forms/CreateTanodAccount";
import TanodCard from "../components/TanodCard";

const Volunteers = () => {
    const [open, setOpen] = useState(false);

    const toggleForm = () => setOpen((prev) => !prev);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Volunteers
                </h1>
                <button
                    onClick={toggleForm}
                    className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
                >
                    Create Account
                </button>
            </div>

            {/* Form Modal */}
            {open && <CreateTanodAccount onClose={() => setOpen(false)} />}

            {/* Volunteer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <TanodCard />
            </div>
        </div>
    );
};

export default Volunteers;
