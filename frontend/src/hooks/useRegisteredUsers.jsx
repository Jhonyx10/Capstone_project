import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { registeredUsers } from "../functions/Analytics";

const useRegisteredUsers = () => {
    const { token, base_url } = useAppState();

    return useQuery({
        queryKey: ["registered_users"],
        queryFn: () => registeredUsers({ token, base_url }),
    });
};
export default useRegisteredUsers;
