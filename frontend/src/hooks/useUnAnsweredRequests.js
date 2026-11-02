import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getUnansweredRequests } from "../functions/RequestApi";

const useUnansweredRequests = () => {
    const { base_url, token } = useAppState();

    // Key starts with "request" so your Echo listener's invalidate(["request"]) refreshes this too
    return useQuery({
        queryKey: ["request", "no_response"],
        queryFn: () => getUnansweredRequests({ base_url, token }),
    });
};

export default useUnansweredRequests;
