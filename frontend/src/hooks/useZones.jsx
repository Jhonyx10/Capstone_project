import useAppState from "../store/useAppState";
import { getZones } from "../functions/LocationApi";
import { useQuery } from "@tanstack/react-query";

const useZones = () => {
    const { base_url, token, setZones } = useAppState();

    return useQuery({
        queryKey: ["zones"],
        queryFn: () => getZones({ base_url, token }),
        onSuccess: (data) => {
            setZones(data.zones);
            console.log("Zones fetched:", data);
        },
        onError: (error) => {
            console.error("Error fetching zones:", error);
        },
    });
};

export default useZones;
