"use client";
import LoginForm from "../components/auth/LoginForm";
import { apiService } from "../services/apiService";
import { useRouter } from "next/navigation";

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
            handleLogin(nickName,data.token);
        } catch {
            // error handled in LoginForm
        }
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoginForm onLogin={handleLoginSubmit} />
        </div>
    );
}