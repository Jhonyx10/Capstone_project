import useAppState from "../store/useAppState";
import { getZones } from "../functions/LocationApi";
import { useQuery } from "@tanstack/react-query";

const Zones = () => {
    const { base_url, token, setZones } = useAppState();

    const {data} = useQuery({
        queryKey: ['zones'],
        queryFn: () => getZones({ base_url, token }),
        onSuccess: (data) => {
            setZones(data.zones);
            console.log(data)
        },
        onError: (error) => {
            console.log(error)
        }
    });

    return (
        <div>
            <ul>
                {data?.map((zone) => (
                    <li key={zone.id}>{zone.zone_name}</li>
                ))}
            </ul>
        </div>
    );
}
export default Zones