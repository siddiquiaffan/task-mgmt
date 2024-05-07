import { SidebarLink } from "@/components/SidebarItems";
import { Cog, Globe, HomeIcon, ListTodo } from "lucide-react";

type AdditionalLinks = {
  title: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/tasks", title: "Tasks", icon: ListTodo },
  { href: "/account", title: "Account", icon: Cog },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [];

