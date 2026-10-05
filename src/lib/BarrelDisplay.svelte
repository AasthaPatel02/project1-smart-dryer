<!--
  Phase 3: barrel display contents.
  Drawn in the parent SVG's coordinate space, translated to the display zone.
  Internal coords are 0..300 across, 0..112 down.
-->
<script>
  import { dryer, HEAT_TEMPS, FAN_LABELS } from './dryerState.svelte.js';

  const COOL_TEMP = 80;

  function formatClock(total) {
    const s = Math.max(0, Math.floor(total));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // Overheat takes priority — while it is active the other two alerts are suppressed.
  const overheat = $derived(dryer.overheating);
  const heatDamageLit = $derived(dryer.heatDamage && !overheat);
  const filterLit = $derived(dryer.filterDue && !overheat);

  // Blank when the dryer is off. The one exception is the overheat cooldown,
  // which keeps the middle column alive as a countdown.
  const showHeat = $derived(dryer.power);
  const showFan = $derived(dryer.power);
  const showTimer = $derived(dryer.power || overheat);
  const showColumns = $derived(showHeat || showTimer || showFan);

  // Cool shot reads as a mode word in the label slot, so the value slot stays
  // the sensed temperature in every state.
  const heatLabel = $derived(dryer.coolShot ? 'COOL' : 'HEAT');
  const heatValue = $derived(`${dryer.coolShot ? COOL_TEMP : HEAT_TEMPS[dryer.heat - 1]}°F`);

  const timerLabel = $derived(overheat ? 'COOLDOWN' : 'TIMER');
  const timerValue = $derived(formatClock(overheat ? dryer.cooldownSeconds : dryer.sessionSeconds));

  const fanValue = $derived(FAN_LABELS[dryer.fan - 1]);
</script>

<g class="display" transform="translate(310, 165)">
  <rect class="screen" x="0" y="0" width="300" height="112" rx="8" />

  <!-- Three equal columns: label above value -->
  {#if showColumns}
    <g class="columns">
      <line class="rule" x1="100" y1="10" x2="100" y2="66" />
      <line class="rule" x1="200" y1="10" x2="200" y2="66" />

      {#if showHeat}
        <text class="label" x="50" y="27">{heatLabel}</text>
        <text class="value" class:alert={heatDamageLit} x="50" y="58">{heatValue}</text>
      {/if}

      {#if showTimer}
        <text class="label" class:alert={overheat} x="150" y="27">{timerLabel}</text>
        <text class="value" x="150" y="58">{timerValue}</text>
      {/if}

      {#if showFan}
        <text class="label" x="250" y="27">FAN</text>
        <text class="value" x="250" y="58">{fanValue}</text>
      {/if}
    </g>
  {/if}

  <!-- Notification bar: always visible, fixed positions, dimmed when inactive -->
  <line class="rule" x1="8" y1="74" x2="292" y2="74" />
  <g class="notifications">
    <!-- Heat damage to hair -->
    <g class="symbol damage" class:lit={heatDamageLit}>
      <polygon points="50,85 60,101 40,101" />
      <text class="glyph" x="50" y="99">!</text>
    </g>

    <!-- Overheating of tool -->
    <g class="symbol overheat" class:lit={overheat}>
      <polygon points="150,85 160,101 140,101" />
      <text class="glyph" x="150" y="99">!</text>
    </g>

    <!-- Filter needs cleaning -->
    <g class="symbol filter" class:lit={filterLit}>
      <rect x="240" y="86" width="20" height="15" rx="2" />
      <line x1="246" y1="89" x2="246" y2="98" />
      <line x1="250" y1="89" x2="250" y2="98" />
      <line x1="254" y1="89" x2="254" y2="98" />
    </g>
  </g>
</g>

<style>
  .display {
    --screen-fill: #1b1a20;
    --screen-stroke: #4a4650;
    --screen-text: #f2f0ec;
    --screen-dim: #8a8494;
    --screen-rule: #3a3744;
    --alert-amber: #e8a33d;
    --alert-red: #e24b3c;
  }

  .screen {
    fill: var(--screen-fill);
    stroke: var(--screen-stroke);
    stroke-width: 2;
  }

  .rule {
    stroke: var(--screen-rule);
    stroke-width: 1.5;
  }

  text {
    text-anchor: middle;
    fill: var(--screen-text);
  }

  .label {
    font-size: 11px;
    letter-spacing: 0.12em;
    fill: var(--screen-dim);
  }

  .label.alert {
    fill: var(--alert-red);
  }

  .value {
    font-size: 26px;
    font-weight: 600;
  }

  .value.alert {
    fill: var(--alert-red);
  }

  /* Inactive symbols stay in place, dimmed; lit ones take their alert color. */
  .symbol > * {
    fill: none;
    stroke: var(--screen-dim);
    stroke-width: 1.5;
    opacity: 0.35;
  }

  .symbol .glyph {
    font-size: 11px;
    font-weight: 700;
    fill: var(--screen-dim);
    stroke: none;
  }

  .symbol.lit > * {
    opacity: 1;
  }

  .damage.lit > * {
    stroke: var(--alert-amber);
  }

  .damage.lit .glyph {
    fill: var(--alert-amber);
  }

  .overheat.lit > * {
    stroke: var(--alert-red);
  }

  .overheat.lit .glyph {
    fill: var(--alert-red);
  }

  .filter.lit > * {
    stroke: var(--alert-amber);
  }
</style>
