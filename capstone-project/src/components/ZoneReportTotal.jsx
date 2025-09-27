import useZoneIncidentDetails from "../hooks/useZonesIncidentDetails";
import ZoneDetails from "./map/ZoneDetails";
import { useState } from "react";

const ZoneReportTotal = () => {
    const { data } = useZoneIncidentDetails();
    const [selectedZone, setSelectedZone] = useState(null);

    return (
        <div style={styles.grid}>
            {data?.map((zone, index) => (
                <div key={index} style={styles.card}>
                    <h1 style={styles.cardTitle}>{zone?.zone?.zone_name}</h1>

                    <div>
                        {zone?.categories?.map((cat, i) => (
                            <div key={i} style={styles.row}>
                                <span>{cat?.category?.category_name}</span>
                                <span style={styles.count}>{cat?.count}</span>
                            </div>
                        ))}
                    </div>

                    <p style={styles.total}>Total: {zone.zone_total}</p>

                    <button
                        onClick={() => setSelectedZone(zone.zone.id)}
                        style={styles.button}
                    >
                        View Details
                    </button>
                </div>
            ))}

            {selectedZone && (
                <ZoneDetails
                    zoneId={selectedZone}
                    data={data}
                    onClose={() => setSelectedZone(null)}
                />
            )}
        </div>
    );
};

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    cardTitle: {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "12px",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
        padding: "4px 0",
    },
    count: {
        fontWeight: "bold",
    },
    total: {
        marginTop: "12px",
        fontWeight: "600",
        textAlign: "right",
    },
    button: {
        marginTop: "12px",
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "8px 12px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
        transition: "background 0.3s",
    },
};

export default ZoneReportTotal;
