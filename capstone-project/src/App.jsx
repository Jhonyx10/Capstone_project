import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import AuthNavigation from "./navigation/AuthNavigation";
import { useEffect, useState } from "react";
import echo from "./echo";
import Notification from "./components/Notification";

const queryClient = new QueryClient()
export default function App() {
      const [message, setMessage] = useState(null);
      const [showModal, setShowModal] = useState(false);

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
                   console.log
                   setShowModal(true);
               });
           });

           return () => {
               listeners.forEach(({ channel }) => {
                   echo.leave(channel);
               });
           };
       }, []);
      
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <AuthNavigation />

                {showModal && (
                    <Notification
                        message={message}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </QueryClientProvider>
        </>
    );
}
