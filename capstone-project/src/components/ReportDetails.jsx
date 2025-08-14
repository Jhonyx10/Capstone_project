import useAppState from "../store/useAppState";
import ReportViolators from "./ReportViolators";

const ReportDetails = ({ reportId, onClose }) => {
    const { reports} = useAppState();
    const report = reports?.find((r) => r.id === reportId);
    if (!reports || reports.length === 0 || !report) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <h3>Report Details</h3>
                <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                >
                    <p>
                        <strong>Reported By:</strong> {report?.user?.name}
                    </p>
                    <p>
                        <strong>Role:</strong> {report?.user?.role}
                    </p>
                </div>
                <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                >
                    <div>
                        <p>
                            <strong>Category:</strong>{" "}
                            {report?.incident_type?.category?.category_name}
                        </p>
                        <p>
                            <strong>Incident Type:</strong>{" "}
                            {report?.incident_type?.incident_name}
                        </p>
                        <p>
                            <strong>Date:</strong> {report?.date}
                        </p>
                        <p>
                            <strong>Time:</strong> {report?.time}
                        </p>
                        <p>
                            <strong>Report Description:</strong> <br />
                            {report?.report_description}
                        </p>
                        <ReportViolators reportId={reportId}/>
                    </div>
                    <div>
                        <p>
                            <strong>Zone:</strong>{" "}
                            {report?.location?.zone?.zone_name}
                        </p>
                        <p>
                            <strong>Location:</strong>{" "}
                            {report?.location?.location_name}
                        </p>

                        <p>
                            <strong>Landmark:</strong>
                        </p>
                        <img
                            src={report?.location?.landmark}
                            alt="landmark"
                            width="100"
                            height="100"
                            style={{ borderRadius: 8 }}
                        />
                        <p>
                            <strong>Evidences:</strong>
                        </p>
                        <div style={{ display: "flex" }}>
                            {report.evidences?.map((evidence, index) => (
                                <div key={index}>
                                    <img
                                        src={evidence.file_url}
                                        alt={`evidence-${index}`}
                                        width="100"
                                        height="100"
                                        style={{ margin: "10px 0" }}
                                    />
                                    <p>{evidence?.remarks}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        border: "2px solid red",
    },
    modal: {
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "8px",
        width: "500px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "15px",
        fontSize: "1.5rem",
        border: "none",
        background: "none",
        cursor: "pointer",
    },
};

export default ReportDetails;
