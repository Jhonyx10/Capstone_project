import useAppState from "../store/useAppState"
import { useMutation } from "@tanstack/react-query";
import { UserLogout } from "../functions/AuthApi";
import { useNavigate } from "react-router-dom";
const Logout = () => {
    const { logout, base_url, token } = useAppState();
    const navigate = useNavigate();

   const Logout = useMutation({
        mutationFn:() => UserLogout({token, base_url}),
        onSuccess: () => {
            logout();
            navigate('/')
        },
        onError: (error) => {
            console.log(error)
        }
    })
    return(
        <button onClick={logout}>Logout</button>
    )
}
export default Logout