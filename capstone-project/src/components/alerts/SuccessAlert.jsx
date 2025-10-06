import { motion, AnimatePresence } from "framer-motion";
import useAppState from "../../store/useAppState";
import Lottie from "lottie-react";
import SuccessAnimation from "../../assets/animation/SuccessAnimation.json"

const SuccessAlert = () => {
    const { darkMode } = useAppState();

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const alertVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 20 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { scale: 0.8, opacity: 0, y: 20, transition: { duration: 0.2 } },
    };

    const bgColor = darkMode
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-800";

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`relative shadow-lg p-6 text-center`}
                >
                    <Lottie
                        animationData={SuccessAnimation}
                        loop={false}
                        style={{ width: 250, height: 250 }}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SuccessAlert;
