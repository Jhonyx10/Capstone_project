import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useVolunteers from "../hooks/useVolunteers";
import useAppState from "../store/useAppState";

const Notification = ({ message, onClose, duration = 7000 }) => {
    const { darkMode, categories } = useAppState(); // ✅ dark mode
    const navigate = useNavigate();

    const { data: volunteers = [] } = useVolunteers();

    const reportedBy = volunteers.find(
        (user) => Number(user.id) === Number(message?.report?.user_id)
    );
    
    const category = categories.find((cat) => cat.id === message?.category_id);

    // Auto close after duration (default 7 seconds)
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const renderContent = () => {
        if (message.category_id) {
            return (
                <>
                    <h2 className="text-lg font-bold mb-2">🚨 Emergency!</h2>
                    <p>
                        <strong>Incident Category:</strong>{" "}
                        {category ? category.category_name : "Unknown"}
                    </p>
                    <div className="text-right mt-4">
                        <button
                            onClick={() => {
                                onClose();
                                navigate("/incident-request");
                            }}
                            className={`px-4 py-2 rounded text-white transition ${
                                darkMode
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            View Location
                        </button>
                    </div>
                </>
            );
        } else if (message.violator) {
            const violator = message.violator;
            return (
                <>
                    <h2 className="text-lg font-bold mb-2">
                        👮 New Violator Profile
                    </h2>
                    <p>
                        <strong>Name:</strong> {violator.first_name}{" "}
                        {violator.last_name}
                    </p>
                    <p>
                        <strong>Age:</strong> {violator.age}
                    </p>
                    <p>
                        <strong>Address:</strong> {violator.address}
                    </p>
                    <div className="text-right mt-4">
                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/violators-details/${violator.id}`);
                            }}
                            className={`px-4 py-2 rounded text-white transition ${
                                darkMode
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            View Profile
                        </button>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <h2 className="text-lg font-bold mb-2">🔔 Notification</h2>
                    <p>
                        <strong>Report Submitted By:</strong>{" "}
                        {reportedBy ? reportedBy.name : "Anonymous"}
                    </p>
                    <div className="text-right mt-4">
                        <button
                            onClick={() => {
                                onClose();
                                navigate(
                                    `/report-details/${message?.report?.id}`
                                );
                            }}
                            className={`px-4 py-2 rounded text-white transition ${
                                darkMode
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            View Report
                        </button>
                    </div>
                </>
            );
        }
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className={`fixed top-20 right-5 z-50 w-full max-w-sm rounded-lg shadow-lg p-4 ${
                        darkMode
                            ? "bg-slate-900 text-white"
                            : "bg-white text-gray-800"
                    }`}
                >
                    {renderContent()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;
