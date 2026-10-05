<!--
  Testing panel. Three visually distinct sections — project info,
  manual testing buttons, simulation controls.
-->
<script>
  import { dryer } from './dryerState.svelte.js';
  import { sim, startSim, resetSim, stopSim } from './simulation.svelte.js';
  import InfoModal from './InfoModal.svelte';

  let infoOpen = $state(false);

  $effect(() => stopSim);

  const locked = $derived(dryer.simRunning);

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

    <figure class="placement">
      <img src="{import.meta.env.BASE_URL}HybridSketch.png" alt="Hair dryer with the interface drawn on it, showing the display on the barrel" />
      <figcaption>Where this interface sits on the physical dryer.</figcaption>
    </figure>

    <button class="wide" onclick={() => (infoOpen = true)}>How to use this</button>
  </section>

  <section class="card">
    <h3>Manual testing</h3>
    <div class="grid">
      <button onclick={togglePower} disabled={locked}>Toggle power</button>
      <button onclick={cycleHeat} disabled={locked}>Cycle heat</button>
      <button onclick={cycleFan} disabled={locked}>Cycle fan</button>
      <button onclick={triggerOverheat} disabled={locked}>Trigger overheat</button>
      <button onclick={triggerHeatDamage} disabled={locked}>Trigger heat damage</button>
      <button onclick={() => dryer.filterDue = !dryer.filterDue} disabled={locked}>Toggle filter</button>
      <!-- Goes through the sim so a finished run is cleared along with the state. -->
      <button onclick={resetSim} disabled={locked}>Reset all</button>
    </div>
    {#if locked}
      <p class="note">Disabled while the simulation runs.</p>
    {/if}
  </section>

  <section class="card sim">
    <h3>Simulation</h3>
    <div class="grid">
      <button onclick={startSim} disabled={locked}>Start</button>
      <button onclick={resetSim} disabled={sim.status === 'idle'}>Reset</button>
    </div>
    <p class="note">
      {#if sim.status === 'running'}
        Running — scripted session at 10× speed.
      {:else if sim.status === 'done'}
        Finished. Frozen on the final state; Reset returns to the start.
      {:else}
        Plays a scripted 7-minute session at 10× speed (~42 seconds).
      {/if}
    </p>
  </section>
</div>

<InfoModal open={infoOpen} onclose={() => (infoOpen = false)} />

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

  .placement {
    margin: 0;
  }

  .placement img {
    width: 100%;
    max-width: 220px;
    border-radius: 6px;
    display: block;
  }

  .placement figcaption {
    font-size: 13px;
    margin-top: 6px;
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
