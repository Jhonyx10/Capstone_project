import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { totalRequest } from "../functions/Analytics";

const useRequest = () => {
    const { base_url, token} = useAppState();

    return useQuery({
        queryKey: ["request"],
        queryFn: () => totalRequest({ base_url, token }),
    });
};
export default useRequest;
