import { getCurrentTeam, getCurrentUser } from "@/lib/auth/actions";
import { getTeamSubscriptionPlan } from "@/lib/subscription";
import { PricingCards } from "@/components/pricing/pricing-cards";
import BentoFeatures from "@/components/sections/bento-features";
import BottomCta from "@/components/sections/bottom-cta";
import CoreFeatures from "@/components/sections/core-features";
import Faq from "@/components/sections/faq";
import HeroLanding from "@/components/sections/hero-landing";
import HowItWorks from "@/components/sections/how-it-works";
import LogoCloud from "@/components/sections/logo-cloud";
import PreviewLanding from "@/components/sections/preview-landing";
import Testimonials from "@/components/sections/testimonials";

export default async function IndexPage() {
  const user = await getCurrentUser();
  const team = await getCurrentTeam();
  const subscriptionPlan = team?.id
    ? ((await getTeamSubscriptionPlan(team.id)) ?? undefined)
    : undefined;

  return (
    <>
      <HeroLanding />
      {/* <PreviewLanding /> */}
      <LogoCloud />
      <BentoFeatures />
      <CoreFeatures />
      <HowItWorks />
      <Testimonials />
      <section className="bg-background py-24 sm:py-32">
        <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
      </section>
      <BottomCta />
      <Faq />
    </>
  );
}
