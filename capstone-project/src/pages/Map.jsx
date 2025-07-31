import SideNav from "../components/SideNav";
import Zones from "../components/Zones";
import useAppState from "../store/useAppState";

const Map = () => {
    const { zones, user } = useAppState();
    return (
        <div style={{ display: "flex" }}>
            <SideNav />
            <div
                style={{
                    width: "100%",
                    height: "600px",
                    backgroundColor: "blue",
                }}
            >
                <h1>Map</h1>
                <h1>{user.name}</h1>
                {zones?.map((zone) => (
                    <li key={zone.id}>{zone.zone_name}</li>
                ))}
            </div>
            <div
                style={{
                    width: "15%",
                    height: "600px",
                    backgroundColor: "green",
                }}
            >
                <h1>Zones</h1>
                <Zones />
            </div>
        </div>
    );
}
export default Map