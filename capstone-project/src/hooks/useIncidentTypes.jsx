import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getIncidentTypes } from "../functions/ReportsApi";

const useIncidentTypes = () => {
    const {setIncidentType, base_url, token } = useAppState();

    return useQuery({
        queryKey: ['incident_types'],
        queryFn: () => getIncidentTypes({base_url, token}),
        onSuccess: (data) => {
            setIncidentType(data.incidentTypes)
        }
    }) 
}
export default useIncidentTypes