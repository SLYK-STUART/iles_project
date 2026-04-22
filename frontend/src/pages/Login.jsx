import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import "./Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("accounts/login/", { email, password });

            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("role", res.data.role);

            const role = res.data.role;

            if (role === "STUDENT") navigate("/student");
            else if (role === "ADMIN") navigate("/admin");
            else if (role === "WP_SUP") navigate("/wp-supervisor");
            else if (role === "AC_SUP") navigate("/ac-supervisor");

        } catch (err) {
            console.log("LOGIN ERROR:", err.response?.data);
            console.log("STATUS:", err.response?.status);

            localStorage.removeItem("access_token");
            localStorage.removeItem("role")

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Login Failed"
            )
        }
    };

    return (
        <div className="login-bg">

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1>Welcome Back</h1>
                <p className="subtitle">Login to continue</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login
                    </motion.button>
                </form>

                <p className="switch-text">
                    Don’t have an account? <span>Register</span>
                </p>
            </motion.div>
        </div>
    );
}