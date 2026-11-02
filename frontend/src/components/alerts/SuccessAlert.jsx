import { motion } from "framer-motion";
import Lottie from "lottie-react";
import SuccessAnimation from "../../assets/animation/SuccessAnimation.json";

// Toast version of the success alert. Same usage as before:
//   {isAlertMessageOpen && <SuccessAlert />}
// Optionally pass a message: <SuccessAlert message="Hotline added" />
const SuccessAlert = ({ message = "Saved successfully" }) => {
    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm justify-end px-4 sm:px-0">
            <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-gray-200 border-l-4 border-l-green-500 bg-white py-2 pl-2 pr-5 shadow-lg dark:border-gray-800 dark:border-l-green-500 dark:bg-gray-900"
            >
                <Lottie
                    animationData={SuccessAnimation}
                    loop={false}
                    style={{ width: 44, height: 44 }}
                />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {message}
                </p>
            </motion.div>
        </div>
    );
};

export default SuccessAlert;
