import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getTanodUser } from "../functions/UsersApi";

// Same cache key as TanodCard, so the roster and groups share one fetch.
const useTanods = () => {
    const { base_url, token } = useAppState();

    return useQuery({
        queryKey: ["volunteers"],
        queryFn: () => getTanodUser({ base_url, token }),
    });
};

// full name from the profile, falling back to the account name
export const getVolunteerName = (volunteer) => {
    const p = volunteer?.profile;
    const full = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
    return full || volunteer?.name || "Unknown";
};

export default useTanods;
