import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { sidebarLinks } from "@/config/dashboard";
import { auth } from "@/lib/auth";
import { AssistantContainer } from "@/components/assistant/assistant-container";
import {
  DashboardSidebar,
  MobileSheetSidebar,
} from "@/components/layout/dashboard-sidebar";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: ProtectedLayoutProps) {
  // 2. Pass the headers to getSession
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) redirect("/login");
  const user = session.user;

  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: section.items.filter(({ appRoles }) => {
      if (appRoles && !appRoles.includes(user.role!)) {
        return false;
      }
      return true;
    }),
  }));

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden lg:overflow-x-visible">
      <DashboardSidebar links={filteredLinks} role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background sticky top-0 z-50 flex h-14 px-4 lg:hidden lg:h-[60px] xl:px-8">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
            <MobileSheetSidebar links={filteredLinks} role={user.role} />
          </MaxWidthWrapper>
        </header>

        <main className="flex-1 p-4 xl:px-8">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </div>
      {session?.user?.role === "user" && <AssistantContainer />}
    </div>
  );
}
