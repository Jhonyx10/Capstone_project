// "2026-11-05" -> "Nov 5, 2026". Parsed as local time so the day never shifts.
export const formatEventDate = (value) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
