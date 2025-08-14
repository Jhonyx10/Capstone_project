import { useState } from "react";
import useAppState from "../store/useAppState";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../hooks/useZones";
import useLocations from "../hooks/useLocations";

const ReactMap = () => {
    const { map_token } = useAppState();

    const [viewPort, setViewPort] = useState({
        latitude: 8.5078071,
        longitude: 124.5795137,
        zoom: 14,
    });

    const [hoveredZoneId, setHoveredZoneId] = useState(null);

    const { data: zones = [], isLoading, isError } = useZones();

    const { data: locations = [] } = useLocations();

    if (isLoading) return <div>Loading map zones...</div>;
    if (isError) return <div>Failed to load zones.</div>;

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Map
                {...viewPort}
                onMove={(evt) => setViewPort(evt.viewState)}
                mapboxAccessToken={map_token}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                style={{ width: "100%", height: "100%" }}
                transitionDuration="200"
                position="center"
            >
               
               {locations.map((loc) => (
                <Marker key={loc.id} longitude={loc.longitude} latitude={loc.latitude}/>
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
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
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
        </div>
    );
};

export default ReactMap;
