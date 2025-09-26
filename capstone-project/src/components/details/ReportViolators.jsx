import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getReportViolators } from "../../functions/ReportsApi";

const ReportViolators = ({ reportId }) => {
    const { token, base_url } = useAppState();

    const { data: reportViolators, isLoading } = useQuery({
        queryKey: ["report_violators", reportId],
        queryFn: () => getReportViolators({ reportId, base_url, token }),
    });

    if (isLoading) {
        return <p className="italic text-slate-400">Loading violators...</p>;
    }

    if (!reportViolators || reportViolators.length === 0) {
        return <p className="italic text-slate-400">No Violators Involved</p>;
    }

    return (
        <div className="space-y-4">
            {reportViolators.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg shadow-sm bg-slate-700 text-slate-200"
                >
                    <img
                        src={item.violators?.photo}
                        alt={item.violators?.first_name}
                        className="w-16 h-16 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                        <p className="font-semibold">
                            {item.violators?.first_name}{" "}
                            {item.violators?.last_name}
                        </p>
                        <p>Age: {item.violators?.age}</p>
                        <p>
                            Address: {item.violators?.zone?.zone_name},{" "}
                            {item.violators?.address}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReportViolators;
