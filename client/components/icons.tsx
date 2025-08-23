// for icons, see https://react-icons.github.io/react-icons/
import { LucideIcon, Loader2, MoonIcon, SunIcon, ArrowRight,ArrowLeft,ArrowUp, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { siteConfig } from "@/config/site";
import LogoImage from "@/assets/logo.png";
import Image from "next/image";
import { IconType } from "react-icons";
import { SiOpenai } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";
import { TbBrandVercel } from "react-icons/tb";
import { SiNextdotjs } from "react-icons/si";
import { SiTailwindcss } from "react-icons/si";
import { SiTypescript } from "react-icons/si";
import { SiReact } from "react-icons/si";
import { SiNodedotjs } from "react-icons/si";
import { SiJavascript } from "react-icons/si";
import { SiExpress } from "react-icons/si";
import { SiMongodb } from "react-icons/si";
import { SiPrisma } from "react-icons/si";
import { SiPostgresql } from "react-icons/si";
import { SiRedis } from "react-icons/si";
import { SiDocker } from "react-icons/si";
import { SiKubernetes } from "react-icons/si";
import { FaHome, FaRegLightbulb, FaBookOpen, FaLifeRing, FaUserPlus } from "react-icons/fa";
export type Icons = LucideIcon | IconType;

export function Icons(props: { icon: Icons; className?: string }) {
    const Icon = props.icon;
    return <Icon className={cn("h-6 w-6", props.className)} />;
}

export function Logo(props: { className?: string }) {
    return (
        <Image
            src={LogoImage}
            alt="Logo"
            className={cn("h-6 w-6", props.className)}
        />
    );
}
export const IconsList = {
    logo: Logo,
    sun: SunIcon,
    moon: MoonIcon,
    loader: Loader2,
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    arrowUp: ArrowUp,
    menu: Menu,
    close: X,
    loading: Loader2,
    openai: SiOpenai,
    google: FaGoogle,
    vercel: TbBrandVercel,
    nextjs: SiNextdotjs,
    tailwindcss: SiTailwindcss,
    typescript: SiTypescript,
    react: SiReact,
    nodejs: SiNodedotjs,
    javascript: SiJavascript,
    express: SiExpress,
    mongodb: SiMongodb,
    prisma: SiPrisma,
    postgresql: SiPostgresql,
    redis: SiRedis,
    docker: SiDocker,
    kubernetes: SiKubernetes,
    //  icons for landing page navigation
    home: FaHome,
    features: FaRegLightbulb,
    resources: FaBookOpen,
    support: FaLifeRing,
    signup: FaUserPlus,
};