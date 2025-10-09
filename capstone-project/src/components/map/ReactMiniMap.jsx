import { useState, useEffect } from "react";
import useAppState from "../../store/useAppState";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../../hooks/useZones";
import useLocations from "../../hooks/useLocations";
import { motion } from "framer-motion";
import { IoLocationSharp } from "react-icons/io5";
import IgpitGeoFence from "../../assets/geomap/igpityoungsville.json";

const ReactMiniMap = () => {
    const { map_token, darkMode, map_styles } = useAppState();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [viewPort, setViewPort] = useState({
        latitude: 8.50742219620983,
        longitude: 124.5894592178347,
        zoom: 13.84858781193185,
    });

    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    const [showMap, setShowMap] = useState(false); // 👈 control visibility

    const { data: zones = [], isLoading, isError } = useZones();
    const { data: locations = [] } = useLocations();

    // ⏳ Add 1-second timeout before showing the map
    useEffect(() => {
        const timer = setTimeout(() => setShowMap(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <div>Loading map zones...</div>;
    if (isError) return <div>Failed to load zones.</div>;

    return (
        <motion.div
            key={darkMode ? "dark" : "light"} // remount on mode change
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "70%", height: "80vh" }}
        >
            {showMap && (
                <Map
                    initialViewState={viewPort}
                    mapboxAccessToken={map_token}
                    mapStyle={darkMode ? map_styles.dark : map_styles.light}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                    }}
                    onMove={(evt) => setViewPort(evt.viewState)}
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
                    {locations.map((loc) => (
                        <Marker
                            key={loc.id}
                            longitude={loc.longitude}
                            latitude={loc.latitude}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <IoLocationSharp size={24} color="red" />
                            </div>
                        </Marker>
                    ))}

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
                                ></div>

                                {hoveredZoneId === zone.id && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "24px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "white",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            boxShadow:
                                                "0 2px 6px rgba(0,0,0,0.2)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {zone.zone_name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}
                </Map>
            )}
        </motion.div>
    );
};

export default ReactMiniMap;
