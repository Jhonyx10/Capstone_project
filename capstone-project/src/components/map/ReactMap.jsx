import { useEffect, useState } from "react";
import useAppState from "../../store/useAppState";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../../hooks/useZones";
import useLocations from "../../hooks/useLocations";
import ZoneList from "./ZoneList";
import { motion, AnimatePresence } from "framer-motion";
import { IoLocationSharp } from "react-icons/io5";
import ZoneDetails from "./ZoneDetails";

const ReactMap = () => {
    const { map_token, darkMode, map_styles, open } = useAppState();
    const [selectedZone, setSelectedZone] = useState(null);
    const [viewPort, setViewPort] = useState({
        latitude: 8.5107242,
        longitude: 124.5851259,
        zoom: 14,
    });

    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    const [hoveredLocation, setHoveredLocation] = useState(null);

    const { data: zones = [], isLoading, isError } = useZones();
    const { data: locations = [] } = useLocations();

    // zoom into selected zone
    useEffect(() => {
        if (selectedZone) {
            setViewPort((prev) => ({
                ...prev,
                latitude: selectedZone.latitude,
                longitude: selectedZone.longitude,
                zoom: 16,
                transitionDuration: 800,
            }));
        }
    }, [selectedZone]);

    if (isLoading) return <div>Loading map zones...</div>;
    if (isError) return <div>Failed to load zones.</div>;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
        >
            <AnimatePresence>
                {selectedZone && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 dark:border-slate-700 ${
                            open ? "top-15 left-60" : "top-15 left-20"
                        }`}
                    >
                        <ZoneDetails
                            zone={selectedZone}
                            onClose={() => setSelectedZone(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex-1 relative">
                <Map
                    {...viewPort}
                    onMove={(evt) => setViewPort(evt.viewState)}
                    mapboxAccessToken={map_token}
                    mapStyle={darkMode ? map_styles.dark : map_styles.light}
                    style={{ width: "100%", height: "100%" }}
                >
                    {/* Locations */}
                    {locations.map((loc) => (
                        <Marker
                            key={loc.id}
                            longitude={loc.longitude}
                            latitude={loc.latitude}
                        >
                            <div
                                onMouseEnter={() => setHoveredLocation(loc.id)}
                                onMouseLeave={() => setHoveredLocation(null)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <IoLocationSharp size={34} color="red" />
                                {hoveredLocation === loc.id && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-1 rounded shadow text-xs">
                                        <h5>{loc.location_name}</h5>
                                        <img
                                            src={loc.landmark}
                                            alt={loc.location_name}
                                            className="w-[300px] h-[100px] object-cover rounded-md shadow"
                                        />
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}

                    {/* Zones */}
                    {zones.map((zone) => (
                        <Marker
                            key={zone.id}
                            longitude={zone.longitude}
                            latitude={zone.latitude}
                            anchor="bottom"
                        >
                            <div
                                onMouseEnter={() => setHoveredZoneId(zone.id)}
                                onMouseLeave={() => setHoveredZoneId(null)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    style={{
                                        width:
                                            hoveredZoneId === zone.id
                                                ? "18px"
                                                : "14px",
                                        height:
                                            hoveredZoneId === zone.id
                                                ? "18px"
                                                : "14px",
                                        backgroundColor:
                                            hoveredZoneId === zone.id
                                                ? "orange"
                                                : "red",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                                {hoveredZoneId === zone.id && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold shadow">
                                        {zone.zone_name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}
                </Map>
            </div>
            <div className="w-[280px] bg-slate-100 dark:bg-slate-900 p-3 overflow-y-auto hide-scrollbar">
                <ZoneList setSelectedZone={setSelectedZone} />
            </div>
        </motion.div>
    );
};

export default ReactMap;
