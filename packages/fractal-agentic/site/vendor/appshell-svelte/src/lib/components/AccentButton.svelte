<script lang="ts">
  export let label = 'Button';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<button {type} {disabled} class="accent"><slot>{label}</slot></button>

<style>
  .accent {
    min-height: 24px;
    padding: 4px 12px;
    border: 0;
    border-radius: 5px;
    color: #ffffff;
    background: var(--shell-accent);
    font-family: Geist, 'Google Sans Flex', system-ui, sans-serif;
    font-size: 15px;
    line-height: 16px;
    cursor: pointer;
  }
  .accent:disabled { cursor: not-allowed; opacity: 0.55; }
</style>
