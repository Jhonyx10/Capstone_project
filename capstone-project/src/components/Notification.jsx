import useIncidentTypes from "../hooks/useIncidentTypes";
import useVolunteers from "../hooks/useVolunteers";

const Notification = ({ message, onClose }) => {

    if (!message) return null;

    const { data: incidentType = [] } = useIncidentTypes();
    const incident = incidentType.find(
        (type) => type.id === message.incident_type_id
    );
    
    const { data: volunteers = [] } = useVolunteers();

    const reportedBy = volunteers.find(
        (user) => Number(user.id) === Number(message?.report?.user_id)
    );
     
   const renderContent = () => {
       if (message.incident_type_id) {
           return (
               <>
                   <h2>🚨 Emergency!</h2>
                   <p>
                       <strong>Incident Type:</strong>{" "}
                       {incident ? incident.incident_name : "Unknown"}
                   </p>
                   <div style={{ textAlign: "right" }}>
                       <button
                           onClick={onClose}
                           style={{
                               padding: "8px 16px",
                               backgroundColor: "#2563eb",
                               color: "#fff",
                               border: "none",
                               borderRadius: "6px",
                               cursor: "pointer",
                           }}
                           onMouseOver={(e) =>
                               (e.target.style.backgroundColor = "#1d4ed8")
                           }
                           onMouseOut={(e) =>
                               (e.target.style.backgroundColor = "#2563eb")
                           }
                       >
                           View Location
                       </button>
                   </div>
               </>
           );
       } else {
           // Default
           return (
               <>
                   <h2>🔔 Notification</h2>
                   <p>
                       <strong>Report Submitted By:</strong>{" "}
                       {reportedBy ? reportedBy.name : "Anonymous"}
                   </p>
                   <div style={{ textAlign: "right" }}>
                       <button
                           onClick={onClose}
                           style={{
                               padding: "8px 16px",
                               backgroundColor: "#2563eb",
                               color: "#fff",
                               border: "none",
                               borderRadius: "6px",
                               cursor: "pointer",
                           }}
                           onMouseOver={(e) =>
                               (e.target.style.backgroundColor = "#1d4ed8")
                           }
                           onMouseOut={(e) =>
                               (e.target.style.backgroundColor = "#2563eb")
                           }
                       >
                           View Report
                       </button>
                   </div>
               </>
           );
       }
   };


    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "20px",
                    width: "90%",
                    maxWidth: "400px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
            >
                <div style={{ marginBottom: "15px" }}>{renderContent()}</div>
            </div>
        </div>
    );
};

export default Notification;
