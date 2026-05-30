"use client";
import { toast } from "react-toastify";
import LoginForm from "../components/auth/LoginForm";
import { apiService } from "../services/apiService";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/theme/ThemeToggle";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (nickName: string, token: string) => {
        if (token) {
            sessionStorage.setItem("chess_token", token);
            sessionStorage.setItem("chess_nickName", nickName);
            apiService.setAuthToken(token);

            router.replace("/"); // Use Next.js router for navigation
        } else {
            console.error("Login failed, no token received");
        }
    };

    // Separated login logic
    const handleLoginSubmit = async (nickName: string) => {
        try {
            const data = await apiService.login(nickName);
            handleLogin(nickName, data.token);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Login failed");
            } else {
                toast.error("Login failed");
            }
        }
    };
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <LoginForm onLogin={handleLoginSubmit} />
        </div>
    );
}