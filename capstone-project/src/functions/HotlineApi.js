import axios from "axios";

export const getHotlines = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}hotline`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.hotlines
    } catch (error) {
        console.log(error)
    }
}

export const postHotline = async ({base_url, token, form}) => {
    try {
        const response = await axios.post(`${base_url}hotline`, form, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.hotline
    } catch (error) {
        console.log(error);
    }
}

export const updateHotline = async ({base_url, token, form, id}) => {
    try {
        const response = await axios.put(`${base_url}hotline/${id}`, form, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}