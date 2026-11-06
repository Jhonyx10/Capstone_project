import axios from "axios";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

// Builds multipart form data (needed because of the image upload).
// Skips empty values and only sends `image` when it's a real File.
const toFormData = (form) => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        if (key === "image" && !(value instanceof File)) return;
        data.append(key, value);
    });
    return data;
};

// filters: { search, type, status, trashed }
export const getWatchLists = async ({ base_url, token, filters = {} }) => {
    try {
        const params = { paginate: false };
        if (filters.search) params.search = filters.search;
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.trashed) params.trashed = 1;

        const response = await axios.get(`${base_url}watch-lists`, {
            headers: authHeaders(token),
            params,
        });
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getWatchList = async ({ base_url, token, id }) => {
    try {
        const response = await axios.get(`${base_url}watch-lists/${id}`, {
            headers: authHeaders(token),
        });
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createWatchList = async ({ base_url, token, form }) => {
    try {
        const response = await axios.post(
            `${base_url}watch-lists`,
            toFormData(form),
            { headers: authHeaders(token) }
        );
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// PHP doesn't read multipart bodies on real PUT requests, so this is a POST
// with `_method=PUT`. Works whether or not a new image is included.
export const updateWatchList = async ({ base_url, token, id, form }) => {
    try {
        const body = toFormData(form);
        body.append("_method", "PUT");

        const response = await axios.post(
            `${base_url}watch-lists/${id}`,
            body,
            {
                headers: authHeaders(token),
            }
        );
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const deleteWatchList = async ({ base_url, token, id }) => {
    try {
        const response = await axios.delete(`${base_url}watch-lists/${id}`, {
            headers: authHeaders(token),
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const restoreWatchList = async ({ base_url, token, id }) => {
    try {
        const response = await axios.post(
            `${base_url}watch-lists/${id}/restore`,
            {},
            { headers: authHeaders(token) }
        );
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
