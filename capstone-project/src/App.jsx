import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
} from "@tanstack/react-query";
import AuthNavigation from "./navigation/AuthNavigation";
import { useEffect, useState } from "react";
import echo from "./echo";
import Notification from "./components/Notification";

const queryClient = new QueryClient();

function EchoListeners({ setMessage, setShowModal }) {
    const qc = useQueryClient();

    useEffect(() => {
        const listeners = [
            {
                channel: "request-response-channel",
                event: ".request-response-event",
            },
            {
                channel: "report-submitted-channel",
                event: ".report-submitted-event",
            },
            {
                channel: "violator-submitted-channel",
                event: ".violator-submitted-event",
            },
        ];

        listeners.forEach(({ channel, event }) => {
            echo.channel(channel).listen(event, (e) => {
                setMessage(e.response || e);
                setShowModal(true);
                qc.invalidateQueries({ queryKey: ["violators"] });
                qc.invalidateQueries({ queryKey: ["reports"] });
                qc.invalidateQueries({ queryKey: ["request"]});
                qc.invalidateQueries({ queryKey: ["analytics"] });
            });
        });

        return () => {
            listeners.forEach(({ channel }) => {
                echo.leave(channel);
            });
        };
    }, [qc, setMessage, setShowModal]);

    return null; // this component only handles side effects
}

export default function App() {
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthNavigation>
                <EchoListeners
                    setMessage={setMessage}
                    setShowModal={setShowModal}
                />
                {showModal && (
                    <Notification
                        message={message}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AuthNavigation>
        </QueryClientProvider>
    );
}
