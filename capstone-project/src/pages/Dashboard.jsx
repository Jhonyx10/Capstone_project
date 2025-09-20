import SideNav from "../components/SideNav";
import ZoneReportTotal from "../components/ZoneReportTotal";
import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getReports } from "../functions/ReportsApi";
import { useEffect } from "react";
const Dashboard = () => {
     const { base_url, token, setReports } = useAppState();

      const { data } = useQuery({
          queryKey: ["reports"],
          queryFn: () => getReports({ base_url, token }),
          onSuccess: (data) => {
              console.log(data);
          },
      });

         useEffect(() => {
             if (data) {
                 setReports(data);
             }
         }, [data]);

    return (
        <div style={{ display: "flex" }}>
            <SideNav />
            <div>
                <h1>Dashboard</h1>
                <ZoneReportTotal/>
            </div>
        </div>
    );
}
export default Dashboard