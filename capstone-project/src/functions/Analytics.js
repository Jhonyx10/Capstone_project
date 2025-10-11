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

export const currentPreviousChanges = async ({ base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}months-current-previous`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.months
    } catch (error) {
        console.log(error);
    }
}

export const responseTimeCurPrev = async ({ base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}average-response-time`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.response_time;
    } catch (error) {
        console.log(error)
    }
}

export const registeredUsers = async ({ base_url, token }) => {
    try {
         const response = await axios.get(`${base_url}registered-users`, {
             headers: {
                 Authorization: `Bearer ${token}`,
             },
         });
         return response.data.registered_users;
    } catch (error) {
        console.log(error)
    }
}

export const violatorsViolationTotal = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}violators-violations`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.violations;
    } catch (error) {
        console.log(error);
    }
}


export const AnalyticalData = async ({base_url, token}) => {
    try {
           const response = await axios.get(`${base_url}analytics`, {
               headers: {
                   Authorization: `Bearer ${token}`,
               },
           });
           return response.data
    } catch (error) {
        console.log(error)
    }
}

export const totalRequest = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}total-requests`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.total_request;
    } catch (error) {
        console.log(error)
    }
}