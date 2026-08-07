<script>
  import SidebarToggle from '@/SidebarToggle.svelte';
  import Logo from '@/Logo.svelte';
  import NavLink from '@/NavLink.svelte';
  import SearchLabel from '@/SearchLabel.svelte';
  import ButtonLink from '@/ButtonLink.svelte';
  import Sidebar from '@/Sidebar.svelte';
  import MainContent from '@/MainContent.svelte';
  import FooterNavigation from '@/FooterNavigation.svelte';
</script>

<div class="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen relative isolate antialiased">
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div class="h-[60vh] w-[60vh] rounded-full bg-gradient-to-br absolute -top-32 -left-32 from-green-200 via-lime-200 to-emerald-300 opacity-20 blur-2xl dark:opacity-0"></div>
    <div class="h-[40vh] w-[50vh] rounded-full bg-gradient-to-tr absolute -bottom-20 right-10 from-teal-300 via-green-300 to-lime-200 opacity-40 blur-3xl dark:opacity-0"></div>
    <div class="h-[35vh] w-[45vh] rounded-full bg-gradient-to-b dark:h-[28vh] absolute top-28 left-1/4 from-emerald-300 via-green-200 to-lime-100 opacity-60 blur-3xl dark:from-green-600 dark:via-emerald-500 dark:to-teal-400 dark:opacity-30"></div>
  </div>
  <header class="w-full bg-neutral-50/80 dark:bg-neutral-950/80 z-30 sticky top-0 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-md transition-colors duration-150">
    <div class="items-center justify-between px-4 sm:px-6 h-14 mx-auto flex max-w-screen-2xl gap-4">
      <div class="items-center flex gap-6">
        <SidebarToggle />
        <Logo />
        <nav class="lg:flex items-center hidden gap-1">
          <NavLink href="" text="Docs" active={false} />
          <NavLink href="" text="Components" active={true} />
          <NavLink href="" text="Blog" active={false} />
          <NavLink href="" text="Showcase" active={false} />
        </nav>
      </div>
      <div class="items-center sm:gap-3 flex gap-2">
        <SearchLabel />
        <ButtonLink type="button" svgContent="<svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' id='Windframe_KvHY5Bjsm' /><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'></path></svg>" hoverText="neutral-100" textColor="neutral-500" />
        <ButtonLink href="" svgContent="<svg class='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' id='Windframe_hfbuirNox' /><path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z'></path></svg>" hoverText="neutral-100" textColor="neutral-400" />
        <button type="button" class="inline-flex gap-1.5 hover:bg-green-700 active:bg-green-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950 items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md">Get started</button>
      </div>
    </div>
  </header>
  <div class="mx-auto max-w-screen-2xl flex">
    <Sidebar />
    <MainContent />
  </div>
  <FooterNavigation />
</div>