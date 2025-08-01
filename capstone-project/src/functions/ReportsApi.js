import axios from "axios";

export const getReports = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.reports
    } catch (error) {
        console.log(error)
    }
}

export const getCategories = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}get-categories`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.categories
    } catch (error) {
        console.log(error);
    }
}