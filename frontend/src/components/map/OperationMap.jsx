import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { IoLocationSharp } from "react-icons/io5";
import useAppState from "../../store/useAppState";
import DrawControl from "./DrawControl";
import { getBounds } from "../../functions/geo";

const OperationMap = ({
    operationGeofence = null,
    areas = [],
    zones = [], // zone pins: { id, zone_name, latitude, longitude }
    selectedZoneId = null,
    onSelectZone, // pass to make zone pins clickable
    selectedAreaId = null,
    onSelectArea,
    onDraftGeofenceChange, // pass to enable the polygon draw tool
    resetKey = 0,
    point = null, // { lat, lng } draft pin
    onPointChange, // pass to enable pinning
    pinning = false, // when true, a map click drops the pin
    focus = null, // { latitude, longitude, zoom }
}) => {
    const { map_token, map_styles } = useAppState();
    const mapRef = useRef(null);
    const drawRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    // true while the polygon tool is active, so pins don't swallow the clicks
    const [drawing, setDrawing] = useState(false);

    // The draw tool is mounted the first time it's needed and then KEPT
    // mounted. Unmounting/re-mounting it on every "Add area" is what broke
    // closing the polygon on the second drawing.
    const drawEnabled = Boolean(onDraftGeofenceChange);
    const [drawMounted, setDrawMounted] = useState(false);
    useEffect(() => {
        if (drawEnabled) {
            setDrawMounted(true);
        } else {
            try {
                // leave any half-finished drawing
                drawRef.current?.changeMode("simple_select");
            } catch {
                /* draw control not ready */
            }
        }
    }, [drawEnabled]);

    // fit the camera to the operation's geofence once it is available
    const fenceKey = JSON.stringify(operationGeofence?.coordinates ?? null);
    useEffect(() => {
        if (!mapLoaded || !operationGeofence) return;
        const bounds = getBounds(operationGeofence);
        if (bounds)
            mapRef.current?.fitBounds(bounds, { padding: 60, duration: 800 });
    }, [mapLoaded, fenceKey]);

    useEffect(() => {
        if (!mapLoaded || !focus?.latitude || !focus?.longitude) return;
        mapRef.current?.flyTo({
            center: [focus.longitude, focus.latitude],
            zoom: focus.zoom ?? 17,
            duration: 800,
        });
    }, [mapLoaded, focus?.latitude, focus?.longitude]);

    const operationFeature = useMemo(
        () =>
            operationGeofence
                ? {
                      type: "Feature",
                      properties: {},
                      geometry: operationGeofence,
                  }
                : null,
        [fenceKey]
    );

    const areaCollection = useMemo(
        () => ({
            type: "FeatureCollection",
            features: areas
                .filter((a) => a.geofence)
                .map((a) => ({
                    type: "Feature",
                    properties: {
                        id: a.id,
                        selected: a.id === selectedAreaId ? 1 : 0,
                    },
                    geometry: a.geofence,
                })),
        }),
        [areas, selectedAreaId]
    );

    const handleClick = (e) => {
        if (!pinning || !onPointChange) return;
        const mode = drawRef.current?.getMode?.();
        if (mode && mode.startsWith("draw_")) return; // user is drawing a polygon
        onPointChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };

    return (
        <Map
            ref={mapRef}
            initialViewState={{
                latitude: 8.5107242,
                longitude: 124.5851259,
                zoom: 14,
            }}
            mapboxAccessToken={map_token}
            // realistic satellite imagery with street/place labels
            mapStyle={map_styles.realistic}
            maxZoom={20}
            style={{ width: "100%", height: "100%" }}
            cursor={pinning ? "crosshair" : undefined}
            onClick={handleClick}
            onLoad={(e) => {
                const m = e.target;
                // track whether the polygon tool is in a drawing mode
                m.on("draw.modechange", (ev) =>
                    setDrawing(String(ev.mode).startsWith("draw_"))
                );
                // same "wait for idle" approach as ReactMap
                m.once("idle", () => setMapLoaded(true));
            }}
        >
            <NavigationControl position="top-right" showCompass={false} />

            {drawMounted && (
                <DrawControl
                    drawRef={drawRef}
                    onChange={onDraftGeofenceChange}
                    resetKey={resetKey}
                />
            )}
            {/* hide the draw toolbar (top-left) while not adding an area */}
            {!drawEnabled && (
                <style>{`.mapboxgl-ctrl-top-left { display: none; }`}</style>
            )}

            {mapLoaded && operationFeature && (
                <Source id="op-fence" type="geojson" data={operationFeature}>
                    <Layer
                        id="op-fence-fill"
                        type="fill"
                        paint={{
                            "fill-color": "#22c55e",
                            "fill-opacity": 0.15,
                        }}
                    />
                    <Layer
                        id="op-fence-line"
                        type="line"
                        paint={{ "line-color": "#4ade80", "line-width": 3 }}
                    />
                </Source>
            )}

            {mapLoaded && (
                <Source id="areas" type="geojson" data={areaCollection}>
                    <Layer
                        id="areas-fill"
                        type="fill"
                        paint={{
                            "fill-color": "#3b82f6",
                            "fill-opacity": [
                                "case",
                                ["==", ["get", "selected"], 1],
                                0.45,
                                0.2,
                            ],
                        }}
                    />
                    <Layer
                        id="areas-line"
                        type="line"
                        paint={{ "line-color": "#60a5fa", "line-width": 2.5 }}
                    />
                </Source>
            )}

            {/* zone pins (same look as the heatmap's zones) */}
            {zones
                .filter((z) => z.latitude && z.longitude)
                .map((zone) => {
                    const isSelected =
                        String(zone.id) === String(selectedZoneId);
                    const isHovered = hoveredZoneId === zone.id;
                    const big = isSelected || isHovered;

                    return (
                        <Marker
                            key={`zone-${zone.id}`}
                            style={{ pointerEvents: drawing ? "none" : "auto" }}
                            longitude={Number(zone.longitude)}
                            latitude={Number(zone.latitude)}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                onSelectZone?.(zone.id);
                            }}
                        >
                            <div
                                // while pinning, clicks pass through to the map
                                className={pinning ? "pointer-events-none" : ""}
                                onMouseEnter={() => setHoveredZoneId(zone.id)}
                                onMouseLeave={() => setHoveredZoneId(null)}
                                style={{
                                    position: "relative",
                                    cursor: onSelectZone
                                        ? "pointer"
                                        : "default",
                                }}
                            >
                                <div
                                    style={{
                                        width: big ? "18px" : "14px",
                                        height: big ? "18px" : "14px",
                                        backgroundColor: big ? "orange" : "red",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                                {big && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded text-xs font-bold text-black shadow">
                                        {zone.zone_name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    );
                })}

            {/* existing areas */}
            {areas
                .filter((a) => a.latitude && a.longitude)
                .map((area) => (
                    <Marker
                        key={area.id}
                        style={{ pointerEvents: drawing ? "none" : "auto" }}
                        longitude={area.longitude}
                        latitude={area.latitude}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onSelectArea?.(area.id);
                        }}
                    >
                        <div className="flex flex-col items-center cursor-pointer">
                            <span className="mb-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] font-bold shadow">
                                {area.name}
                            </span>
                            <IoLocationSharp
                                size={area.id === selectedAreaId ? 32 : 26}
                                color={
                                    area.id === selectedAreaId
                                        ? "#1d4ed8"
                                        : "#3b82f6"
                                }
                                // dark outline keeps the green pin visible on satellite imagery
                                style={{
                                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.85))",
                                }}
                            />
                        </div>
                    </Marker>
                ))}

            {/* draft pin */}
            {point && (
                <Marker
                    longitude={point.lng}
                    latitude={point.lat}
                    anchor="bottom"
                    draggable={Boolean(onPointChange)}
                    onDragEnd={(e) =>
                        onPointChange?.({
                            lat: e.lngLat.lat,
                            lng: e.lngLat.lng,
                        })
                    }
                >
                    <IoLocationSharp
                        size={34}
                        color="#3b82f6"
                        style={{
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.85))",
                        }}
                    />
                </Marker>
            )}
        </Map>
    );
};

export default OperationMap;
