<script lang="ts">
  import IconTextButton from './IconTextButton.svelte';
  export let label = '';
  export let href: string | undefined = undefined;
  export let icon: 'github' | 'share' | 'arrow' = 'share';
  export let reverse = false;
  export let accent = false;
</script>

<IconTextButton {label} {href} {icon} {reverse} {accent} />
