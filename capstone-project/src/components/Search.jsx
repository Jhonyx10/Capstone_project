import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const Search = ({ search, setSearch }) => {
    return (
        <motion.div layout className="relative w-full m-2">
            <FaSearch
                className="absolute top-1.5 left-2"
                size={20}
                color="#22c55e"
            />
            <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`transition-all duration-300 text-sm text-gray-700 
                    dark:text-gray-300 dark:bg-gray-500 bg-gray-200 
                    dark:border-gray-600 border-2 border-gray-200 
                    rounded-md border-opacity-5 placeholder-gray-500 
                    dark:placeholder-gray-100 placeholder-opacity-50 
                    pl-10 pr-2 p-2 w-full
                `}
            />
        </motion.div>
    );
};

export default Search;
