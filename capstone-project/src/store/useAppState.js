import { create } from "zustand";
import { persist } from "zustand/middleware";

// helper function to format date/time
const formatDateTime = () => {
    const now = new Date();
    const dateOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
    };
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    };
    const formattedDate = now.toLocaleDateString(undefined, dateOptions);
    const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
    return `${formattedDate}    ${formattedTime}`;
};

const useAppState = create(
    persist(
        (set, get) => {
            // keep clock ticking globally
            setInterval(() => {
                set({ currentDateTime: formatDateTime() });
            }, 1000);

            return {
                reportOpen: false,
                setReportOpen: (reportOpen) => set({reportOpen}),
                mapOpen: false,
                setMapOpen: (mapOpen) => set({ mapOpen }),
                login: false,
                setLogin: (login) => set({ login }),
                token: "",
                setToken: (token) => set({ token, login: true }),
                user: "",
                setUser: (user) => set({ user }),
                volunteers: [],
                setVolunteers: (volunteers) => set({ volunteers }),
                base_url: "http://127.0.0.1:8000/api/",
                map_token: import.meta.env.VITE_MAPBOX_TOKEN,
                zones: [],
                setZones: (zones) => set({ zones }),
                reports: [],
                setReports: (reports) => set({ reports }),
                categories: [],
                setCategories: (categories) => set({ categories }),
                incidentTypes: [],
                setIncidentTypes: (incidentTypes) => set({ incidentTypes }),
                open: false,
                setOpen: (open) => set({ open }),
                selected: "Dashboard",
                setSelected: (selected) => set({ selected }),
                route: null,
                setRoute: (route) => set({ route }),
                weather: null,
                setWeather: (weather) => set({ weather }),
                currentDateTime: formatDateTime(),
                dropdownOpen: false,
                setDropdownOpen: (dropdownOpen) => set({ dropdownOpen }),
                dropNotificationsOpen: false,
                setDropNotificationsOpen: (dropNotificationsOpen) =>
                    set({ dropNotificationsOpen }),
                map_styles: {
                    light: "mapbox://styles/mapbox/streets-v12",
                    dark: "mapbox://styles/joy143/cmeuj7k3i00jl01rk90g792d5",
                },
                // ✅ Dark Mode
                darkMode: false,
                toggleDarkMode: () => {
                    const newMode = !get().darkMode;
                    set({ darkMode: newMode });

                    if (newMode) {
                        document.documentElement.classList.add("dark");
                    } else {
                        document.documentElement.classList.remove("dark");
                    }
                },

                logout: () =>
                    set({
                        token: "",
                        login: false,
                        user: "",
                        zones: [],
                        reports: [],
                    }),
            };
        },
        {
            name: "app-storage",
            partialize: (state) => ({
                login: state.login,
                base_url: state.base_url,
                token: state.token,
                user: state.user,
                volunteers: state.volunteers,
                open: state.open,
                darkMode: state.darkMode, // ✅ persist dark mode
                selected: state.selected,
                map: state.map,
                mapOpen: state.mapOpen
            }),
            onRehydrateStorage: () => (state) => {
                // ✅ re-apply dark mode on reload
                if (state?.darkMode) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            },
        }
    )
);

export default useAppState;
