<!--
  Dryer schematic. Side view, nozzle pointing right.
  The barrel display and handle controls are live; the nozzle collar and rear
  LED are still placeholders.
-->
<script>
  import BarrelDisplay from './BarrelDisplay.svelte';
  import { dryer } from './dryerState.svelte.js';

  // A press longer than this reads as a cool shot rather than a cycle.
  const HOLD_MS = 350;

  let holdTimer = null;
  let holdFired = false;

  function togglePower() {
    dryer.power = !dryer.power;
    if (!dryer.power) {
      clearHold();
      holdFired = false;
      dryer.coolShot = false;
    }
  }

  function cycleHeat() {
    dryer.heat = (dryer.heat % 3) + 1;
  }

  function cycleFan() {
    if (!dryer.power) return;
    dryer.fan = (dryer.fan % 3) + 1;
  }

  function clearHold() {
    if (holdTimer !== null) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  // Heat button: hold = cool shot, plain click = cycle. The cool shot leaves
  // dryer.heat untouched, so releasing returns to the previous level.
  function heatPressStart() {
    if (!dryer.power) return;
    clearHold();
    holdTimer = setTimeout(() => {
      holdTimer = null;
      holdFired = true;
      dryer.coolShot = true;
    }, HOLD_MS);
  }

  function heatPressEnd() {
    const wasCoolShot = holdFired;
    const stillPending = holdTimer !== null;
    clearHold();
    holdFired = false;

    if (wasCoolShot) {
      dryer.coolShot = false;
    } else if (stillPending && dryer.power) {
      cycleHeat();
    }
  }

  // Dragging off the button abandons the press rather than cycling.
  function heatPressCancel() {
    const wasCoolShot = holdFired;
    clearHold();
    holdFired = false;
    if (wasCoolShot) {
      dryer.coolShot = false;
    }
  }

  function onKey(event, action) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  // A leaked timer would flip coolShot after teardown.
  $effect(() => clearHold);
</script>

<svg
  class="dryer"
  viewBox="113 123 672 534"
  role="group"
  aria-label="Hair dryer with four interface zones"
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
  <g
    class="button"
    class:on={dryer.power}
    role="button"
    tabindex="0"
    aria-label="Power"
    aria-pressed={dryer.power}
    style="cursor:pointer"
    onclick={togglePower}
    onkeydown={(e) => onKey(e, togglePower)}
  >
    <rect x="245" y="370" width="55" height="40" rx="12" />
    <text x="272.5" y="395" pointer-events="none">PWR</text>
  </g>

  <g
    class="button"
    class:disabled={!dryer.power}
    role="button"
    tabindex="0"
    aria-label="Heat level — click to cycle, hold for cool shot"
    aria-disabled={!dryer.power}
    style={dryer.power ? 'cursor:pointer' : 'cursor:default'}
    onpointerdown={heatPressStart}
    onpointerup={heatPressEnd}
    onpointerleave={heatPressCancel}
    onpointercancel={heatPressCancel}
    onkeydown={(e) => onKey(e, () => dryer.power && cycleHeat())}
  >
    <rect x="245" y="440" width="55" height="40" rx="12" />
    <text x="272.5" y="465" pointer-events="none">HEAT</text>
  </g>

  <g
    class="button"
    class:disabled={!dryer.power}
    role="button"
    tabindex="0"
    aria-label="Fan speed — click to cycle"
    aria-disabled={!dryer.power}
    style={dryer.power ? 'cursor:pointer' : 'cursor:default'}
    onclick={cycleFan}
    onkeydown={(e) => onKey(e, cycleFan)}
  >
    <rect x="245" y="510" width="55" height="40" rx="12" />
    <text x="272.5" y="535" pointer-events="none">FAN</text>
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
    --button-fill: #ffffff;
    --button-press: #d8d4ce;
    --button-on: #8fd3a6;

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

  .button rect {
    fill: var(--button-fill);
    stroke: var(--body-stroke);
    stroke-width: 2;
  }

  .button text {
    text-anchor: middle;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    fill: var(--body-stroke);
  }

  .button:active rect {
    fill: var(--button-press);
  }

  .button.on rect {
    fill: var(--button-on);
  }

  /* Heat and fan read as unavailable while the dryer is off. */
  .button.disabled {
    opacity: 0.4;
  }

  .button.disabled:active rect {
    fill: var(--button-fill);
  }

  .button:focus-visible rect {
    stroke: #4b6bd6;
    stroke-width: 3;
  }

  .grille line {
    stroke: var(--body-stroke);
    stroke-width: 2;
    stroke-linecap: round;
  }
</style>
