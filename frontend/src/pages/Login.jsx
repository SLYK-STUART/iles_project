import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import "./Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("accounts/login/", {
                email,
                password
            });

            const { access, role, must_change_password } = res.data;

            localStorage.setItem("access_token", access);
            localStorage.setItem("role", role);

            const mustChange = must_change_password === true || must_change_password === "true";

            localStorage.setItem("must_change_password", mustChange);
 
            if (mustChange) {
                navigate("/change-password");
                return;
            }
 
            switch (role) {
                case "STUDENT":
                    navigate("/student");
                    break;
                case "ADMIN":
                    navigate("/admin");
                    break;
                case "WP_SUP":
                    navigate("/wp-supervisor");
                    break;
                case "AC_SUP":
                    navigate("/ac-supervisor");
                    break;
                default:
                    navigate("/");
            }

        } catch (err) {
            console.log("LOGIN ERROR:", err.response?.data);

            localStorage.removeItem("access_token");
            localStorage.removeItem("role");
            localStorage.removeItem("must_change_password");

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Login Failed"
            );
        } finally {
            setLoading(false);
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
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.05 } : {}}
                        whileTap={!loading ? { scale: 0.95 } : {}}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}