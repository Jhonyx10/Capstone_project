import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { zoneAverageResponseTimeById } from "../functions/Analytics";
import useLocations from "../hooks/useLocations";
import Map, { Marker } from "react-map-gl";
import { useState } from "react";

const ZoneDetails = ({ data, zoneId, onClose }) => {
    const { token, base_url, reports, map_token } = useAppState();
    const zoneDetails = data?.find((zone) => zone?.zone?.id === zoneId);
    const { data: locations} = useLocations();

    const filterLocations = locations?.filter(
        (zone) => zone?.zone_id === zoneId);

    const filterReport = reports?.filter(
        (report) => report?.location?.zone?.id === zoneId
    );


    if (!zoneDetails) return null;

    const { data: responseTime, isLoading } = useQuery({
        queryKey: ["zone_response_time", zoneId],
        queryFn: () => zoneAverageResponseTimeById({ base_url, token, zoneId }),
        enabled: !!zoneId,
    });

    const [viewPort, setViewPort] = useState({
        latitude: zoneDetails?.zone?.latitude ?? 0,
        longitude: zoneDetails?.zone?.longitude ?? 0,
        zoom: 17,
    });


    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Close Button */}
                <button style={styles.closeBtn} onClick={onClose}>
                    ✖
                </button>

                {/* Map Section */}
                <div style={styles.mapContainer}>
                    <Map
                        {...viewPort}
                        onMove={(evt) => setViewPort(evt.viewState)}
                        mapboxAccessToken={map_token}
                        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                        style={{ width: "100%", height: "100%" }}
                        transitionDuration="200"
                    >
                        {filterLocations?.map((loc) => (
                            <Marker
                                key={loc.id}
                                longitude={loc.longitude}
                                latitude={loc.latitude}
                                anchor="bottom"
                            >
                                <div
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                    }}
                                ></div>
                            </Marker>
                        ))}

                        <Marker
                            key={zoneDetails?.zone?.id}
                            longitude={zoneDetails?.zone?.longitude ?? 0}
                            latitude={zoneDetails?.zone?.latitude ?? 0}
                            anchor="bottom"
                        />
                    </Map>
                </div>

                {/* Details Section */}
                <div style={styles.detailsContainer}>
                    <h2 style={styles.title}>{zoneDetails?.zone?.zone_name}</h2>

                    <div style={{display: 'flex', justifyContent: 'space-around'}}>
                        <div>
                            {zoneDetails?.categories?.map((cat, i) => (
                                <div key={i} style={styles.categoryRow}>
                                    <span style={styles.categoryName}>
                                        {cat?.category?.category_name}:
                                    </span>
                                    <span style={styles.count}>
                                        {cat?.count}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={styles.totalRow}>
                            <p style={styles.totalText}>
                                Total Reports <br/>{zoneDetails?.zone_total}
                            </p>
                        </div>
                        <div style={styles.totalRow}>
                            <p style={styles.totalText}>
                                Avg Response Time:{" "}
                                <br/>
                                {isLoading
                                    ? "Loading..."
                                    : responseTime === null ||
                                      responseTime === undefined
                                    ? "N/A"
                                    : `${parseFloat(responseTime).toFixed(
                                          2
                                      )} mins`}
                            </p>
                        </div>
                    </div>

                    {/* Reports Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Category</th>
                                    <th style={styles.th}>Incident</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Time</th>
                                    <th style={styles.th}>Responders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterReport?.length > 0 ? (
                                    filterReport.map((report) => (
                                        <tr key={report.id}>
                                            <td>{report?.incident_type?.category?.category_name}</td>
                                            <td>
                                                {
                                                    report.incident_type
                                                        ?.incident_name
                                                }
                                            </td>
                                            <td>
                                                {
                                                    report.incident_type
                                                        ?.category
                                                        ?.category_name
                                                }
                                            </td>
                                            <td>{report.date}</td>
                                            <td>{report.time}</td>
                                            <td>{report.user?.name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            No reports found for this zone.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        width: "90%",
        height: "90%",
        position: "relative",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        overflow: "hidden",
        display: "flex",
    },
    mapContainer: {
        flex: "1",
        height: "100%",
        marginRight: "20px",
        borderRadius: "8px",
        overflow: "hidden",
        width: '50%'
    },
    detailsContainer: {
        flex: "1",
        height: "100%",
        overflowY: "auto",
        paddingRight: "10px",
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "none",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        marginBottom: "15px",
    },
    categoryRow: {
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid #eee",
        width: 150
    },
    categoryName: {
        fontWeight: "500",
    },
    count: {
        fontWeight: "600",
        color: "#333",
    },
    totalRow: {
        marginTop: "20px",
        textAlign: "right",
    },
    totalText: {
        fontSize: "16px",
        fontWeight: "bold",
    },
    tableContainer: {
        marginTop: "20px",
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    th: {
        textAlign: "left",
        padding: "10px",
        borderBottom: "2px solid #ddd",
        backgroundColor: "#f9f9f9",
    },
    tr: {
        borderBottom: "1px solid #eee",
    },
    td: {
        padding: "10px",
        fontSize: "14px",
    },
};


export default ZoneDetails;
