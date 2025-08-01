import SideNav from "../components/SideNav";
import ReportTable from "../components/ReportsTable";
const Reports = () => {
    return (
        <div style={{ display: "flex" }}>
            <SideNav />
            <div>
                <h1>Reports</h1>
                    <ReportTable/>
            </div>
        </div>
    );
}
export default Reports