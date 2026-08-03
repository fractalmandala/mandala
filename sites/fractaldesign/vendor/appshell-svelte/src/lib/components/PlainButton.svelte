<script lang="ts">
  export let label = 'Button';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<button {type} {disabled} class="plain"><slot>{label}</slot></button>

<style>
  .plain {
    min-height: 24px;
    padding: 3px 16px;
    border: 1px solid #636363;
    border-radius: 3px;
    color: #000000;
    background: #ffffff;
    font-family: Geist, 'Google Sans Flex', system-ui, sans-serif;
    font-size: 15px;
    line-height: 16px;
    cursor: pointer;
  }
  .plain:disabled { cursor: not-allowed; opacity: 0.55; }
</style>
