import SideNav from "../components/SideNav";
import ReportTable from "../components/ReportsTable";
const Reports = () => {
    return (
        <div style={{ display: "flex", margin: 0 }}>
            <div>
                <h1>Reports</h1>
                <ReportTable />
            </div>
        </div>
    );
};
export default Reports;
