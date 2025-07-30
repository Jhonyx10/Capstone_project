import { useState } from "react"
import SideNav from "../components/SideNav"
import CreateTanodAccount from "../forms/CreateTanodAccount";
import TanodCard from "../components/TanodCard";

const Volunteers = () => {
    const [open, setOpen] = useState(false);

    const OpenForm = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div style={{ display: "flex" }}>
            <SideNav />
            <div style={{ width: "100%", padding: 5 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h1>Volunteers</h1>
                    <button onClick={OpenForm} style={{ height: "40px" }}>
                        Create Account
                    </button>
                    {open && (
                        <CreateTanodAccount onClose={() => setOpen(false)} />
                    )}
                </div>
                <div style={{display: 'flex', gap: 50, flexWrap: 'wrap'}}>
                    <TanodCard />
                </div>
            </div>
        </div>
    );
}
export default Volunteers