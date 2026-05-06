import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ArrowLeftRight
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
  }
];
