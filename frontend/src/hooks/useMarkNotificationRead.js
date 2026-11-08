import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import useNotifications from "./useNotifications";
import { updateNotification } from "../functions/Notification";

/**
 * Marks the notification for one item as read when its details page opens.
 * `kind` is "report" | "request" | "violator"; it only fires if that item
 * actually has an unread notification, so normal visits make no request.
 */
const useMarkNotificationRead = (itemId, kind) => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const queryClient = useQueryClient();
    const { data: notifications = [] } = useNotifications();

    const { mutate } = useMutation({
        mutationFn: async ({ id }) => {
            const result = await updateNotification({ base_url, token, id });
            // TEMP: remove once it works
            console.log(
                "[mark-read] PUT update-notification/" + id,
                "->",
                result
            );
            return result ?? null;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    // the unread notification row for this item (matched on item_id + kind)
    const target = (Array.isArray(notifications) ? notifications : []).find(
        (n) =>
            String(n?.notification_type ?? "").includes(kind) &&
            Number(n?.item_id) === Number(itemId) &&
            Number(n?.status) === 0
    );

    // TEMP: remove once it works
    console.log("[mark-read] check", { itemId, kind, target });

    useEffect(() => {
        // send the notification's own id (the `id` column), not the item_id
        if (target) mutate({ id: target.id });
    }, [target?.id]);
};

export default useMarkNotificationRead;
