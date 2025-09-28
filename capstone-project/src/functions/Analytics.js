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

export const MonthlyReport = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}monthly-reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.monthly_reports;
    } catch (error) {
        console.log(error);
    }
}

export const YearLyReportComparison = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}year-report-comparison`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.reports;
    } catch (error) {
         console.log(error);
    }
}

export const TotalReportByCategory = async ({base_url, token}) => {
    try {
        const response = await axios.get(
            `${base_url}total-reports-by-category`
        , {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.reports_total
    } catch (error) {
         console.log(error);
    }
}

export const ZonesAverageResponseTime = async ({base_url, token}) => {
    try {
        const response = await axios.get(
            `${base_url}average-response-time-per-zone`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data.response_time;
    } catch (error) {
        console.log(error)
    }
}

export const MonthlyRecordedViolators = async ({base_url, token}) => {
    try {
        const response = await axios.get(
            `${base_url}monthly-recorded-violators`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data.violators
    } catch (error) {
        console.log(error)
    }
}

export const ZoneTotalViolators = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}zone-total-violators`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.zone_violators;
    } catch (error) {
        console.log(error);
    }
}