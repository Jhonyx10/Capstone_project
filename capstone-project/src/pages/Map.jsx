import SideNav from "../components/SideNav";
import useAppState from "../store/useAppState";
import ReactMap from "../components/ReactMap";

const Map = () => {
    const { zones, user } = useAppState();
    return (
        <div style={{ display: "flex" }}>
            <SideNav />
            <div
                style={{
                    width: "100%",
                    height: "600px",
                    // backgroundColor: "blue",
                }}
            >
                <ReactMap/>
            </div>
        </div>
    );
}
export default Map