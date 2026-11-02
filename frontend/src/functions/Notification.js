import axios from "axios";

export const notifications = async({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}notifications`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.notifications ?? [];
    } catch (error) {
        console.log(error)
    }
}

export const updateNotification = async({base_url, token, id}) => {
    try {
        const response = await axios.put(`${base_url}update-notification/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.notification;
    } catch (error) {
        console.log(error);
    }
}