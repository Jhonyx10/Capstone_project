import { motion } from "framer-motion";
import IncidentRequestMap from "../components/map/IncidentRequestMap";
import useAppState from "../store/useAppState";
const IncidentRequest = () => {
    const { open } = useAppState()
    return (
        <div>
            <motion.div
                layout
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                style={{
                    height: "600px",
                }}
            >
            <IncidentRequestMap/>
            </motion.div>
        </div>
    );
};
export default IncidentRequest;
