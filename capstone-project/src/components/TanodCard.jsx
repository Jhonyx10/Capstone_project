import useVolunteers from "../hooks/useVolunteers";

const TanodCard = () => {
    
    const {data} = useVolunteers()
    
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
