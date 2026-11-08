import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { notifications as fetchNotifications } from "../functions/Notification";

// Same ["notifications"] key that Notification.jsx invalidates after
// updateNotification, so the sidebar badges refresh automatically.
const useNotifications = () => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);

    return useQuery({
        queryKey: ["notifications"],
        // fetchNotifications returns undefined when its request fails (it
        // swallows the error), and React Query rejects undefined data
        queryFn: async () =>
            (await fetchNotifications({ base_url, token })) ?? [],
        enabled: !!token,
    });
};

export default useNotifications;
