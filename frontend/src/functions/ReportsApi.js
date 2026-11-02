import axios from "axios";

export const getReports = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.reports ?? [];
    } catch (error) {
        console.log(error)
        return []
    }
}

export const getReportViolators = async ({reportId, base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}report-violators/${reportId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.report_violators;
    } catch (error) {
        console.log(error);
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

export const getIncidentTypes = async ({base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}get-incident-types`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.incidentTypes
    } catch (error) {
          console.log(error);
    }
}

export const getViolators = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}get-violators`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.violators ?? [];
    } catch (error) {
        console.log(error);
    }
}

export const reportDetails = async ({token, base_url, id}) => {
    try {
        const response = await axios.get(`${base_url}report-details/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.report_details;
    } catch (error) {
        console.log(error)
    }
}

export const violatorsDetails = async ({base_url, token, id}) => {
    try {
        const response = await axios.get(`${base_url}violator-details/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.violator
    } catch (error) {
        console.log(error);
    }
}

export const requestRecords = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}request/records`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data
    } catch (error) {
        console.log(error);
    }
}

export const getResidents = async ({base_url, token}) => {
    try {
        const response = await axios.get(`${base_url}residents`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data
    } catch (error) {
        console.log(error);
    }
}