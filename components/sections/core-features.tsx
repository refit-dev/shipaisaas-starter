"use client";

import {
  BookOpenText,
  CreditCard,
  Database,
  Fingerprint,
  Globe,
  Lock,
  Mail,
  MoonStar,
  Receipt,
  ShieldHalf,
  Users,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

type AnimatedContainerProps = {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CoreFeatures() {
  const t = useTranslations("marketing.coreFeatures");

  const coreFeatures = [
    { title: t("authentication"), description: t("authenticationDesc"), icon: Fingerprint },
    { title: t("stripeBilling"), description: t("stripeBillingDesc"), icon: CreditCard },
    { title: t("customerPortal"), description: t("customerPortalDesc"), icon: Receipt },
    { title: t("teamWorkspaces"), description: t("teamWorkspacesDesc"), icon: Users },
    { title: t("adminDashboard"), description: t("adminDashboardDesc"), icon: ShieldHalf },
    { title: t("darkMode"), description: t("darkModeDesc"), icon: MoonStar },
    { title: t("mdxBlog"), description: t("mdxBlogDesc"), icon: BookOpenText },
    { title: t("emailTemplates"), description: t("emailTemplatesDesc"), icon: Mail },
    { title: t("databaseOrm"), description: t("databaseOrmDesc"), icon: Database },
    { title: t("rateLimiting"), description: t("rateLimitingDesc"), icon: Lock },
    { title: t("edgeReady"), description: t("edgeReadyDesc"), icon: Zap },
    { title: t("i18nSupport"), description: t("i18nSupportDesc"), icon: Globe },
  ];

  const COLS = 4;

  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        <AnimatedContainer className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {t("label")}
          </p>
          <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">
            {t("subtitle")}
          </p>
        </AnimatedContainer>

        <div className="overflow-hidden border border-dashed border-border">
          {Array.from({ length: Math.ceil(coreFeatures.length / COLS) }, (_, rowIndex) => (
            <AnimatedContainer
              key={rowIndex}
              delay={0.1}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {coreFeatures.slice(rowIndex * COLS, rowIndex * COLS + COLS).map((feature, i) => (
                <FeatureCard
                  key={i}
                  feature={feature}
                  className="border-r border-b border-dashed border-border"
                />
              ))}
            </AnimatedContainer>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
