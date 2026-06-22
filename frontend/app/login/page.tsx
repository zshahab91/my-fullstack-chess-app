"use client";
import { Suspense, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import LoginForm from "../components/auth/LoginForm";
import { apiService } from "../services/apiService";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "../components/theme/ThemeToggle";
import LoadingTemplate from "../components/loading/LoadingTemplate";
import { getAuthToken, saveAuthSession } from "../utils/session";

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = useCallback((nickName: string, token: string) => {
        if (token) {
            saveAuthSession(nickName, token);
            apiService.setAuthToken(token);

            router.replace("/lobby");
        } else {
            console.error("Login failed, no token received");
        }
    }, [router]);

    useEffect(() => {
        const existingToken = getAuthToken();
        if (existingToken) {
            apiService.setAuthToken(existingToken);
            router.replace("/lobby");
            return;
        }

        const token = searchParams.get("token");
        const nickName = searchParams.get("nickName");
        const error = searchParams.get("error");

        if (error) {
            toast.error(error);
            router.replace("/login");
            return;
        }

        if (token && nickName) {
            handleLogin(nickName, token);
        }
    }, [handleLogin, router, searchParams]);

    const handleLoginSubmit = async (nickName: string) => {
        try {
            const data = await apiService.login(nickName);
            handleLogin(nickName, data.token);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || "Login failed");
            } else {
                throw new Error("Login failed");
            }
        }
    };

    const handleOidcLogin = () => {
        const returnTo = `${window.location.origin}/`;
        window.location.href = apiService.getOidcStartUrl(returnTo);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <LoginForm onLogin={handleLoginSubmit} onOidcLogin={handleOidcLogin} />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingTemplate message="Preparing sign in..." />}>
            <LoginPageContent />
        </Suspense>
    );
}