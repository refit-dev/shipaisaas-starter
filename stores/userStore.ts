import { UserSubscriptionPlan } from "@/types";
import { create } from "zustand";

import { User } from "@/lib/db/schema/account";

type UserState = {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setUser: (user: User | null) => void;
  setStatus: (status: "loading" | "authenticated" | "unauthenticated") => void;
  userSubscriptionPlan: UserSubscriptionPlan | null;
  setUserSubscriptionPlan: (plan: UserSubscriptionPlan | null) => void;
  resetUserStore: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userSubscriptionPlan: null,
  status: "loading",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setUserSubscriptionPlan: (plan) => set({ userSubscriptionPlan: plan }),
  resetUserStore: () =>
    set({
      user: null,
      userSubscriptionPlan: null,
      status: "loading",
    }),
}));
