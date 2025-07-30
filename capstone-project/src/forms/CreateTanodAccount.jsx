import useAppState from "../store/useAppState";
import { useState } from "react";
import { createTanodAccount } from "../functions/UsersApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CreateTanodAccount = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { token, base_url } = useAppState();
    const [accountForm, setAccountForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "tanod",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const accountMutation = useMutation({
        mutationFn:() => createTanodAccount({ base_url, token, accountForm }),
        onSuccess: async (data) => {
            alert("Account Created!!");
            queryClient.invalidateQueries(["volunteers"]);
           setAccountForm({
               name: "",
               email: "",
               password: "",
           });
           onClose();
        },
        onError: (error) => {
            alert(error);
            console.log("BASE_URL:", base_url);
            console.log("TOKEN:", token);
            console.log("Account Form:", accountForm);
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        accountMutation.mutate()
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <form onSubmit={handleSubmit}>
                    <h1>Create Account</h1>

                    <label>User Name</label>
                    <br />
                    <input
                        type="text"
                        name="name"
                        value={accountForm.name}
                        onChange={handleChange}
                    />
                    <br />
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        name="email"
                        value={accountForm.email}
                        onChange={handleChange}
                    />
                    <br />
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        name="password"
                        value={accountForm.password}
                        onChange={handleChange}
                    />
                    <br />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "8px",
        width: "300px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "15px",
        fontSize: "1.5rem",
        border: "none",
        background: "none",
        cursor: "pointer",
    },
};

export default CreateTanodAccount;
