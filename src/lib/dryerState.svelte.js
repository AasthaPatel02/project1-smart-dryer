export const dryer = $state({
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

export const HEAT_LABELS = ['Low', 'Med', 'High'];
export const HEAT_TEMPS = [130, 160, 190];
export const FAN_LABELS = ['Low', 'Med', 'High'];

export function resetAll() {
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