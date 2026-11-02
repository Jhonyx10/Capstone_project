import axios from "axios";

export { getApiError } from "./GroupApi";

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// one place for the try/catch the group api repeats in every function
const request = async (call) => {
    try {
        const response = await call();
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/* ---------------- operations ---------------- */

// returns the Laravel paginator: { data: [...], current_page, last_page, total, ... }
export const getOperations = ({
    base_url,
    token,
    status,
    page = 1,
    perPage = 15,
}) =>
    request(() =>
        axios.get(`${base_url}operations`, {
            ...auth(token),
            params: { status, page, per_page: perPage },
        })
    );

// operation with its areas and each area's users
export const getOperationDetails = ({ base_url, token, operationId }) =>
    request(() =>
        axios.get(`${base_url}operations/${operationId}`, auth(token))
    );

// step 1: { name, latitude, longitude, status }
export const createOperation = ({ base_url, token, form }) =>
    request(() => axios.post(`${base_url}operations`, form, auth(token)));

export const updateOperation = ({ base_url, token, operationId, form }) =>
    request(() =>
        axios.put(`${base_url}operations/${operationId}`, form, auth(token))
    );

// step 2: geofence is a GeoJSON Polygon geometry
export const saveOperationGeofence = ({
    base_url,
    token,
    operationId,
    geofence,
}) =>
    request(() =>
        axios.put(
            `${base_url}operations/${operationId}/geofence`,
            { geofence },
            auth(token)
        )
    );

export const updateOperationStatus = ({
    base_url,
    token,
    operationId,
    status,
}) =>
    request(() =>
        axios.patch(
            `${base_url}operations/${operationId}/status`,
            { status },
            auth(token)
        )
    );

export const deleteOperation = ({ base_url, token, operationId }) =>
    request(() =>
        axios.delete(`${base_url}operations/${operationId}`, auth(token))
    );

// everyone deployed across all areas of the operation
export const getOperationPersonnel = ({
    base_url,
    token,
    operationId,
    status,
}) =>
    request(() =>
        axios.get(`${base_url}operations/${operationId}/personnel`, {
            ...auth(token),
            params: { status },
        })
    );

/* ---------------- areas ---------------- */

// each area includes active_personnel_count
export const getAreas = ({ base_url, token, operationId }) =>
    request(() =>
        axios.get(`${base_url}operations/${operationId}/areas`, auth(token))
    );

export const getAreaDetails = ({ base_url, token, areaId }) =>
    request(() => axios.get(`${base_url}areas/${areaId}`, auth(token)));

// step 3: { name, latitude, longitude, capacity, geofence? }
export const createArea = ({ base_url, token, operationId, form }) =>
    request(() =>
        axios.post(
            `${base_url}operations/${operationId}/areas`,
            form,
            auth(token)
        )
    );

export const updateArea = ({ base_url, token, areaId, form }) =>
    request(() => axios.put(`${base_url}areas/${areaId}`, form, auth(token)));

export const deleteArea = ({ base_url, token, areaId }) =>
    request(() => axios.delete(`${base_url}areas/${areaId}`, auth(token)));

/* ---------------- personnel ---------------- */

export const getAreaPersonnel = ({ base_url, token, areaId, status }) =>
    request(() =>
        axios.get(`${base_url}areas/${areaId}/personnel`, {
            ...auth(token),
            params: { status },
        })
    );

// step 4: assigns one user. Re-assigning an existing user just updates status.
export const assignPersonnel = ({
    base_url,
    token,
    areaId,
    userId,
    status = "active",
}) =>
    request(() =>
        axios.post(
            `${base_url}areas/${areaId}/personnel`,
            { user_id: userId, status },
            auth(token)
        )
    );

export const updatePersonnelStatus = ({
    base_url,
    token,
    areaId,
    userId,
    status,
}) =>
    request(() =>
        axios.patch(
            `${base_url}areas/${areaId}/personnel/${userId}`,
            { status },
            auth(token)
        )
    );

export const removePersonnel = ({ base_url, token, areaId, userId }) =>
    request(() =>
        axios.delete(
            `${base_url}areas/${areaId}/personnel/${userId}`,
            auth(token)
        )
    );

export const transferPersonnel = ({
    base_url,
    token,
    fromAreaId,
    toAreaId,
    userId,
    status = "active",
}) =>
    request(() =>
        axios.post(
            `${base_url}areas/${fromAreaId}/personnel/${userId}/transfer`,
            { to_area_id: toAreaId, status },
            auth(token)
        )
    );
