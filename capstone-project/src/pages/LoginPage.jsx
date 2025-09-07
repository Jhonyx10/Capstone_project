import { useState } from "react";
import { UserLogin } from "../functions/AuthApi";
import { useMutation } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const { setLogin, setUser, setToken, base_url } = useAppState();
    const navigate = useNavigate();

    const [loginForm, setLoginForm] = useState({
        name: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const loginMutation = useMutation({
        mutationFn: UserLogin,
        onSuccess: async (data) => {
            if (data.user.role !== "admin") {
                alert("Access denied. Only admins can log in.");
                return; 
            }
            await setToken(data.token);
            setLogin(true);
            setUser(data.user);
            navigate("/dashboard");
            console.log(data);
        },
        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstKey = Object.keys(errors)[0];
                const firstMessage = errors[firstKey][0];
                alert(firstMessage);
            } else {
                alert("Login failed. Please try again.");
            }
        },
    });

    const handleLogin = (e) => {
        e.preventDefault(); 
        loginMutation.mutate({ base_url, loginForm });
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <h5>Username</h5>
                <input
                    type="text"
                    name="name"
                    value={loginForm.name}
                    onChange={handleChange}
                />

                <h5>Password</h5>
                <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleChange}
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
