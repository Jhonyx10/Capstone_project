import { useEffect, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

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
