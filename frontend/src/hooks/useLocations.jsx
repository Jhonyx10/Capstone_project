import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getLocations } from "../functions/LocationApi";

const useLocations = () => {
    const { base_url, token } = useAppState();

    return useQuery({
        queryKey: ['locations'],
        queryFn: () => getLocations({base_url, token}),
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.log(error)
        }
    })
}

export default useLocations