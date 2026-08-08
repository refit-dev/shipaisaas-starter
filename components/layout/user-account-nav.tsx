"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUserStore } from "@/stores/userStore";
import { LayoutDashboard, Lock, LogOut, Settings } from "lucide-react";
import { Drawer } from "vaul";

import { authClient } from "@/lib/auth-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { resetUserStore } = useUserStore();
  const { resetAssistantStore } = useAssistantStore();

  const [open, setOpen] = useState(false);
  const closeDrawer = () => {
    setOpen(false);
  };

  async function handleSignOut() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear any client-side state related to the user or assistants
            resetUserStore();
            resetAssistantStore();
            window.location.href = "/login";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  const { isMobile } = useMediaQuery();

  if (!user)
    return (
      <div className="bg-muted size-8 animate-pulse rounded-full border" />
    );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger onClick={() => setOpen(true)}>
          <UserAvatar
            user={{ name: user.name, image: user.image || null }}
            className="size-9 border"
          />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="bg-background/80 fixed inset-0 z-40 h-full backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <Drawer.Content className="bg-background fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border px-3 text-sm">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="bg-muted-foreground/20 my-3 h-1.5 w-16 rounded-full" />
            </div>

            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="text-muted-foreground w-[200px] truncate">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <ul role="list" className="text-muted-foreground mt-1 mb-14 w-full">
              {user.role === "admin" ? (
                <li className="text-foreground hover:bg-muted rounded-lg">
                  <Link
                    href="/admin"
                    onClick={closeDrawer}
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              ) : null}

              <li className="text-foreground hover:bg-muted rounded-lg">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <LayoutDashboard className="size-4" />
                  <p className="text-sm">Dashboard</p>
                </Link>
              </li>

              <li className="text-foreground hover:bg-muted rounded-lg">
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="text-foreground hover:bg-muted rounded-lg"
                onClick={handleSignOut}
              >
                <div className="flex w-full items-center gap-3 px-2.5 py-2">
                  <LogOut className="size-4" />
                  <p className="text-sm">Log out </p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name, image: user.image || null }}
          className="size-8 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-muted-foreground w-[200px] truncate text-sm">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {user.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center space-x-2.5">
              <Lock className="size-4" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <LayoutDashboard className="size-4" />
            <p className="text-sm">Dashboard</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-2.5"
          >
            <Settings className="size-4" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
