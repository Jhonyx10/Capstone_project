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

export const incidentRequest = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}request`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.request;
    } catch (error) {
         console.log(error);
         return [];
    }
}

export const locationDetails = async ({base_url, token, locationId}) => {
    try {
        const response = await axios.get(`${base_url}location-details/${locationId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data
    } catch (error) {
         console.log(error);
    }
}