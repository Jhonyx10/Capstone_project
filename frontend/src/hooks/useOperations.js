import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import {
    getOperations,
    getOperationDetails,
    getOperationPersonnel,
    createOperation,
    updateOperation,
    saveOperationGeofence,
    updateOperationStatus,
    deleteOperation,
} from "../functions/OperationApi";

/**
 * Operations: list, details, create, geofence, status, delete.
 *
 *   const { operations, details, personnel, create, saveGeofence } = useOperations();
 *   const { details } = useOperations({ operationId });
 *
 * operations   -> query: paginated list ({ data, last_page, ... }); takes { status, page }
 * details      -> query: one operation with areas + users (idle until operationId)
 * personnel    -> query: everyone deployed across the operation's areas
 * create       -> mutation: { name, latitude, longitude, status }
 * update       -> mutation: { operationId, form }
 * saveGeofence -> mutation: { operationId, geofence }  (GeoJSON Polygon)
 * setStatus    -> mutation: { operationId, status }
 * remove       -> mutation: { operationId }
 */
const useOperations = ({
    operationId = null,
    status = null,
    page = 1,
} = {}) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const operations = useQuery({
        queryKey: ["operations", { status, page }],
        queryFn: () => getOperations({ base_url, token, status, page }),
        keepPreviousData: true,
    });

    const details = useQuery({
        queryKey: ["operations", operationId],
        queryFn: () => getOperationDetails({ base_url, token, operationId }),
        enabled: Boolean(operationId),
    });

    const personnel = useQuery({
        queryKey: ["operations", operationId, "personnel"],
        queryFn: () => getOperationPersonnel({ base_url, token, operationId }),
        enabled: Boolean(operationId),
    });

    // every key starts with "operations", so this refreshes the list,
    // details, areas and personnel of every open operation
    const refresh = () =>
        queryClient.invalidateQueries({ queryKey: ["operations"] });

    const create = useMutation({
        mutationFn: (form) => createOperation({ base_url, token, form }),
        onSuccess: refresh,
    });

    const update = useMutation({
        mutationFn: ({ operationId: id, form }) =>
            updateOperation({ base_url, token, operationId: id, form }),
        onSuccess: refresh,
    });

    const saveGeofence = useMutation({
        mutationFn: ({ operationId: id, geofence }) =>
            saveOperationGeofence({
                base_url,
                token,
                operationId: id,
                geofence,
            }),
        onSuccess: refresh,
    });

    const setStatus = useMutation({
        mutationFn: ({ operationId: id, status: next }) =>
            updateOperationStatus({
                base_url,
                token,
                operationId: id,
                status: next,
            }),
        onSuccess: refresh,
    });

    const remove = useMutation({
        mutationFn: ({ operationId: id }) =>
            deleteOperation({ base_url, token, operationId: id }),
        onSuccess: refresh,
    });

    return {
        operations,
        details,
        personnel,
        create,
        update,
        saveGeofence,
        setStatus,
        remove,
    };
};

export default useOperations;
