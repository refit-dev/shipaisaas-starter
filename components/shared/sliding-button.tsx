"use client";

import { ArrowUpRight } from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";

const DARK_BUTTON_BG = "linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)";
const DARK_ICON_BG = "linear-gradient(135deg, #000000 0%, #111111 100%)";
const DARK_TEXT = "#f8f7f5";

const LIGHT_BUTTON_BG = "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)";
const LIGHT_ICON_BG = "linear-gradient(135deg, #ffffff 0%, #efefef 100%)";
const LIGHT_TEXT = "#0a0a0a";

interface SlidingButtonProps {
  href: string;
  label: string;
  size?: "sm" | "md";
  variant?: "dark" | "light";
  external?: boolean;
  className?: string;
}

export function SlidingButton({
  href,
  label,
  size = "md",
  variant = "dark",
  external,
  className,
}: SlidingButtonProps) {
  const sm = size === "sm";
  const isLight = variant === "light";
  const buttonBg = isLight ? LIGHT_BUTTON_BG : DARK_BUTTON_BG;
  const iconBg = isLight ? LIGHT_ICON_BG : DARK_ICON_BG;
  const textColor = isLight ? LIGHT_TEXT : DARK_TEXT;

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative flex items-center overflow-hidden rounded-full font-semibold whitespace-nowrap w-fit",
        sm ? "h-9 pl-4 pr-10 text-sm" : "h-12 pl-6 pr-14 text-sm",
        className,
      )}
      style={{ background: buttonBg, color: textColor }}
    >
      <span
        className={cn(
          "relative z-10 transition-transform duration-500 ease-in-out",
          sm ? "group-hover:translate-x-6" : "group-hover:translate-x-8",
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "absolute right-1 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-in-out group-hover:rotate-45",
          sm
            ? "w-7 h-7 group-hover:right-[calc(100%-32px)]"
            : "w-10 h-10 group-hover:right-[calc(100%-44px)]",
        )}
        style={{ background: iconBg, color: textColor }}
      >
        <ArrowUpRight size={sm ? 13 : 16} />
      </div>
    </Link>
  );
}
