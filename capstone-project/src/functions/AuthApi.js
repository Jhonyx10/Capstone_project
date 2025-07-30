import axios from "axios";

export const UserLogin = async ({ base_url, loginForm }) => {
    try {
        const response = await axios.post(`${base_url}login`, loginForm);
        return response.data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

export const UserLogout = async ({base_url, token}) => {
    try{
        const response = await axios.post(`${base_url}logout`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });
        return response.data;
    }catch(error) {
        console.log(error);
    }
}