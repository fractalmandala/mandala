<script lang="ts">
  import type { HeaderIcon } from '../types';
  import NavIconButton from './NavIconButton.svelte';
  export let icon: HeaderIcon = 'search';
  export let label = 'Action';
  export let href: string | undefined = undefined;
</script>

<NavIconButton {icon} {label} {href} />
