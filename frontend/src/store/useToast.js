import { create } from "zustand";

let nextId = 1;
const timers = new Map();

// Separate from useAppState on purpose: that store ticks every second
// for the clock, and toasts shouldn't be tied to it or persisted.
const useToast = create((set, get) => ({
    toasts: [],

    showToast: ({ type = "success", title, message, duration = 3000 }) => {
        const id = nextId++;
        // Keep at most 4 on screen; drop the oldest
        set((s) => ({
            toasts: [...s.toasts, { id, type, title, message }].slice(-4),
        }));
        timers.set(
            id,
            setTimeout(() => get().dismissToast(id), duration)
        );
        return id;
    },

    dismissToast: (id) => {
        clearTimeout(timers.get(id));
        timers.delete(id);
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
}));

// Usable anywhere, including outside React components:
//   toast.success("Hotline added");
//   toast.error("This incident is outside the jurisdiction.", "Outside jurisdiction");
export const toast = {
    success: (message, duration) =>
        useToast.getState().showToast({ type: "success", message, duration }),
    error: (message, title, duration = 5000) =>
        useToast
            .getState()
            .showToast({ type: "error", message, title, duration }),
};

export default useToast;
