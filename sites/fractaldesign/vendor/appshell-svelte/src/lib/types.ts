export interface NavigationLink {
  label: string;
  href: string;
}

export interface SidebarEntry extends NavigationLink {
  active?: boolean;
  emphasis?: boolean;
}

export interface SidebarGroup {
  label: string;
  items: SidebarEntry[];
}

export interface OutlineLink extends NavigationLink {
  active?: boolean;
}

export type HeaderIcon = 'search' | 'github' | 'panel' | 'theme';
