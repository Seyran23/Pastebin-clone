"use client";
import { GlobeIcon, LinkIcon, Lock } from "lucide-react";

export type Exposure = "public" | "unlisted" | "private";

interface ExposureIconProps {
  exposure: Exposure;
  className?: string;
}

const iconMap: Record<Exposure, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  public: GlobeIcon,
  unlisted: LinkIcon,
  private: Lock,
};

export function ExposureIcon({ exposure, className = "" }: ExposureIconProps) {
  const Icon = iconMap[exposure] || GlobeIcon;
  return <Icon className={`w-4 h-4 text-neutral-400 ${className}`} />;
}
