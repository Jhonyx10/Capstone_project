import axios from "axios"

export const getTanodUser = async({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });
        console.log("API response:", response.data);
        return response.data.users ?? [];
    } catch (error) {
         console.error("Fetching data error:", error);
         return [];
    }
}

export const createTanodAccount = async ({base_url, token, accountForm }) => {
    try {
        const response = await axios.post(`${base_url}users`, accountForm, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            }
        })
        return response.data.user
    } catch (error) {
         console.error("Creating data error:", error);
         throw error;
    }
}