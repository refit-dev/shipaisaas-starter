"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserProvider() {
  const { data: userData, isLoading } = useSWR<any>("/api/user", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
  const setUser = useUserStore((state) => state.setUser);
  const setUserSubscriptionPlan = useUserStore(
    (state) => state.setUserSubscriptionPlan,
  );
  const setStatus = useUserStore((state) => state.setStatus);

  useEffect(() => {
    setUser((userData?.user as any) || null); // update store on login OR logout
    setUserSubscriptionPlan((userData?.subscriptionPlan as any) || null);
    setStatus(
      isLoading
        ? "loading"
        : userData?.user
          ? "authenticated"
          : "unauthenticated",
    );
  }, [userData, setUser, isLoading, setStatus]);

  return null;
}

// 🔑 Call this after login/logout:
export function refreshUser() {
  return mutate("/api/user");
}
