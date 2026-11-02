import axios from "axios";

export const getGroups = async ({ base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}groups`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.groups ?? [];
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getGroupDetails = async ({ base_url, token, groupId }) => {
    try {
        const response = await axios.get(`${base_url}groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.group;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createGroup = async ({ base_url, token, form }) => {
    try {
        const response = await axios.post(`${base_url}groups`, form, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.group;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// assigns a tanod to a group, or moves them out of their current one
export const assignToGroup = async ({
    base_url,
    token,
    groupId,
    userId,
    reason,
}) => {
    try {
        const response = await axios.post(
            `${base_url}groups/${groupId}/members`,
            { user_id: userId, reason },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.assignment;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const unassignFromGroup = async ({ base_url, token, userId }) => {
    try {
        const response = await axios.delete(
            `${base_url}users/${userId}/group`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// pulls the first readable message out of a Laravel error response
export const getApiError = (error, fallback = "Something went wrong.") => {
    const data = error?.response?.data;
    const firstValidation = data?.errors
        ? Object.values(data.errors).flat()[0]
        : null;
    return firstValidation ?? data?.message ?? fallback;
};
