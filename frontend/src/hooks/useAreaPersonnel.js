import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import {
    getAreaPersonnel,
    assignPersonnel,
    updatePersonnelStatus,
    removePersonnel,
    transferPersonnel,
    getApiError,
} from "../functions/OperationApi";

/**
 * Personnel stationed in an area.
 *
 *   const { personnel, assign, setStatus, remove, transfer } = useAreaPersonnel(areaId);
 *
 * personnel -> query: assignments in the area, each with its user
 * assign    -> mutation: { userIds, status? }  -> { failed: [{ userId, message }] }
 * setStatus -> mutation: { userId, status }    (active | inactive | standby)
 * remove    -> mutation: { userId }
 * transfer  -> mutation: { userId, toAreaId, status? }
 */
const useAreaPersonnel = (areaId = null) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const personnel = useQuery({
        queryKey: ["areas", areaId, "personnel"],
        queryFn: () => getAreaPersonnel({ base_url, token, areaId }),
        enabled: Boolean(areaId),
    });

    // refreshes this area, the operation's area cards (active_personnel_count)
    // and the operation-wide personnel list
    const refresh = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: ["areas"] }),
            queryClient.invalidateQueries({ queryKey: ["operations"] }),
        ]);

    // assigns one by one so a single failure (area full, operation not
    // deployable) doesn't stop the rest. Returns the ones that failed.
    const assign = useMutation({
        mutationFn: async ({ userIds, status = "active" }) => {
            const failed = [];
            for (const userId of userIds) {
                try {
                    await assignPersonnel({
                        base_url,
                        token,
                        areaId,
                        userId,
                        status,
                    });
                } catch (error) {
                    failed.push({
                        userId,
                        message: getApiError(error, "Could not be assigned."),
                    });
                }
            }
            return { failed };
        },
        onSuccess: refresh,
    });

    const setStatus = useMutation({
        mutationFn: ({ userId, status }) =>
            updatePersonnelStatus({ base_url, token, areaId, userId, status }),
        onSuccess: refresh,
    });

    const remove = useMutation({
        mutationFn: ({ userId }) =>
            removePersonnel({ base_url, token, areaId, userId }),
        onSuccess: refresh,
    });

    const transfer = useMutation({
        mutationFn: ({ userId, toAreaId, status = "active" }) =>
            transferPersonnel({
                base_url,
                token,
                fromAreaId: areaId,
                toAreaId,
                userId,
                status,
            }),
        onSuccess: refresh,
    });

    return { personnel, assign, setStatus, remove, transfer };
};

export default useAreaPersonnel;
