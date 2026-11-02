import { useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import HotlineTable from "../components/tables/HotlineTable";
import AddHotlineForm from "../forms/AddHotlineForm";

const Hotline = () => {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Hotline
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Emergency numbers for the authorities your team may need
                        to reach.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddFormOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition cursor-pointer"
                >
                    <IoAddCircleOutline size={20} />
                    Add hotline
                </button>
            </div>

            {isAddFormOpen && (
                <AddHotlineForm onClose={() => setIsAddFormOpen(false)} />
            )}

            <HotlineTable />
        </div>
    );
};

export default Hotline;
