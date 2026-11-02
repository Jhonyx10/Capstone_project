import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { IoCloseOutline } from "react-icons/io5";
import useToast from "../../store/useToast";
import SuccessAnimation from "../../assets/animation/SuccessAnimation.json";
import WarningAlert from "./WarningAlert";

const SuccessToast = ({ message, onClose }) => (
    <motion.div
        role="status"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative flex w-[320px] max-w-full items-center gap-3 rounded-xl border border-gray-200 border-l-4 border-l-green-500 bg-white py-2 pl-2 pr-10 shadow-lg dark:border-gray-800 dark:border-l-green-500 dark:bg-gray-900"
    >
        <Lottie
            animationData={SuccessAnimation}
            loop={false}
            style={{ width: 44, height: 44 }}
        />
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {message}
        </p>
        <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
        >
            <IoCloseOutline className="h-4 w-4" />
        </button>
    </motion.div>
);

// Mount once, e.g. in your main layout: <ToastHost />
const ToastHost = () => {
    const toasts = useToast((s) => s.toasts);
    const dismissToast = useToast((s) => s.dismissToast);

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed right-4 top-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3"
        >
            <AnimatePresence>
                {toasts.map((t) =>
                    t.type === "error" ? (
                        <div key={t.id} className="pointer-events-auto">
                            <WarningAlert
                                title={t.title}
                                message={t.message}
                                onClose={() => dismissToast(t.id)}
                            />
                        </div>
                    ) : (
                        <div key={t.id} className="pointer-events-auto">
                            <SuccessToast
                                message={t.message}
                                onClose={() => dismissToast(t.id)}
                            />
                        </div>
                    )
                )}
            </AnimatePresence>
        </div>
    );
};

export default ToastHost;
