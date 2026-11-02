// GeoJSON Polygon helpers. Ring points are [longitude, latitude].

export const getBounds = (geometry) => {
    const ring = geometry?.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length === 0) return null;

    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return [
        [minX, minY],
        [maxX, maxY],
    ];
};

export const getCenter = (geometry) => {
    const bounds = getBounds(geometry);
    if (!bounds) return null;
    return {
        lat: (bounds[0][1] + bounds[1][1]) / 2,
        lng: (bounds[0][0] + bounds[1][0]) / 2,
    };
};

// same ray-casting check the API runs, so the user gets instant feedback
export const isPointInPolygon = (lng, lat, geometry) => {
    const ring = geometry?.coordinates?.[0];
    if (!Array.isArray(ring)) return true; // nothing drawn, nothing to check

    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
        ) {
            inside = !inside;
        }
    }
    return inside;
};

// columns are decimal(10,8) / decimal(11,8)
export const round8 = (value) =>
    value === null || value === undefined
        ? null
        : Number(Number(value).toFixed(8));
