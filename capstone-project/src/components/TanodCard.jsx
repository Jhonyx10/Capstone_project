import { getTanodUser } from "../functions/UsersApi";
import { useQuery } from "@tanstack/react-query";
import useAppState from "../store/useAppState";


const TanodCard = () => {
    const { token, base_url, setVolunteers } = useAppState();

    const { data } = useQuery({
        queryKey: ["volunteers"],
        queryFn: () => getTanodUser({ token, base_url }),
        onSuccess: (data) => {
            setVolunteers(data);
            console.log(data)
        },
    });

    return (
        <>
            {data?.map((volunteers) => (
                <div
                    key={volunteers.id}
                    style={{ backgroundColor: "green", padding: 10 }}
                >
                    <h1>Brgy. Tanod</h1>
                    <h5>User Name:</h5>
                    <h5>{volunteers.name}</h5>
                    <h5>Email:</h5>
                    <h5>{volunteers.email}</h5>
                </div>
            ))}
        </>
    );
}
export default TanodCard
