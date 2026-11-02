import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { responseTimeCurPrev } from "../functions/Analytics";

const useCurPrevResponseTime = () => {
    const { token, base_url } = useAppState();

    return useQuery({
        queryKey: ['response_time'],
        queryFn: () => responseTimeCurPrev({ token, base_url}),
    })
}
export default useCurPrevResponseTime;