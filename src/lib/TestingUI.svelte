<!--
  Phase 6: testing panel. Three visually distinct sections — project info,
  manual testing buttons, simulation controls.
  The info modal (phase 7), simulation (phase 8) and placement graphic
  (phase 9) are stubbed out here.
-->
<script>
  import { dryer, resetAll } from './dryerState.svelte.js';

  const PROJECT_TITLE = 'Smart Hair Dryer';
  const STUDENT_NAME = 'Aastha Patel';
  const WRITEUP_URL = 'https://sites.google.com/d/19x10yqTDT-gUb1DtkPlMrh_SO9J4jRIZ/p/1lLc3N5sZUMz7HikxJ0aOC5diKEcQNW5n/edit?pli=1';

  const OVERHEAT_COOLDOWN_SECONDS = 45;

  function togglePower() {
    dryer.power = !dryer.power;
    if (!dryer.power) dryer.coolShot = false;
  }

  function cycleHeat() {
    dryer.heat = (dryer.heat % 3) + 1;
  }

  function cycleFan() {
    dryer.fan = (dryer.fan % 3) + 1;
  }

  // Overheat shuts the dryer off and suppresses the other two alerts.
  function triggerOverheat() {
    dryer.overheating = true;
    dryer.cooldownSeconds = OVERHEAT_COOLDOWN_SECONDS;
    dryer.power = false;
    dryer.coolShot = false;
  }

  // Heat damage only exists at High heat, so force the level along with it.
  function triggerHeatDamage() {
    dryer.power = true;
    dryer.coolShot = false;
    dryer.heat = 3;
    dryer.heatDamage = true;
  }
</script>

<div class="panel">
  <section class="card info">
    <h2>{PROJECT_TITLE}</h2>
    <p class="byline">{STUDENT_NAME}</p>
    <p><a href={WRITEUP_URL} target="_blank">Link to Project Documentation</a></p>

    <div class="placeholder">Placement graphic — phase 9</div>

    <button class="wide" disabled>How to use this</button>
    <p class="note">Modal arrives in phase 7.</p>
  </section>

  <section class="card">
    <h3>Manual testing</h3>
    <div class="grid">
      <button onclick={togglePower}>Toggle power</button>
      <button onclick={cycleHeat}>Cycle heat</button>
      <button onclick={cycleFan}>Cycle fan</button>
      <button onclick={triggerOverheat}>Trigger overheat</button>
      <button onclick={triggerHeatDamage}>Trigger heat damage</button>
      <button onclick={() => dryer.filterDue = !dryer.filterDue}>Toggle filter</button>
      <button onclick={resetAll}>Reset all</button>
    </div>
  </section>

  <section class="card sim">
    <h3>Simulation</h3>
    <div class="grid">
      <button disabled>Start</button>
      <button disabled>Reset</button>
    </div>
    <p class="note">Scripted timeline arrives in phase 8.</p>
  </section>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  /* The three sections read as distinct at a glance. */
  .info {
    background: #faf9f7;
  }

  .sim {
    background: #f4f6fb;
    border-color: #d4dcf0;
  }

  .byline {
    margin-bottom: 8px;
  }

  .note {
    margin-top: 8px;
    font-size: 13px;
    color: var(--text);
  }

  .placeholder {
    display: grid;
    place-items: center;
    height: 120px;
    margin: 12px 0;
    border: 1px dashed #b9b4c0;
    border-radius: 8px;
    font-size: 13px;
    color: var(--text);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  button {
    padding: 8px 10px;
    border: 1px solid #c9c5d1;
    border-radius: 6px;
    background: var(--bg);
    font: inherit;
    font-size: 14px;
    color: var(--text-h);
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background: #f0eef2;
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .wide {
    width: 100%;
  }
</style>
