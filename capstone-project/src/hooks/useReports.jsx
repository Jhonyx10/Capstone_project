import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { getReports } from "../functions/ReportsApi";


const useReports = () => {
    const { base_url, token, setReports } = useAppState()

     return useQuery({
         queryKey: ["reports"],
         queryFn: () => getReports({ base_url, token }),
         onSuccess: (data) => {
             console.log(data);
             setReports(data.reports);
         },
     });
}
export default useReports