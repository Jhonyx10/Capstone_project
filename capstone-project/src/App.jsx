import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import AuthNavigation from "./navigation/AuthNavigation";

const queryClient = new QueryClient()
export default function App() {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <AuthNavigation/>
            </QueryClientProvider>
        </>
    );
}
