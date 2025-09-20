import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { zoneReportDetails } from "../functions/Analytics";

const useZoneIncidentDetails = () => {
    const { base_url, token } = useAppState()

    return useQuery({
        queryKey: ['zone_incident_details'],
        queryFn: () => zoneReportDetails({base_url, token}),
        onSuccess: (data) => {
            console.log(data)
        }
    })
}
export default useZoneIncidentDetails;