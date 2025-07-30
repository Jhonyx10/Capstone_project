import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppState = create(
    persist(
        (set) => ({
            login: false,
            token: "",
            user: "",
            volunteers: "",
            base_url: "http://127.0.0.1:8000/api/",
            setLogin: (login) => set({ login }),
            setToken: (token) => set({ token, login: true }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: "", login: false, user: "" }),
            setVolunteers: (volunteers) => set({ volunteers }),
        }),
        {
            name: "app-storage",
            partialize: (state) => ({
                login: state.login,
                base_url: state.base_url,
                token: state.token,
            }),
        }
    )
);

export default useAppState;
