<script lang="ts">
  import PlainButton from './PlainButton.svelte';
  export let label = 'Button';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<PlainButton {label} {type} {disabled}><slot>{label}</slot></PlainButton>
