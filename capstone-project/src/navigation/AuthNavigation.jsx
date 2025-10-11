import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
    useLocation,
} from "react-router-dom";
import useAppState from "../store/useAppState";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Volunteers from "../pages/Volunteers";
import Map from "../pages/Map";
import Violators from "../pages/Violators";
import Reports from "../pages/Reports";
import Analytics from "../pages/Analytics";
import Hotline from "../pages/Hotline";
import Layout from "../pages/Layout";
import ReportDetails from "../components/details/ReportDetails";
import ViolatorsDetails from "../components/details/ViolatorsDetails";
import IncidentRequest from "../pages/IncidentRequest";
import Categories from "../pages/Categories";
import { AnimatePresence } from "framer-motion";

const ProtectedRoute = ({ children }) => {
    const { login } = useAppState((state) => state);
    return login ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
    const { login } = useAppState((state) => state);
    return login ? <Navigate to="/dashboard" /> : children;
};

// This wrapper handles animations for all routes
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/volunteers" element={<Volunteers />} />
                    <Route path="/map" element={<Map />} />
                    <Route path="/incident-request" element={<IncidentRequest/>}/>
                    <Route path="/violators" element={<Violators />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/analytics" element={<Analytics/>} />
                    <Route path="/hotline" element={<Hotline />} />
                    <Route path="/category" element={<Categories/>} />
                    <Route path="/report-details/:id" element={<ReportDetails/>}/>
                    <Route path="/violators-details/:id" element={<ViolatorsDetails/>}/>
                </Route>
            </Routes>
        </AnimatePresence>
    );
};

const AuthNavigation = ({ children }) => (
    <Router>
        <AnimatedRoutes />
        {children}
    </Router>
);

export default AuthNavigation;
