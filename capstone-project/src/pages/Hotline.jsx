import { motion } from "framer-motion";
import HotlineTable from "../components/tables/HotlineTable";
import AddHotlineForm from "../forms/AddHotlineForm";
import { useState } from "react";
const Hotline = () => {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    return (
        <div className="m-4">
            <div className="flex justify-between items-center w-full">
                <motion.h1
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="dark:text-white text-gray-700 gap-4 font-medium text-2xl m-2"
                >
                    Hotline
                </motion.h1>
                <button 
                    onClick={() => setIsAddFormOpen(true)}
                    className="bg-green-500 p-2 rounded-lg hover:bg-green-400 hover:cursor-pointer">
                    <p className="text-white font-bold">Add Hotline</p>
                </button>
            </div>
            {isAddFormOpen && (
                <AddHotlineForm onClose={()=> setIsAddFormOpen(false)}/>
            )}

            <HotlineTable/>
        </div>
    );
};
export default Hotline;
