<script>
  import { dryer, HEAT_LABELS, HEAT_TEMPS } from './dryerState.svelte.js';
</script>

<div class="readout">
  <p>Power: {dryer.power ? 'ON' : 'OFF'}</p>
  <p>Heat: {HEAT_LABELS[dryer.heat - 1]} ({HEAT_TEMPS[dryer.heat - 1]}°F)</p>
</div>

<style>
  .readout {
    background: #1a1a1a;
    color: #fff;
    padding: 24px 32px;
    border-radius: 8px;
    font-family: ui-monospace, Consolas, monospace;
  }
</style>
