import { useEffect, useState } from "react";
import useAppState from "../../store/useAppState";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../../hooks/useZones";
import useLocations from "../../hooks/useLocations";
import ZoneList from "./ZoneList";
import { motion, AnimatePresence } from "framer-motion";
import { IoLocationSharp } from "react-icons/io5";
import ZoneDetails from "./ZoneDetails";
import LocationDetails from "../details/LocationDetails";
import IgpitGeoFence from "../../assets/geomap/igpityoungsville.json"

const ReactMap = () => {
    const { map_token, darkMode, map_styles, open } = useAppState();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const [viewPort, setViewPort] = useState({
        latitude: 8.5107242,
        longitude: 124.5851259,
        zoom: 14,
    });
    
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [hoveredZoneId, setHoveredZoneId] = useState(null);

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

    useEffect(() => {
        if (selectedLocation) {
            setSelectedZone(null);
        }
    }, [selectedLocation]);

    useEffect(() => {
        if (selectedZone) {
            setSelectedLocation(null);
        }
    }, [selectedZone]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-h-full flex"
        >
            {isLoading && <div>Loading map zones...</div>}
            {isError && <div>Failed to load zones.</div>}
            {/* zone details */}
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

            {/* location details */}
            <AnimatePresence>
                {selectedLocation && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 dark:border-slate-700 ${
                            open ? "top-15 left-60" : "top-15 left-20"
                        }`}
                    >
                        <LocationDetails
                            locationId={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* mapbox incident heatmap */}
            <div className="flex-1 relative">
                <Map
                    {...viewPort}
                    onMove={(evt) => setViewPort(evt.viewState)}
                    mapboxAccessToken={map_token}
                    mapStyle={darkMode ? map_styles.dark : map_styles.light}
                    style={{ width: "100%", height: "100%" }}
                    onLoad={(e) => {
                        const mapInstance = e.target;

                        // Wait until the map style and layers are fully ready
                        const handleStyleLoad = () => {
                            console.log("✅ Map style fully loaded!");
                            setMapLoaded(true);
                            mapInstance.off("idle", handleStyleLoad); // cleanup listener
                        };

                        // 'idle' event ensures the style, tiles, and sources are all ready
                        mapInstance.on("idle", handleStyleLoad);
                    }}
                >
                    {mapLoaded && (
                        <Source id="igpit" type="geojson" data={IgpitGeoFence}>
                            <Layer
                                id="igpit-fill"
                                source="igpit"
                                type="fill"
                                paint={{
                                    "fill-color": "#f97316",
                                    "fill-opacity": 0.25,
                                }}
                            />
                            <Layer
                                id="igpit-outline"
                                source="igpit"
                                type="line"
                                paint={{
                                    "line-color": "#f97316",
                                    "line-width": 2,
                                }}
                            />
                        </Source>
                    )}

                    {/* Locations */}
                    {Array.isArray(locations) && locations.length > 0 ? locations.map((loc) => (
                        <Marker
                            key={loc.id}
                            longitude={loc.longitude}
                            latitude={loc.latitude}
                            onClick={() => setSelectedLocation(loc.id)}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <IoLocationSharp size={24} color="red" />
                            </div>
                        </Marker>)) : null}

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

            {/* zone list */}
            <div className="w-[280px] bg-slate-100 dark:bg-slate-900 p-3 overflow-y-auto hide-scrollbar">
                <ZoneList setSelectedZone={setSelectedZone} />
            </div>
        </motion.div>
    );
};

export default ReactMap;
