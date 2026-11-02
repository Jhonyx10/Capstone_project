import axios from "axios";

// ⚠️ Adjust to your Laravel route that lists incident requests.
const ENDPOINT = "incident-requests";

export const getUnansweredRequests = async ({ base_url, token }) => {
    try {
        const response = await axios.get(`${base_url}unanswered-requests`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return (response.data.requests ?? [])
            .map((r) => ({
                id: r.id,
                lat: parseFloat(r.latitude),
                lng: parseFloat(r.longitude),
                category: r.category?.category_name ?? "Uncategorized",
                createdAt: new Date(r.created_at),
            }))
            .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    } catch (error) {
        console.log(error);
        throw error;
    }
};
