import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Settings,
} from 'lucide-react';

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Budget',
    href: '/budget',
    icon: Wallet,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: PieChart,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
