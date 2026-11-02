import axios from "axios";


export const getCategories = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}get-categories`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.categories;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addCategory = async ({base_url, token, categoryName}) => {
    try {
        const response = await axios.post(
            `${base_url}add-category`,
            { category_name: categoryName },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.category
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addIncidentType = async ({base_url, token, form}) => {
    try {
        const response = await axios.post(`${base_url}add-incident-type`, form, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.incident_type;
    } catch (error) {
         console.log(error);
         throw error;
    }
}