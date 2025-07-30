import useAppState from "../store/useAppState"
import { Link } from "react-router-dom";
import Logout from "./Logout";
const SideNav = () => {
    const { user} = useAppState();

    return (
        <div style={{backgroundColor: 'blueViolet', padding: 10, color: '#fff'}}>
            <div>
                <h1>LOGO</h1>
                <h5>{user.name}</h5>
            </div>
            <nav>
                <ul>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/map">Map</Link>
                    </li>
                    <li>
                        <Link to="/reports">Reports</Link>
                    </li>
                    <li>
                        <Link to="/violators">Violators</Link>
                    </li>
                    <li>
                        <Link to="/volunteers">Volunteers</Link>
                    </li>
                </ul>
                <div style={{marginTop: 300}}>
                    <ul>
                        <li>
                            <Link to="/dashboard">Hotline</Link>
                        </li>
                        <li>
                            <Link to="/dashboard">Settings</Link>
                        </li>
                        <li>
                            <Logout />
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
}
export default SideNav