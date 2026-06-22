"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "./services/apiService";
import LoadingTemplate from "./components/loading/LoadingTemplate";
import { getAuthToken, saveAuthSession } from "./utils/session";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackToken = searchParams.get("token");
    const callbackNickName = searchParams.get("nickName");
    const error = searchParams.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (callbackToken && callbackNickName) {
      saveAuthSession(callbackNickName, callbackToken);
      apiService.setAuthToken(callbackToken);
      router.replace("/lobby");
      return;
    }

    const storedToken = getAuthToken();
    if (storedToken) {
      apiService.setAuthToken(storedToken);
      router.replace("/lobby");
    } else {
      router.replace("/login");
    }
  }, [router, searchParams]);

  return null;
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingTemplate message="Opening your game..." />}>
      <HomeContent />
    </Suspense>
  );
}