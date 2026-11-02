import { useEffect, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// Colors for the polygon being drawn (the new area's boundary)
const DRAW_COLOR = "#3b82f6";

// Custom draw styles (the default ones are orange). The vertex layers must
// stay, because the draw tool uses them to detect clicks on corners.
const DRAW_STYLES = [
    // polygon fill
    {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        paint: {
            "fill-color": DRAW_COLOR,
            "fill-outline-color": DRAW_COLOR,
            "fill-opacity": 0.25,
        },
    },
    // polygon outline
    {
        id: "gl-draw-polygon-stroke",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
            "line-color": DRAW_COLOR,
            "line-dasharray": [0.2, 2],
            "line-width": 2,
        },
    },
    // line while the polygon is being drawn
    {
        id: "gl-draw-line",
        type: "line",
        filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
            "line-color": DRAW_COLOR,
            "line-dasharray": [0.2, 2],
            "line-width": 2,
        },
    },
    // corner points: white halo + colored dot
    {
        id: "gl-draw-vertex-halo",
        type: "circle",
        filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
        ],
        paint: { "circle-radius": 7, "circle-color": "#ffffff" },
    },
    {
        id: "gl-draw-vertex",
        type: "circle",
        filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
        ],
        paint: { "circle-radius": 5, "circle-color": DRAW_COLOR },
    },
    // midpoints (used to add corners when editing)
    {
        id: "gl-draw-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: { "circle-radius": 3, "circle-color": DRAW_COLOR },
    },
];

/**
 * Polygon draw tool. Reports the drawn GeoJSON geometry through onChange
 * (null when deleted). Bump resetKey to clear the canvas.
 * drawRef exposes the MapboxDraw instance so the map can check the current mode.
 */
const DrawControl = ({
    onChange,
    drawRef,
    resetKey = 0,
    position = "top-left",
}) => {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange; // always call the latest callback

    const handlers = useRef({});

    const draw = useControl(
        ({ map }) => {
            const control = new MapboxDraw({
                displayControlsDefault: false,
                controls: { polygon: true, trash: true },
                styles: DRAW_STYLES,
            });

            handlers.current = {
                create: (e) => {
                    const newest = e.features[0];
                    const stale = control
                        .getAll()
                        .features.map((f) => f.id)
                        .filter((id) => id !== newest.id);
                    if (stale.length) control.delete(stale);
                    onChangeRef.current?.(newest.geometry);
                },
                update: (e) => onChangeRef.current?.(e.features[0].geometry),
                remove: () => onChangeRef.current?.(null),
            };

            map.on("draw.create", handlers.current.create);
            map.on("draw.update", handlers.current.update);
            map.on("draw.delete", handlers.current.remove);

            if (drawRef) drawRef.current = control;
            return control;
        },
        ({ map }) => {
            map.off("draw.create", handlers.current.create);
            map.off("draw.update", handlers.current.update);
            map.off("draw.delete", handlers.current.remove);
            if (drawRef) drawRef.current = null;
        },
        { position }
    );

    useEffect(() => {
        if (!resetKey) return;
        try {
            draw.deleteAll();
        } catch {
            /* control not mounted yet */
        }
    }, [resetKey]);

    return null;
};

export default DrawControl;
