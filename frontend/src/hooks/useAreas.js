import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import {
    getAreas,
    getAreaDetails,
    createArea,
    updateArea,
    deleteArea,
} from "../functions/OperationApi";

/**
 * Areas (posts/zones) of an operation.
 *
 *   const { areas, create, update, remove } = useAreas(operationId);
 *   const { details } = useAreas(operationId, areaId);
 *
 * areas   -> query: areas of the operation, each with active_personnel_count
 * details -> query: one area with its operation and users (idle until areaId)
 * create  -> mutation: { name, latitude, longitude, capacity, geofence? }
 * update  -> mutation: { areaId, form }
 * remove  -> mutation: { areaId }
 */
const useAreas = (operationId = null, areaId = null) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const areas = useQuery({
        queryKey: ["operations", operationId, "areas"],
        queryFn: () => getAreas({ base_url, token, operationId }),
        enabled: Boolean(operationId),
    });

    const details = useQuery({
        queryKey: ["areas", areaId],
        queryFn: () => getAreaDetails({ base_url, token, areaId }),
        enabled: Boolean(areaId),
    });

    const refresh = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: ["operations"] }),
            queryClient.invalidateQueries({ queryKey: ["areas"] }),
        ]);

    const create = useMutation({
        mutationFn: (form) =>
            createArea({ base_url, token, operationId, form }),
        onSuccess: refresh,
    });

    const update = useMutation({
        mutationFn: ({ areaId: id, form }) =>
            updateArea({ base_url, token, areaId: id, form }),
        onSuccess: refresh,
    });

    const remove = useMutation({
        mutationFn: ({ areaId: id }) =>
            deleteArea({ base_url, token, areaId: id }),
        onSuccess: refresh,
    });

    return { areas, details, create, update, remove };
};

export default useAreas;
