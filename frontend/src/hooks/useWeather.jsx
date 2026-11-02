import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";

const useWeather = () => {
    const setWeather = useAppState((state) => state.setWeather);
    const api = {
        base: "https://api.openweathermap.org/data/2.5/",
        key: import.meta.env.VITE_WEATHER_KEY, // keep your API key in .env
    };

    return useQuery({
        queryKey: ["weather", "Igpit,Opol,PH"],
        queryFn: async () => {
            const res = await fetch(
                `${api.base}weather?q=Igpit,Opol,PH&units=metric&APPID=${api.key}`
            );
            const data = await res.json();

            if (data.cod !== 200) {
                throw new Error(data.message || "Failed to fetch weather");
            }

            // ✅ store in zustand
            setWeather(data);

            return data;
        },
        refetchInterval: 1000 * 60 * 60, // refresh every hour
    });
};

export default useWeather;
