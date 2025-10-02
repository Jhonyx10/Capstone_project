import { useState } from "react";
import CreateTanodAccount from "../forms/CreateTanodAccount";
import TanodCard from "../components/TanodCard";
import { IoAddCircleOutline } from "react-icons/io5";

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
                    className="flex px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition hover:cursor-pointer"
                >
                    <IoAddCircleOutline size={25} /> Account
                </button>
            </div>

            {/* Form Modal */}
            {open && <CreateTanodAccount onClose={() => setOpen(false)} />}

            {/* Volunteer Cards */}
            <div>
                <TanodCard />
            </div>
        </div>
    );
};

export default Volunteers;
