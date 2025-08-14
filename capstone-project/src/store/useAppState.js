import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppState = create(
    persist(
        (set) => ({
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
            logout: () =>
                set({
                    token: "",
                    login: false,
                    user: "",
                    zones: [],
                    reports: [],
                }),
        }),
        {
            name: "app-storage",
            partialize: (state) => ({
                login: state.login,
                base_url: state.base_url,
                token: state.token,
                user: state.user,
                volunteers: state.volunteers,
            }),
        }
    )
);

export default useAppState;
