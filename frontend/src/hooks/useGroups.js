import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import {
    getGroups,
    getGroupDetails,
    createGroup,
    assignToGroup,
    unassignFromGroup,
    getApiError,
} from "../functions/GroupApi";

/**
 * Everything group-related in one hook.
 *
 *   const { groups, details, create, assign, unassign } = useGroups();
 *   const { details } = useGroups(groupId); // also loads that group's details
 *
 * groups   -> query: all groups with their current members
 * details  -> query: one group (idle until a groupId is passed)
 * create   -> mutation: { name, capacity, userIds? }
 * assign   -> mutation: { groupId, userIds }
 * unassign -> mutation: { userId }
 */
const useGroups = (groupId = null) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const groups = useQuery({
        queryKey: ["groups"],
        queryFn: () => getGroups({ base_url, token }),
    });

    // key starts with "groups" so invalidating ["groups"] refreshes this too
    const details = useQuery({
        queryKey: ["groups", groupId],
        queryFn: () => getGroupDetails({ base_url, token, groupId }),
        enabled: Boolean(groupId),
    });

    // refreshes the group list, every open group's details,
    // and the volunteer roster (which shows each tanod's current group)
    const refresh = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: ["groups"] }),
            queryClient.invalidateQueries({ queryKey: ["volunteers"] }),
        ]);

    // assigns one by one so a single failure (full group, wrong role)
    // doesn't stop the rest. Returns the ones that failed.
    const assignMany = async (targetGroupId, userIds) => {
        const failed = [];
        for (const userId of userIds) {
            try {
                await assignToGroup({
                    base_url,
                    token,
                    groupId: targetGroupId,
                    userId,
                });
            } catch (error) {
                failed.push({
                    userId,
                    message: getApiError(error, "Could not be assigned."),
                });
            }
        }
        return failed;
    };

    const create = useMutation({
        mutationFn: async ({ name, capacity, userIds = [] }) => {
            const group = await createGroup({
                base_url,
                token,
                form: { name, capacity },
            });
            const failed = await assignMany(group.id, userIds);
            return { group, failed };
        },
        onSuccess: refresh,
    });

    const assign = useMutation({
        mutationFn: async ({ groupId: targetGroupId, userIds }) => ({
            failed: await assignMany(targetGroupId, userIds),
        }),
        onSuccess: refresh,
    });

    const unassign = useMutation({
        mutationFn: ({ userId }) =>
            unassignFromGroup({ base_url, token, userId }),
        onSuccess: refresh,
    });

    return { groups, details, create, assign, unassign };
};

export default useGroups;
