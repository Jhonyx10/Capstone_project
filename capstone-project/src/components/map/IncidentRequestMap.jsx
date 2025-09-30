import { useEffect, useState } from "react";
import useAppState from "../../store/useAppState";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../../hooks/useZones";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { incidentRequest } from "../../functions/LocationApi";
import { IoLocationSharp } from "react-icons/io5";
import echo from "../../echo";

const IncidentRequestMap = () => {
    const {
        map_token,
        darkMode,
        map_styles,
        token,
        base_url,
        route,
        setRoute,
    } = useAppState();

    const [viewPort, setViewPort] = useState({
        latitude: 8.5107242,
        longitude: 124.5851259,
        zoom: 14,
    });

    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    const [tanodLocations, setTanodLocations] = useState({});

    const { data: zones = [], isLoading, isError } = useZones();

    const { data: requests = [] } = useQuery({
        queryKey: ["request"],
        queryFn: () => incidentRequest({ base_url, token }),
    });

    //  Listener for tanod location updates
    useEffect(() => {
        const channel = echo.channel("locations");

        channel.listen(".location.updated", (e) => {
            setTanodLocations((prev) => ({
                ...prev,
                [e.userId]: {
                    lat: e.latitude,
                    lng: e.longitude,
                    requestId: e.requestId,
                },
            }));
        });

        return () => {
            channel.stopListening(".location.updated");
            echo.leaveChannel("locations");
        };
    }, []);

    // Store multiple routes as a FeatureCollection
  useEffect(() => {
      const fetchRoutes = async () => {
          if (!Object.keys(tanodLocations).length || !requests.length) return;

          try {
              const routePromises = Object.entries(tanodLocations).map(
                  async ([tanodId, loc]) => {
                      const req = requests.find(
                          (r) => String(r.id) === String(loc.requestId)
                      );
                      if (!req) return null;

                      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${loc.lng},${loc.lat};${req.longitude},${req.latitude}?geometries=geojson&access_token=${map_token}`;
                      const res = await fetch(url);
                      const data = await res.json();

                      if (data.routes?.length) {
                          return {
                              type: "Feature",
                              geometry: data.routes[0].geometry,
                              properties: {
                                  tanodId: String(tanodId),
                                  requestId: String(loc.requestId),
                              },
                          };
                      }
                      return null;
                  }
              );

              const features = (await Promise.all(routePromises)).filter(
                  Boolean
              );
              console.log("Fetched features:", features);

              setRoute({
                  type: "FeatureCollection",
                  features,
              });
          } catch (err) {
              console.error("Failed to fetch routes:", err);
          }
      };

      fetchRoutes();
  }, [tanodLocations, requests, map_token]);



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
            <div className="flex-1 relative">
                <Map
                    {...viewPort}
                    onMove={(evt) => setViewPort(evt.viewState)}
                    mapboxAccessToken={map_token}
                    mapStyle={darkMode ? map_styles.dark : map_styles.light}
                    style={{ width: "100%", height: "100%" }}
                >
                    {/* Route line */}
                    {route && route.features?.length > 0 && (
                        <Source id="routes" type="geojson" data={route}>
                            <Layer
                                id="routes-line"
                                type="line"
                                paint={{
                                    "line-color": "#22c55e", 
                                    "line-width": 5,
                                    "line-opacity": 0.9,
                                }}
                            />
                        </Source>
                    )}

                    {/* Incident Requests */}
                    {requests?.map((r) => (
                        <Marker
                            key={r.id}
                            longitude={r.longitude}
                            latitude={r.latitude}
                        >
                            <div className="text-red-600">
                                <IoLocationSharp size={34} color="#ef4444" />
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

                    {/* Tanod locations (real-time) */}
                    {Object.entries(tanodLocations).map(([id, loc]) => {
                        if (!loc?.lng || !loc?.lat) return null;
                        return (
                            <Marker
                                key={id}
                                longitude={loc.lng}
                                latitude={loc.lat}
                            >
                                <div className="text-blue-600">
                                    <IoLocationSharp
                                        size={34}
                                        color="#22c55e"
                                    />
                                </div>
                            </Marker>
                        );
                    })}
                </Map>
            </div>
        </motion.div>
    );
};

export default IncidentRequestMap;
