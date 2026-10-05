/*
  Scripted simulation.
  Same sequence plays every time
  Speed: one tick every 100ms advances the clock by one simulated second,
*/
import { dryer, resetAll } from './dryerState.svelte.js';

const TICK_MS = 100;
const OVERHEAT_COOLDOWN_SECONDS = 45;
const END_SIM_SECONDS = 420; // 7:00

// 'idle' before a run, 'running' during, 'done' while frozen on the final state.
export const sim = $state({
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
      // this alert on the display anyway; clearing it keeps the state honest
      // once the cooldown ends.
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
    at: END_SIM_SECONDS, // 7:00 — powered off, filter now due
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

  // Clocks advance before the second's events fire, so an event that sets a
  // clock is not immediately undone by this tick.
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

export function startSim() {
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

export function resetSim() {
  clearTimer();
  resetAll();
  sim.simSeconds = 0;
  sim.status = 'idle';
}

// For component teardown — stops the timer without touching dryer state.
export function stopSim() {
  clearTimer();
  if (sim.status === 'running') {
    sim.status = 'idle';
    dryer.simRunning = false;
  }
}
