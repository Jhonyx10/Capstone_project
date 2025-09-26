import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { currentPreviousChanges } from "../functions/Analytics";

const useMonthsCurPrev = () => {
    const { token, base_url } = useAppState();

    return useQuery({
        queryKey:['month_cur-prev_data'],
        queryFn: () => currentPreviousChanges({ token, base_url})
    })
}
export default useMonthsCurPrev;