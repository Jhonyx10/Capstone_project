import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import useAppState from "../store/useAppState";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Volunteers from "../pages/Volunteers";
import Map from "../pages/Map";
import Violators from "../pages/Violators";
import Reports from "../pages/Reports";
import Hotline from "../pages/Hotline";

const ProtectedRoute = ({ children }) => {
    const { login } = useAppState((state) => state);
    return login ? children : <Navigate to="/"/>
}

const PublicRoute = ({ children }) => {
    const { login } = useAppState((state) => state);
    return login ? <Navigate to="/dashboard" /> : children;
};

const AuthNavigation = () => {

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/volunteers"
                    element={
                        <ProtectedRoute>
                            <Volunteers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/map"
                    element={
                        <ProtectedRoute>
                            <Map />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/violators"
                    element={
                        <ProtectedRoute>
                            <Violators />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hotline"
                    element={
                        <ProtectedRoute>
                            <Hotline />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default AuthNavigation