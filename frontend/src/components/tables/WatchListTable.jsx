import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getHotlines } from "../../functions/HotlineApi";
import { motion } from "framer-motion";
import { useState } from "react";
import UpdateHotlineForm from "../../forms/UpdateHotlineForm";
import { fadeIn, rowFade } from "../../utils/motion";

const WatchListTable = () => {
    const { token, base_url, darkMode } = useAppState();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedHotlineId, setSelectedHotlineId] = useState(null);

    const { data: hotlines = [], isLoading } = useQuery({
        queryKey: ["hotlines"],
        queryFn: () => getHotlines({ base_url, token }),
    });

    // --- Pagination state ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(hotlines.length / itemsPerPage);
    const currentHotlines = hotlines.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <motion.div {...fadeIn(0)} className="p-4 ml-0 w-full">


            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-400 hover:bg-green-500 text-white"
                        }`}
                    >
                        Prev
                    </button>

                    <span
                        className={
                            darkMode
                                ? "text-gray-300 font-medium"
                                : "text-gray-700"
                        }
                    >
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-400 hover:bg-green-500 text-white"
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

        </motion.div>
    );
};

export default WatchListTable;
