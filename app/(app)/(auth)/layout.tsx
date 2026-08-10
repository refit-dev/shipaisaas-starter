import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavMobile />
      <NavBar scroll={true} />
      {/* bg-background, not bg-muted: in dark mode --muted (#151518) and
          --card (#141417) are one value apart per channel, so a card on muted
          is invisible. Cards elsewhere on the site sit on the background for
          exactly this reason. */}
      <main className="bg-background flex flex-1 flex-col items-center justify-center px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
