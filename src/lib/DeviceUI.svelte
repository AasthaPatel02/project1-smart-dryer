<!--
  Dryer schematic. Side view, nozzle pointing right.
  The barrel display is live; the remaining zones are still placeholders.
-->
<script>
  import BarrelDisplay from './BarrelDisplay.svelte';
</script>

<svg
  class="dryer"
  viewBox="113 123 672 534"
  role="img"
  aria-label="Hair dryer schematic with four interface zones"
>
  <!-- Body -->
  <g class="body">
    <!-- Handle, descending from the rear of the barrel -->
    <rect x="215" y="310" width="115" height="330" rx="42" />
    <!-- Barrel -->
    <rect x="130" y="140" width="510" height="200" rx="70" />
    <!-- Nozzle -->
    <polygon points="668,168 768,192 768,288 668,312" />
  </g>

  <!-- Zone: barrel top → main display (3 columns + notification bar) -->
  <BarrelDisplay />

  <!-- Zone: handle grip → power, heat, fan buttons -->
  <g class="zone">
    <rect x="245" y="370" width="55" height="40" rx="12" />
    <rect x="245" y="440" width="55" height="40" rx="12" />
    <rect x="245" y="510" width="55" height="40" rx="12" />
  </g>

  <!-- Zone: nozzle collar → LED ring -->
  <g class="zone">
    <rect x="640" y="160" width="28" height="160" rx="10" />
  </g>

  <!-- Zone: rear intake grille → filter LED -->
  <g class="grille">
    <line x1="168" y1="165" x2="168" y2="315" />
    <line x1="186" y1="158" x2="186" y2="322" />
    <line x1="204" y1="158" x2="204" y2="322" />
  </g>
  <g class="zone">
    <circle cx="186" cy="178" r="8" />
  </g>
</svg>

<style>
  .dryer {
    --body-fill: #e6e3de;
    --body-stroke: #4a4650;
    --zone-fill: #ffffff;
    --zone-stroke: #8a8494;

    display: block;
    margin: auto;
    width: 1200px;
    height: auto;
  }

  .body > * {
    fill: var(--body-fill);
    stroke: var(--body-stroke);
    stroke-width: 2;
  }

  .zone > * {
    fill: var(--zone-fill);
    stroke: var(--zone-stroke);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }

  .grille line {
    stroke: var(--body-stroke);
    stroke-width: 2;
    stroke-linecap: round;
  }
</style>
