import axios from "axios";

export const zoneReportDetails = async ({ base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}total-reports-by-zone`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.total
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const zoneAverageResponseTimeById = async ({ base_url, token, zoneId}) => {
    try {
        const response = await axios.get(
            `${base_url}average-response-time-by-zone/${zoneId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data.averageResponseTime;
    } catch (error) {
        console.log(error)
    }
}