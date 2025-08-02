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
            volunteers: "",
            setVolunteers: (volunteers) => set({ volunteers }),
            base_url: "http://127.0.0.1:8000/api/",
            zones: [],
            setZones: (zones) => set({ zones }),
            reports: [],
            setReports: (reports) => set({ reports }),
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
                user: state.user
            }),
        }
    )
);

export default useAppState;
