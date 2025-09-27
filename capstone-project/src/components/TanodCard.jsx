import useVolunteers from "../hooks/useVolunteers";
import { IoPersonCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const TanodCard = () => {
    const { data } = useVolunteers();

    if (!data || data.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-300 text-center">
                No volunteers found.
            </p>
        );
    }

    // Variants for animation
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                delay: i * 0.1, // stagger effect
                duration: 0.4,
                ease: "easeOut",
            },
        }),
    };

    return (
        <div className="grid gap-6 sm:grid-cols-1">
            {data.map((volunteer, index) => (
                <motion.div
                    key={volunteer.id}
                    className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center p-6 border-b">
                        {volunteer.profile?.photo ? (
                            <img
                                className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow"
                                src={volunteer.profile?.photo}
                                alt={volunteer.name}
                            />
                        ) : (
                            <IoPersonCircleOutline className="h-24 w-24 text-gray-400" />
                        )}

                        <h3 className="mt-4 font-bold text-xl text-gray-800 dark:text-white">
                            {volunteer.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {volunteer.role}
                        </p>
                    </div>

                    {/* Info section */}
                    <div className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Email:</span>{" "}
                            {volunteer.email}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default TanodCard;
