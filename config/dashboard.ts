import { SidebarNavItem } from "@/types";

// import { AppRole } from "@/lib/db/schema/account";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "ADMIN",
    items: [
      // Admin
      {
        href: "/admin",
        icon: "dashboard",
        title: "Dashboard",
        appRoles: ["admin", "superadmin"],
      },
      {
        href: "/admin/users",
        icon: "users",
        title: "Users",
        appRoles: ["admin", "superadmin"],
      },
      {
        href: "/admin/organizations",
        icon: "organization",
        title: "Organizations",
        appRoles: ["admin", "superadmin"],
      },
      {
        href: "/admin/usage",
        icon: "usage",
        title: "Usage",
        appRoles: ["admin", "superadmin"],
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      // User
      {
        href: "/dashboard",
        icon: "dashboard",
        title: "Dashboard",
        appRoles: ["user"],
      },
      {
        href: "/dashboard/tasks",
        icon: "task",
        title: "Tasks",
        appRoles: ["user"],
      },
      {
        href: "/dashboard/usage",
        icon: "usage",
        title: "Usage",
        appRoles: ["user"],
        teamRoles: ["admin", "owner"],
      },
      {
        href: "/dashboard/charts",
        icon: "lineChart",
        title: "Charts",
        appRoles: ["user"],
      },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      {
        href: "/organizations/settings",
        icon: "settings",
        title: "Settings",
        appRoles: ["user"],
        teamRoles: ["admin", "owner"],
      },
      {
        href: "/organizations/members",
        icon: "users",
        title: "Members",
        appRoles: ["user"],
      },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "Billing",
        appRoles: ["user"],
        teamRoles: ["admin", "owner"],
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
    ],
  },
  {
    title: "HELP",
    items: [
      { href: "/help", icon: "bookOpen", title: "Documentation" },
      {
        href: "#",
        icon: "messages",
        title: "Support",
        appRoles: ["user"],
        disabled: true,
      },
    ],
  },
];
