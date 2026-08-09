export interface SidebarLink {
	href: string;
	label: string;
}

let _alsoSee = $state<SidebarLink[]>([]);
let _footerActive = $state(true);

export const sidebarExtras = {
	get alsoSee() { return _alsoSee; },
	set alsoSee(links: SidebarLink[]) { _alsoSee = links; },
	get footerActive() { return _footerActive; },
};
