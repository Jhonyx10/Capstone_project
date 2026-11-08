import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
} from "@tanstack/react-query";
import AuthNavigation from "./navigation/AuthNavigation";
import { useCallback, useEffect, useState } from "react";
import echo from "./echo";
import Notification from "./components/Notification";
import ToastHost from "./components/alerts/ToastHost";

const queryClient = new QueryClient();

const LISTENERS = [
    {
        kind: "request",
        channel: "request-response-channel",
        event: ".request-response-event",
    },
    {
        kind: "report",
        channel: "report-submitted-channel",
        event: ".report-submitted-event",
    },
    {
        kind: "violator",
        channel: "violator-submitted-channel",
        event: ".violator-submitted-event",
    },
    {
        kind: "sighting",
        channel: "sighting-submitted-channel",
        event: ".sighting-submitted-event",
    },
];

function EchoListeners({ onToast }) {
    const qc = useQueryClient();

    useEffect(() => {
        LISTENERS.forEach(({ kind, channel, event }) => {
            echo.channel(channel).listen(event, (e) => {
                console.log("[echo]", kind, e);
                onToast({ kind, data: e.response || e });
                qc.invalidateQueries({ queryKey: ["violators"] });
                qc.invalidateQueries({ queryKey: ["reports"] });
                qc.invalidateQueries({ queryKey: ["request"] });
                qc.invalidateQueries({ queryKey: ["analytics"] });
                qc.invalidateQueries({ queryKey: ["notifications"] });
                qc.invalidateQueries({ queryKey: ["sightings"] }); // adjust to your query key
            });
        });

        return () => {
            LISTENERS.forEach(({ channel }) => echo.leave(channel));
        };
    }, [qc, onToast]);

    return null;
}

export default function App() {
    const [toast, setToast] = useState(null);

    // unique id so back-to-back toasts replay the animation and timer
    const showToast = useCallback(
        (t) => setToast({ ...t, id: Date.now() }),
        []
    );
    const closeToast = useCallback(() => setToast(null), []);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthNavigation>
                <EchoListeners onToast={showToast} />
                <Notification toast={toast} onClose={closeToast} />
            </AuthNavigation>
            <ToastHost />
        </QueryClientProvider>
    );
}
