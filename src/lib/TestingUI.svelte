<script>
  import { dryer } from './dryerState.svelte.js';
</script>

<h2>Testing</h2>
<button onclick={() => dryer.power = !dryer.power}>Toggle power</button>
<button onclick={() => dryer.heat = (dryer.heat % 3) + 1}>Cycle heat</button>

<style>
  button {
    display: block;
    margin: 8px 0;
    padding: 8px 14px;
    cursor: pointer;
  }
</style>
