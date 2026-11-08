import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import useNotifications from "./useNotifications";
import { updateNotification } from "../functions/Notification";

/**
 * Marks every unread notification of one type as read while the calling
 * page is open. It runs when the page opens and again whenever a new one
 * arrives (for example a new emergency request while the map is on screen).
 *
 * `type` is the exact notification_type, e.g. "request-notification".
 */
const useMarkTypeRead = (type) => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const queryClient = useQueryClient();
    const { data: notifications = [] } = useNotifications();

    // ids already sent, so a refetch can't trigger the same request twice
    const sent = useRef(new Set());

    const { mutate } = useMutation({
        mutationFn: (ids) =>
            Promise.all(
                ids.map((id) => updateNotification({ base_url, token, id }))
            ),
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const unreadIds = (Array.isArray(notifications) ? notifications : [])
        .filter((n) => n?.notification_type === type && Number(n?.status) === 0)
        .map((n) => n.id)
        .filter((id) => !sent.current.has(id));

    const key = unreadIds.join(",");

    useEffect(() => {
        if (!token || unreadIds.length === 0) return;
        unreadIds.forEach((id) => sent.current.add(id));
        mutate(unreadIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, token]);
};

export default useMarkTypeRead;
