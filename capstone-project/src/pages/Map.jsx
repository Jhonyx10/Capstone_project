import SideNav from "../components/SideNav";


const Map = () => {
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
            </div>
            <div
                style={{
                    width: "15%",
                    height: "600px",
                    backgroundColor: "green",
                }}
            >
                <h1>Zones</h1>
                  
            </div>
        </div>
    );
}
export default Map