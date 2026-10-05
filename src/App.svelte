<script>
  /*
    Whole application in one component.

    Three parts, in order:
      1. Shared dryer state + the scripted simulation that drives it
      2. Device UI logic (handle buttons, nozzle ring, barrel display)
      3. Testing panel + info modal logic

    All styles live in app.css.
  */

  const dryer = $state({
    power: false,
    heat: 1,
    fan: 1,
    coolShot: false,
    sessionSeconds: 0,
    overheating: false,
    cooldownSeconds: 0,
    heatDamage: false,
    filterDue: false,
    simRunning: false
  });

  const HEAT_TEMPS = [70, 100, 150];
  const FAN_LABELS = ['Low', 'Med', 'High'];

  function resetAll() {
    dryer.power = false;
    dryer.heat = 1;
    dryer.fan = 1;
    dryer.coolShot = false;
    dryer.sessionSeconds = 0;
    dryer.overheating = false;
    dryer.cooldownSeconds = 0;
    dryer.heatDamage = false;
    dryer.filterDue = false;
    dryer.simRunning = false;
  }

  // -------- simulation ------------//
  // There are comments throughout the simulation code to explain
  // the timeline and the logic behind it. 

  const TICK_MS = 100;
  const OVERHEAT_COOLDOWN_SECONDS = 45;
  const END_SIM_SECONDS = 420; // 7:00

  // 'idle' before a run, 'running' during, 'done' while frozen on the final state.
  const sim = $state({
    status: 'idle',
    simSeconds: 0
  });

  const TIMELINE = [
    {
      at: 0, // 0:00 — power on, High heat, Fan High
      apply() {
        dryer.power = true;
        dryer.coolShot = false;
        dryer.heat = 3;
        dryer.fan = 3;
      }
    },
    {
      at: 120, // 2:00 — heat damage alert
      apply() {
        dryer.heatDamage = true;
      }
    },
    {
      at: 360, // 6:00 — overheat: the dryer shuts itself off, cooldown begins
      apply() {
        dryer.overheating = true;
        dryer.cooldownSeconds = OVERHEAT_COOLDOWN_SECONDS;
        dryer.power = false;
        dryer.coolShot = false;
        // The tool is off, so it is no longer damaging hair. Overheat suppresses
        // this alert on the display anyway
        dryer.heatDamage = false;
      }
    },
    {
      at: 405, // 6:45 — cooldown complete, dryer usable again
      apply() {
        dryer.overheating = false;
        dryer.cooldownSeconds = 0;
      }
    },
    {
      at: END_SIM_SECONDS, // 7:00 — powered off
      apply() {
        dryer.power = false;
        dryer.coolShot = false;
        dryer.filterDue = true;
      }
    }
  ];

  let intervalId = null;

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function applyEventsAt(second) {
    for (const event of TIMELINE) {
      if (event.at === second) event.apply();
    }
  }

  function tick() {
    sim.simSeconds += 1;

    if (dryer.overheating) {
      dryer.cooldownSeconds = Math.max(0, dryer.cooldownSeconds - 1);
    } else if (dryer.power) {
      dryer.sessionSeconds += 1;
    }

    applyEventsAt(sim.simSeconds);

    if (sim.simSeconds >= END_SIM_SECONDS) finish();
  }

  // Freeze on the final state: the timer stops but nothing is cleared.
  function finish() {
    clearTimer();
    sim.status = 'done';
    dryer.simRunning = false;
  }

  function startSim() {
    if (sim.status === 'running') return;

    // A run always begins from the start state, so a Start after a finished run
    // replays the same sequence rather than continuing from the frozen state.
    clearTimer();
    resetAll();
    sim.simSeconds = 0;
    sim.status = 'running';
    dryer.simRunning = true;

    applyEventsAt(0);
    intervalId = setInterval(tick, TICK_MS);
  }

  function resetSim() {
    clearTimer();
    resetAll();
    sim.simSeconds = 0;
    sim.status = 'idle';
  }

  // For teardown — stops the timer without touching dryer state.
  function stopSim() {
    clearTimer();
    if (sim.status === 'running') {
      sim.status = 'idle';
      dryer.simRunning = false;
    }
  }

  $effect(() => stopSim);

  // ------- Device UI ------- //

  /*
    Dryer schematic. Side view, nozzle pointing right.
    All four interface zones are live: barrel display, handle controls,
    nozzle LED ring, rear filter LED.
  */

  // A press longer than this reads as a cool shot rather than a cycle.
  const HOLD_MS = 350;

  let holdTimer = null;
  let holdFired = false;

  const locked = $derived(dryer.simRunning);
  const heatFanLive = $derived(dryer.power && !locked);

  function togglePower() {
    if (locked) return;
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
    if (!heatFanLive) return;
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
    if (!heatFanLive) return;
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
    } else if (stillPending && heatFanLive) {
      cycleHeat();
    }
  }

  // Dragging off the button abandons the press rather than cycling through the heat settings again.
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

  $effect(() => clearHold);

  // Nozzle ring. Overheat wins over everything — it fires with power already
  // off, and its flashing has to stay distinct from solid High heat.
  const ringState = $derived.by(() => {
    if (dryer.overheating) return 'overheat';
    if (!dryer.power) return 'off';
    if (dryer.coolShot) return 'cool';
    return ['low', 'med', 'high'][dryer.heat - 1];
  });

  // --- Barrel display --- //

  /*
    Drawn in the dryer SVG's coordinate space, translated to the display zone.
    Three columns: heat, timer, fan. Each has a label above a value.
  */
  const COOL_TEMP = 40;

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
  const timerValue = $derived(overheat && !dryer.simRunning ? '' : formatClock(overheat ? dryer.cooldownSeconds : dryer.sessionSeconds));

  const fanValue = $derived(FAN_LABELS[dryer.fan - 1]);

  // ---- Testing UI ---- //

  /*
    Testing panel. Three visually distinct sections — project info,
    manual testing buttons, simulation controls.
  */
  const PROJECT_TITLE = 'Testing controls';
  const STUDENT_NAME = 'Aastha Patel';
  const WRITEUP_URL = 'https://sites.google.com/d/19x10yqTDT-gUb1DtkPlMrh_SO9J4jRIZ/p/1lLc3N5sZUMz7HikxJ0aOC5diKEcQNW5n/edit?pli=1';

  // The panel's controls bypass the device's own guards, so they are separate
  // from togglePower / cycleHeat / cycleFan above.
  function testTogglePower() {
    dryer.power = !dryer.power;
    if (!dryer.power) dryer.coolShot = false;
  }

  function testCycleHeat() {
    dryer.heat = (dryer.heat % 3) + 1;
  }

  function testCycleFan() {
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

  // ---- Info modal ---- //

  let infoOpen = $state(false);
  let dialog = null;

  function onBackdropClick(event) {
    if (event.target === event.currentTarget) infoOpen = false;
  }

  $effect(() => {
    if (!infoOpen) return;

    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        infoOpen = false;
      }
    }

    window.addEventListener('keydown', onKeydown);
    dialog?.focus();

    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<main class="app-main">
  <section class="device">
   <h1 class="page-title">Smart Hairstyling Tool</h1>
    <svg
      class="dryer"
      viewBox="113 123 672 534"
      role="group"
      aria-label="Hair dryer with four interface zones"
    >
      <!-- Body -->
      <g class="dryer-body">
        <!-- Handle, descending from the rear of the barrel -->
        <rect x="215" y="310" width="115" height="330" rx="42" />
        <!-- Barrel -->
        <rect x="130" y="140" width="510" height="200" rx="70" />
        <!-- Nozzle -->
        <polygon points="668,168 768,192 768,288 668,312" />
      </g>

      <!-- Zone: barrel top → main display (3 columns + notification bar) -->
      <g class="display" transform="translate(310, 165)">
        <rect class="screen" x="0" y="0" width="300" height="112" rx="8" />

        <!-- Three equal columns: label above value -->
        {#if showColumns}
          <g class="columns">
            <line class="rule" x1="100" y1="10" x2="100" y2="66" />
            <line class="rule" x1="200" y1="10" x2="200" y2="66" />

            {#if showHeat}
              <text class="display-text label" x="50" y="27">{heatLabel}</text>
              <text class="display-text value" class:alert={heatDamageLit} x="50" y="58">{heatValue}</text>
            {/if}

            {#if showTimer}
              <text class="display-text label" class:alert={overheat} x="150" y="27">{timerLabel}</text>
              <text class="display-text value" x="150" y="58">{timerValue}</text>
            {/if}

            {#if showFan}
              <text class="display-text label" x="250" y="27">FAN</text>
              <text class="display-text value" x="250" y="58">{fanValue}</text>
            {/if}
          </g>
        {/if}

        <!-- Notification bar: always visible, fixed positions, dimmed when inactive -->
        <line class="rule" x1="8" y1="74" x2="292" y2="74" />
        <g class="notifications">
          <!-- Heat damage to hair -->
          <g class="symbol damage" class:lit={heatDamageLit}>
            <polygon points="50,85 60,101 40,101" />
            <text class="display-text glyph" x="50" y="99">!</text>
          </g>

          <!-- Overheating of tool -->
          <g class="symbol overheat" class:lit={overheat}>
            <polygon points="150,85 160,101 140,101" />
            <text class="display-text glyph" x="150" y="99">!</text>
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

      <!-- Zone: handle grip → power, heat, fan buttons -->
      <g
        class="button"
        class:on={dryer.power}
        class:disabled={locked}
        role="button"
        tabindex="0"
        aria-label="Power"
        aria-pressed={dryer.power}
        aria-disabled={locked}
        style={locked ? 'cursor:default' : 'cursor:pointer'}
        onclick={togglePower}
        onkeydown={(e) => onKey(e, togglePower)}
      >
        <rect x="245" y="370" width="55" height="40" rx="12" />
        <text x="272.5" y="395" pointer-events="none">PWR</text>
      </g>

      <g
        class="button"
        class:disabled={!heatFanLive}
        role="button"
        tabindex="0"
        aria-label="Heat level — click to cycle, hold for cool shot"
        aria-disabled={!heatFanLive}
        style={heatFanLive ? 'cursor:pointer' : 'cursor:default'}
        onpointerdown={heatPressStart}
        onpointerup={heatPressEnd}
        onpointerleave={heatPressCancel}
        onpointercancel={heatPressCancel}
        onkeydown={(e) => onKey(e, () => heatFanLive && cycleHeat())}
      >
        <rect x="245" y="440" width="55" height="40" rx="12" />
        <text x="272.5" y="465" pointer-events="none">HEAT</text>
      </g>

      <g
        class="button"
        class:disabled={!heatFanLive}
        role="button"
        tabindex="0"
        aria-label="Fan speed — click to cycle"
        aria-disabled={!heatFanLive}
        style={heatFanLive ? 'cursor:pointer' : 'cursor:default'}
        onclick={cycleFan}
        onkeydown={(e) => onKey(e, cycleFan)}
      >
        <rect x="245" y="510" width="55" height="40" rx="12" />
        <text x="272.5" y="535" pointer-events="none">FAN</text>
      </g>

      <!-- Zone: nozzle collar → LED ring -->
      <g class="ring {ringState}">
        <rect class="collar" x="630" y="148" width="46" height="184" rx="22" />
        <rect class="lens" x="638" y="158" width="30" height="164" rx="15" />
      </g>

      <!-- Zone: rear intake grille → filter LED -->
      <g class="grille">
        <line x1="168" y1="165" x2="168" y2="315" />
        <line x1="186" y1="158" x2="186" y2="322" />
        <line x1="204" y1="158" x2="204" y2="322" />
      </g>
      <g class="led" class:lit={dryer.filterDue}>
        <circle cx="186" cy="178" r="9" />
      </g>
    </svg>
  </section>

  <section class="testing">
    <div class="panel">
      <section class="card sec-project">
        <h2 class="page-title">{PROJECT_TITLE}</h2>
        <p class="byline">{STUDENT_NAME}</p>
        <p><a class="doc-link" href={WRITEUP_URL} target="_blank">Project Documentation</a></p>

        <button class="test-btn wide" onclick={() => (infoOpen = true)}>How to use this</button>
      </section>

      <section class="card sec-testing">
        <h3 class="section-title">Manual testing</h3>
        <div class="grid">
          <button class="test-btn" onclick={testTogglePower} disabled={locked}>Power On/Off</button>
          <button class="test-btn" onclick={testCycleHeat} disabled={locked}>Cycle heat</button>
          <button class="test-btn" onclick={testCycleFan} disabled={locked}>Cycle fan</button>
          <button class="test-btn" onclick={triggerOverheat} disabled={locked}>Device Overheat Notification</button>
          <button class="test-btn" onclick={triggerHeatDamage} disabled={locked}>Heat Damage Notification</button>
          <button class="test-btn" onclick={() => dryer.filterDue = !dryer.filterDue} disabled={locked}>Clean Filter Notification</button>
          <!-- Goes through the sim so a finished run is cleared along with the state. -->
          <button class="test-btn" onclick={resetSim} disabled={locked}>Reset all</button>
        </div>
        {#if locked}
          <p class="note">Disabled while the simulation runs.</p>
        {/if}
      </section>

      <section class="card sec-sim">
        <h3 class="section-title">Simulation</h3>
        <div class="grid">
          <button class="test-btn start" onclick={startSim} disabled={locked}>Start</button>
          <button class="test-btn" onclick={resetSim} disabled={sim.status === 'idle'}>Reset</button>
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

    {#if infoOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="backdrop" onclick={onBackdropClick}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          tabindex="-1"
          bind:this={dialog}
        >
          <header class="modal-header">
            <h2 class="modal-title" id="info-modal-title">How to use this</h2>
            <button class="close" aria-label="Close" onclick={() => (infoOpen = false)}>×</button>
          </header>

          <div class="modal-body">
            <p>
              The dryer on the left is a mockup of a physical object
            </p>

            <h3 class="modal-section-title">On the device</h3>
            <p>Three buttons sit on the handle grip, where a thumb would reach them.</p>
            <ul class="modal-list">
              <li class="modal-item"><strong class="modal-strong">PWR</strong> — toggles the dryer on and off. With power off the
                barrel display goes blank and the other two buttons do nothing.</li>
              <li class="modal-item"><strong class="modal-strong">HEAT</strong> — a short click cycles Low → Med → High → Low.
                <strong class="modal-strong">Press and hold</strong> for a cool shot; releasing returns to the
                heat level you were on.</li>
              <li class="modal-item"><strong class="modal-strong">FAN</strong> — click cycles the fan speed Low → Med → High → Low.</li>
            </ul>
            <p>
              The nozzle ring at the front changes color with the heat state, and the LED on
              the rear intake grille lights amber when the filter needs cleaning.
            </p>

            <h3 class="modal-section-title">Manual testing buttons</h3>
            <p>
              These testing buttons demonstrate how the controls on the handle would work.
              As well as show the how each of the three possible alert/notification states would look like
              on the display.
            </p>
            <ul class="modal-list">
              <li class="modal-item"><strong class="modal-strong">Power On/Off</strong>, <strong class="modal-strong">Cycle heat</strong>,
                <strong class="modal-strong">Cycle fan</strong> — the handle controls (Physical buttons on the Device UI work as well)</li>
              <li class="modal-item"><strong class="modal-strong">Device Overheat Notification</strong> — fires the overheat alert: the dryer
                shuts itself off, the nozzle ring flashes red, and a cooldown replaces the
                timer. Overheat takes priority, so the other two alerts are suppressed
                while it is active.</li>
              <li class="modal-item"><strong class="modal-strong">Heat Damage Notification</strong> — Notifies user of potential hair damage due to a high heat setting and
                lights the heat-damage alert. It clears when the user changes the heat setting to a lower temperature.</li>
              <li class="modal-item"><strong class="modal-strong">Clean Filter Notification</strong> — switches the filter-cleaning alert on and
                off, lighting both the display symbol and the rear LED.</li>
              <li class="modal-item"><strong class="modal-strong">Reset all</strong> — returns every value to the starting state.</li>
            </ul>

            <h3 class="modal-section-title">Simulation</h3>
            <p>
              <strong class="modal-strong">Start</strong> plays a scripted session — the same timeline every time,
              at 10× speed, taking about 45 seconds. It powers on at High heat, raises the
              heat-damage alert, overheats and cools down, then powers off with the filter
              due. The manual controls are locked while it runs, and the final state stays on
              screen until <strong class="modal-strong">Reset</strong> returns it to the start.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </section>
</main>
