import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getReportViolators } from "../functions/ReportsApi";

const ReportViolators = ({ reportId }) => {
    const { token, base_url } = useAppState();

     const { data: reportViolators } = useQuery({
         queryKey: ["report_violators", reportId],
         queryFn: () => getReportViolators({ reportId, base_url, token }),
         onSuccess: (data) => {
             console.log(data);
         },
     });

    return (
        <div>
        <strong>Violators: </strong>
            {reportViolators?.map((item) => (
                <div key={item.id}>
                    <img src={item.violators?.photo} height={50} width={50} />
                    <p>Name:
                        {item.violators?.first_name} {item.violators?.last_name}
                    </p>
                    <p>Age: {item.violators?.age}</p>
                    <p>Address: {item.violators?.zone?.zone_name} , {item.violators?.address}</p>
                </div>
            ))}
        </div>
    );
    
};
export default ReportViolators;
