//assets
import Barangay from "../assets/img/Barangay.png";
import Tanod from "../assets/img/bpat.png";
import OCC from "../assets/img/OCC.jpg";
import Wrong from "../assets/animation/Wrong.json";

//packages and hooks
import { useState } from "react";
import { UserLogin } from "../functions/AuthApi";
import { useMutation } from "@tanstack/react-query";
import useAppState from "../store/useAppState";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

const LoginPage = () => {
    const { setLogin, setUser, setToken, base_url } = useAppState();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
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

    const loadingShow = (name, password) => {
        if (name && password) {
            setLoading(true);
        }
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
            setLoading(false);
            navigate("/dashboard");
            console.log(data);
        },
        onError: (error) => {
            setLoading(false);
            const errors = error.response?.data?.errors;
            setError(true);
            if (errors) {
                const firstKey = Object.keys(errors)[0];
                const firstMessage = errors[firstKey][0];
                setErrorMessage(firstMessage);
            } else {
                setErrorMessage("Login failed. Please try again.");
            }
        },
    });

    const handleLogin = (e) => {
        console.log(loginForm.name);
        console.log(loginForm.password);
        setError(false);
        e.preventDefault();
        loginMutation.mutate({ base_url, loginForm });
    };

    return (
        <motion.div className="md:min-h-screen bg-[#FBFBFB] dark:bg-gray-800 relative overflow-hidden">
            {/* Background gradient overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: 0.7,
                }}
            >
                <div
                    className="absolute inset-0 w-full h-full hidden md:flex"
                    style={{
                        background:
                            "linear-gradient(146deg, rgba(222, 238, 184, 0.00) 36.62%, #A9C46C 95.26%)",
                    }}
                />
            </motion.div>
            {/* Decorative background circles */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.7,
                }}
            >
                <div
                    className="absolute md:w-[798px] md:h-[798px]  w-[600px] h-[600px] rounded-full -left-[347px] -top-[337px] hidden md:flex"
                    style={{
                        background:
                            "linear-gradient(140deg, #5D8736 39.17%, #A9C46C 73.03%)",
                    }}
                />
            </motion.div>
            {/* background picture */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: 0.7,
                }}
            >
                <img
                    src={Tanod}
                    alt="Barangay officials working"
                    className="absolute sm:w-full sm:h-full object-cover opacity-10 "
                />
            </motion.div>
            {/* bottom right background circle */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.8,
                }}
            >
                <div
                    className="absolute w-[410px] h-[410px] rounded-full left-[2px] top-[550px] hidden lg:flex"
                    style={{
                        background:
                            "linear-gradient(140deg, #5D8736 39.17%, #A9C46C 73.03%)",
                    }}
                />
            </motion.div>
            {/* top right background circle */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.9,
                }}
            >
                <div
                    className="absolute w-[328px] h-[328px] rounded-full right-[-25px] top-[-100px] hidden lg:flex"
                    style={{
                        background:
                            "linear-gradient(140deg, #5D8736 39.17%, #A9C46C 73.03%)",
                    }}
                />
            </motion.div>
            {/* Main content container */}
            <motion.div
                layout
                className="relative z-10 flex md:min-h-screen w-full h-full items-center justify-center"
            >
                <div className="flex justify-center items-center bg-white dark:bg-gray-900 p-4 rounded-2xl">
                    {/* Left side - Login form */}
                    <div className="flex-1 flex flex-col justify-center sm:px-8 sm:pb-20">
                        <div className="w-full max-w-md mx-auto ">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.9,
                                }}
                            >
                                {/* Mobile-only content for right side */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 0.9,
                                    }}
                                    className="lg:hidden"
                                >
                                    <motion.img
                                        layout
                                        src={Barangay}
                                        alt="Barangay Igpit Logo"
                                        className="w-24 h-auto  mx-auto"
                                    />
                                </motion.div>
                                {/* Header */}
                                <motion.h1
                                    layout
                                    className="text-[36px] font-bold text-center text-[#5D8736] mb-4 mt-2 font-poppins"
                                >
                                    Magandang Araw
                                </motion.h1>
                            </motion.div>
                            {/* subheader */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.95,
                                }}
                            >
                                <motion.p
                                    layout
                                    className="text-[20px] font-light text-center text-[#5B5B5B] dark:text-white mb-2 font-poppins leading-normal"
                                >
                                    Pakilagay ang iyong mga detalye sa pag-login
                                    upang makapasok.
                                </motion.p>
                            </motion.div>
                            {/* error message */}
                            {error && (
                                <motion.div
                                    layout
                                    initial={{ y: -0.5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 0.1,
                                    }}
                                    className="bg-red-800 p-2 rounded-sm mb-2 flex items-center space-x-1"
                                >
                                    <Lottie
                                        className="h-6 w-6"
                                        animationData={Wrong}
                                        loop={false}
                                    />
                                    <motion.p
                                        layout
                                        className="text-white text-xs"
                                    >
                                        {errorMessage}
                                    </motion.p>
                                </motion.div>
                            )}
                            {/* Login form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Username field */}
                                <div className="relative">
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.97,
                                        }}
                                    >
                                        <label className="ml-2 block text-[16px] text-[#5B5B5B] dark:text-gray-400 mb-2 font-poppins">
                                            Username
                                        </label>

                                        <div className="relative">
                                            <input
                                                name="name"
                                                type="text"
                                                value={loginForm.name}
                                                onChange={handleChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleLogin(e);
                                                        setLoading(true);
                                                    }
                                                }}
                                                className="w-full p-4 pl-12 text-xl  border border-[#B4B4B4] rounded-[22px] bg-white dark:text-white  dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A9C46C] focus:border-transparent font-poppins"
                                                required
                                            />
                                            <svg
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 fill-[#A9C46C]"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M12 10C13.364 10 14.6721 9.47322 15.6365 8.53553C16.601 7.59785 17.1429 6.32608 17.1429 5C17.1429 3.67392 16.601 2.40215 15.6365 1.46447C14.6721 0.526784 13.364 0 12 0C10.636 0 9.32792 0.526784 8.36345 1.46447C7.39898 2.40215 6.85714 3.67392 6.85714 5C6.85714 6.32608 7.39898 7.59785 8.36345 8.53553C9.32792 9.47322 10.636 10 12 10ZM0 25C-2.34822e-08 23.4679 0.310389 21.9508 0.913446 20.5354C1.5165 19.1199 2.40042 17.8338 3.51472 16.7504C4.62902 15.6671 5.95189 14.8077 7.4078 14.2214C8.86371 13.6351 10.4241 13.3333 12 13.3333C13.5759 13.3333 15.1363 13.6351 16.5922 14.2214C18.0481 14.8077 19.371 15.6671 20.4853 16.7504C21.5996 17.8338 22.4835 19.1199 23.0866 20.5354C23.6896 21.9508 24 23.4679 24 25H0Z"
                                                    fill="#A9C46C"
                                                />
                                            </svg>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Password field */}
                                <div className="relative">
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 1,
                                        }}
                                    >
                                        <label className="ml-2 block text-[16px] text-[#5B5B5B] dark:text-gray-400  mb-2 font-poppins">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={loginForm.password}
                                                onChange={handleChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleLogin(e);
                                                        setLoading(true);
                                                    }
                                                }}
                                                className="w-full p-4 pl-12 border text-xl border-[#B4B4B4] rounded-[22px] bg-white dark:text-white  dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A9C46C] focus:border-transparent font-poppins"
                                                required
                                            />

                                            {/* lock icon left side */}
                                            <svg
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-7 fill-[#A9C46C]"
                                                viewBox="0 0 25 28"
                                                fill="none"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M3.57143 12.25V8.75C3.57143 6.42936 4.51211 4.20376 6.18655 2.56282C7.86098 0.921872 10.132 0 12.5 0C14.868 0 17.139 0.921872 18.8135 2.56282C20.4879 4.20376 21.4286 6.42936 21.4286 8.75V12.25C22.3758 12.25 23.2842 12.6187 23.954 13.2751C24.6237 13.9315 25 14.8217 25 15.75V24.5C25 25.4283 24.6237 26.3185 23.954 26.9749C23.2842 27.6313 22.3758 28 21.4286 28H3.57143C2.62423 28 1.71582 27.6313 1.04605 26.9749C0.376274 26.3185 0 25.4283 0 24.5V15.75C0 14.8217 0.376274 13.9315 1.04605 13.2751C1.71582 12.6187 2.62423 12.25 3.57143 12.25ZM17.8571 8.75V12.25H7.14286V8.75C7.14286 7.35761 7.70727 6.02226 8.71193 5.03769C9.71659 4.05312 11.0792 3.5 12.5 3.5C13.9208 3.5 15.2834 4.05312 16.2881 5.03769C17.2927 6.02226 17.8571 7.35761 17.8571 8.75Z"
                                                    fill="#A9C46C"
                                                />
                                            </svg>

                                            {/* Eye toggle button */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                            >
                                                {showPassword ? (
                                                    // 👁 Eye with slash (password visible)
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#A9C46C"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                        {/* Slash line */}
                                                        <line
                                                            x1="2"
                                                            y1="2"
                                                            x2="22"
                                                            y2="22"
                                                        />
                                                    </svg>
                                                ) : (
                                                    // 👁 Outline Eye (password hidden)
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#A9C46C"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 1.1,
                                    }}
                                >
                                    {/* Forgot password link */}
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            className="text-[14px] font-poppins"
                                        >
                                            <span className="text-[#5B5B5B] dark:text-white">
                                                Nalimutan ang Password?{" "}
                                            </span>
                                            <span className="text-[#5D8736] hover:underline">
                                                Click Here
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                                {/* log in button */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 1.1,
                                    }}
                                >
                                    <button
                                        type="submit"
                                        onClick={() =>
                                            loadingShow(
                                                loginForm.name,
                                                loginForm.password
                                            )
                                        }
                                        className="w-full p-4 rounded-[22px] text-white text-xl font-light font-poppins shadow-lg hover:opacity-90 transition-opacity"
                                        style={{
                                            background:
                                                "linear-gradient(173deg, #A9C46C 11.66%, #5D8736 128.43%)",
                                            boxShadow:
                                                "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                                        }}
                                    >
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            {loading ? (
                                                <svg
                                                    aria-hidden="true"
                                                    className="w-6 h-6 text-gray-200 animate-spin fill-green-500"
                                                    viewBox="0 0 100 101"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 
                                100.591C22.3858 100.591 0 78.2051 0 
                                50.5908C0 22.9766 22.3858 0.59082 50 
                                0.59082C77.6142 0.59082 100 22.9766 
                                100 50.5908ZM9.08144 50.5908C9.08144 
                                73.1895 27.4013 91.5094 50 91.5094C72.5987 
                                91.5094 90.9186 73.1895 90.9186 
                                50.5908C90.9186 27.9921 72.5987 9.67226 50 
                                9.67226C27.4013 9.67226 9.08144 27.9921 
                                9.08144 50.5908Z"
                                                        fill="currentColor"
                                                    />
                                                    <path
                                                        d="M93.9676 39.0409C96.393 
                                38.4038 97.8624 35.9116 97.0079 
                                33.5539C95.2932 28.8227 92.871 
                                24.3692 89.8167 20.348C85.8452 
                                15.1192 80.8826 10.7238 75.2124 
                                7.41289C69.5422 4.10194 63.2754 
                                1.94025 56.7698 1.05124C51.7666 
                                0.367541 46.6976 0.446843 41.7345 
                                1.27873C39.2613 1.69328 37.813 
                                4.19778 38.4501 6.62326C39.0873 
                                9.04874 41.5694 10.4717 44.0505 
                                10.1071C47.8511 9.54855 51.7191 
                                9.52689 55.5402 10.0491C60.8642 
                                10.7766 65.9928 12.5457 70.6331 
                                15.2552C75.2735 17.9648 79.3347 
                                21.5619 82.5849 25.841C84.9175 
                                28.9121 86.7997 32.2913 88.1811 
                                35.8758C89.083 38.2158 91.5421 
                                39.6781 93.9676 39.0409Z"
                                                        fill="currentFill"
                                                    />
                                                </svg>
                                            ) : null}
                                            <p className="text-lg font-medium">
                                                {loading
                                                    ? "Loading..."
                                                    : "Login"}
                                            </p>
                                        </div>
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                        {/* Footer */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                stiffness: 200,
                                damping: 20,
                                delay: 1.2,
                            }}
                        >
                            <div className="absolute sm:top-16 sm:left-34 hidden md:flex items-center justify-center">
                                <img
                                    src={OCC}
                                    alt="OCC Logo"
                                    className="w-6 h-6 rounded-xl mr-1"
                                />

                                <p className="text-[12px] dark:text-white text-black/50 font-poppins">
                                    | ©OCC IT Students 2025
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side - Image and content */}
                    <div className="hidden lg:flex flex-1 relative items-center justify-center">
                        {/* Background image container with rounded corners and overlay */}
                        <div className="relative w-full h-full">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 1.2,
                                }}
                                className="relative overflow-hidden rounded-[54px]"
                            >
                                {/* Background image */}
                                <img
                                    src={Tanod}
                                    alt="Barangay officials working"
                                    className="w-full h-[600px] object-cover"
                                />

                                {/* Green overlay */}
                                <div
                                    className="absolute inset-0 rounded-[54px]"
                                    style={{
                                        background: "rgba(169, 196, 108, 0.30)",
                                    }}
                                />

                                {/* Barangay logo */}
                                <div className="absolute bottom-75 right-36 z-10">
                                    <img
                                        src={Barangay}
                                        alt="Barangay Igpit Logo"
                                        className="w-32 h-auto"
                                    />
                                </div>

                                {/* Text overlay */}
                                <div className="absolute bottom-65 left-1/2 transform -translate-x-1/2 z-10">
                                    <h2 className="text-white text-center text-xl font-semibold font-poppins leading-tight">
                                        Barangay Igpit Incident
                                        <br />
                                        Management System
                                    </h2>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage;
