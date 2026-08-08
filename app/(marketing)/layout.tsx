import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

/**
 * Marketing runs dark regardless of the visitor's theme — the landing page is
 * a pitch, and it is art-directed for one canvas. The app keeps light, dark
 * and system working through the theme toggle.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="dark bg-background flex min-h-screen flex-col">
      <NavMobile />
      <NavBar scroll={true} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
