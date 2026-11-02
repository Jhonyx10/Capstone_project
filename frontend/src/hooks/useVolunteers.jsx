import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getTanodUser } from "../functions/UsersApi";

const useVolunteers = () => {
    const { base_url, token, setVolunteers } = useAppState();

    return useQuery({
        queryKey: ['volunteers'],
        queryFn: () => getTanodUser({base_url, token}),
        onSuccess: (data) => {
            console.log("Fetched volunteers:", data.users);
            setVolunteers(data.users)
        }
    })
}
export default useVolunteers