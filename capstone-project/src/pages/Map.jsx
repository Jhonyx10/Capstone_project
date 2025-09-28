import ReactMap from "../components/map/ReactMap";
import { motion } from "framer-motion"

const Map = () => {
    return (
        <div>
            <motion.div
                layout
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                style={{
                    width: "100%",
                    height: "600px",
                    // backgroundColor: "blue",
                }}
            >
                <ReactMap />
            </motion.div>
        </div>
    );
};
export default Map;
