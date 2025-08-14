import axios from "axios";


export const getZones = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}get-zones`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.zones ?? [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getLocations = async ({base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}get-locations`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.locations ?? [];
    } catch (error) {
          console.log(error);
          return [];
    }
}