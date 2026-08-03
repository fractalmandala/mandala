<script lang="ts">
  import AccentButton from './AccentButton.svelte';
  export let label = 'Button';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<AccentButton {label} {type} {disabled}><slot>{label}</slot></AccentButton>
