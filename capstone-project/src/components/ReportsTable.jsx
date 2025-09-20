import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../functions/ReportsApi";
import useAppState from "../store/useAppState";
import { useState } from "react";
import ReportDetails from "./ReportDetails";

const ReportTable = () => {
    const { base_url, token, reports, setCategories } = useAppState();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedIncidentType, setSelectedIncidentType] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const [selectedReportId, setSelectedReportId] = useState(null);

    const handleOpen = (reportId) => {
       setSelectedReportId(reportId);
    //    console.log("Selected report ID:", reportId);
    };

    const getTimeFrame = (time) => {
        if (!time) return "";
        const hour = parseInt(time.split(":")[0], 10);
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 21) return "evening";
        return "night"; 
    };

    const categories = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories({ base_url, token }),
        onSuccess: (categories) => {
            setCategories(categories)
            // console.log(categories)
        }
    });

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedIncidentType("all"); 
    };

    const handleIncidentTypeChange = (e) => {
        setSelectedIncidentType(e.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    };

   const filteredReports = reports?.filter((report) => {
    const reportMonth = new Date(report?.date).getMonth() + 1;
    const categoryMatch =
        selectedCategory === "all" ||
        report?.incident_type?.category?.id === parseInt(selectedCategory);
    const incidentMatch =
        selectedIncidentType === "all" ||
        report?.incident_type?.id === parseInt(selectedIncidentType);
    const monthMatch =
        selectedMonth === "all" || reportMonth === parseInt(selectedMonth);
    const timeFrameMatch =
        selectedTime === "all" ||
        getTimeFrame(report?.time) === selectedTime;

    return categoryMatch && incidentMatch && monthMatch && timeFrameMatch;
});


    const dropdownStyle = {
        marginBottom: "15px",
        padding: "8px",
        fontSize: "14px",
        width: "100%",
    };

    const tableContainerStyle = {
        padding: "20px",
        overflowX: "auto",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    };

    const thStyle = {
        backgroundColor: "#f2f2f2",
        padding: "12px",
        border: "1px solid #ddd",
        textAlign: "left",
        fontWeight: "600",
        color: "#333",
    };

    const tdStyle = {
        padding: "12px",
        border: "1px solid #ddd",
        textAlign: "left",
    };

    const rowStyleEven = {
        backgroundColor: "#f9f9f9",
    };

    return (
        <div style={tableContainerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>
                            <select
                                style={dropdownStyle}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="all">Category</option>
                                {categories?.data?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </th>
                        <th style={thStyle}>
                            <select
                                style={dropdownStyle}
                                value={selectedIncidentType}
                                onChange={handleIncidentTypeChange}
                            >
                                <option value="all">Incident Type</option>
                                {categories?.data
                                    ?.find(
                                        (cat) =>
                                            selectedCategory === "all" ||
                                            cat.id ===
                                                parseInt(selectedCategory)
                                    )
                                    ?.incident_types?.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.incident_name}
                                        </option>
                                    ))}
                            </select>
                        </th>
                        <th style={thStyle}>
                            <select
                                style={dropdownStyle}
                                value={selectedMonth}
                                onChange={handleDateChange}
                            >
                                <option value="all">Month</option>
                                {[
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ].map((month, index) => (
                                    <option key={month} value={index + 1}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </th>
                        <th style={thStyle}>
                            {" "}
                            <select
                                style={dropdownStyle}
                                value={selectedTime}
                                onChange={handleTimeChange}
                            >
                                <option value="all">Time Frame</option>
                                <option value="morning">
                                    Morning (5AM–12PM)
                                </option>
                                <option value="afternoon">
                                    Afternoon (12PM–5PM)
                                </option>
                                <option value="evening">
                                    Evening (5PM–9PM)
                                </option>
                                <option value="night">Night (9PM–5AM)</option>
                            </select>
                        </th>
                        <th style={thStyle}>Zone</th>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Reported By</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReports?.map((report, index) => (
                        <tr
                            key={report.id}
                            style={
                                index % 2 === 0
                                    ? rowStyleEven
                                    : { backgroundColor: "#fff" }
                            }
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "#f1f1f1")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    index % 2 === 0 ? "#f9f9f9" : "#fff")
                            }
                        >
                            <td style={tdStyle}>
                                {report?.incident_type?.category?.category_name}
                            </td>
                            <td style={tdStyle}>
                                {report?.incident_type?.incident_name}
                            </td>
                            <td style={tdStyle}>{report?.date}</td>
                            <td style={tdStyle}>
                                {new Date(
                                    `1970-01-01T${report?.time}`
                                ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </td>
                            <td style={tdStyle}>
                                {report?.location?.zone?.zone_name}
                            </td>
                            <td style={tdStyle}>
                                {report?.location?.location_name}
                            </td>
                            <td style={tdStyle}>{report?.user?.name}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleOpen(report.id)}>
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedReportId && (
                <ReportDetails
                    reportId={selectedReportId}
                    onClose={() => setSelectedReportId(null)}
                />
            )}
        </div>
    );
};

export default ReportTable;
