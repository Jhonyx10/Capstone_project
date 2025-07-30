import useAppState from "../store/useAppState"
import SideNav from "../components/SideNav";
const Dashboard = () => {
    const { user } = useAppState();
    return(
        <div style={{display: 'flex'}}>
           <SideNav/>
           <div>
            <h1>Dashboard</h1>
           </div>
        </div>
    )
}
export default Dashboard