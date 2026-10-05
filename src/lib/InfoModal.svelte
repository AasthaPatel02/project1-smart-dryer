<script>
  let { open = false, onclose } = $props();

  let dialog = null;

  function onBackdropClick(event) {
    if (event.target === event.currentTarget) onclose?.();
  }

  $effect(() => {
    if (!open) return;

    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onclose?.();
      }
    }

    window.addEventListener('keydown', onKeydown);
    dialog?.focus();

    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

{#if open}
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
      <header>
        <h2 id="info-modal-title">How to use this</h2>
        <button class="close" aria-label="Close" onclick={() => onclose?.()}>×</button>
      </header>

      <div class="body">
        <p>
          The dryer on the left is a mockup of a physical object
        </p>

        <h3>On the device</h3>
        <p>Three buttons sit on the handle grip, where a thumb would reach them.</p>
        <ul>
          <li><strong>PWR</strong> — toggles the dryer on and off. With power off the
            barrel display goes blank and the other two buttons do nothing.</li>
          <li><strong>HEAT</strong> — a short click cycles Low → Med → High → Low.
            <strong>Press and hold</strong> for a cool shot; releasing returns to the
            heat level you were on.</li>
          <li><strong>FAN</strong> — click cycles the fan speed Low → Med → High → Low.</li>
        </ul>
        <p>
          The nozzle ring at the front changes color with the heat state, and the LED on
          the rear intake grille lights amber when the filter needs cleaning.
        </p>

        <h3>Manual testing buttons</h3>
        <p>
          These testing buttons demonstrate how the controls on the handle would work.
          As well as show the how each of the three possible alert states would look
          on the display.
        </p>
        <ul>
          <li><strong>Toggle power</strong>, <strong>Cycle heat</strong>,
            <strong>Cycle fan</strong> — the handle controls (Physical buttons on the Device UI work as well)</li>
          <li><strong>Trigger overheat</strong> — fires the overheat alert: the dryer
            shuts itself off, the nozzle ring flashes red, and a cooldown replaces the
            timer. Overheat takes priority, so the other two alerts are suppressed
            while it is active.</li>
          <li><strong>Trigger heat damage</strong> — puts the dryer on High heat and
            lights the heat-damage alert; the heat number turns red. It clears when you
            drop below High.</li>
          <li><strong>Toggle filter</strong> — switches the filter-cleaning alert on and
            off, lighting both the display symbol and the rear LED.</li>
          <li><strong>Reset all</strong> — returns every value to the starting state.</li>
        </ul>

        <h3>Simulation</h3>
        <p>
          <strong>Start</strong> plays a scripted session — the same timeline every time,
          at 10× speed, taking about 45 seconds. It powers on at High heat, raises the
          heat-damage alert, overheats and cools down, then powers off with the filter
          due. The manual controls are locked while it runs, and the final state stays on
          screen until <strong>Reset</strong> returns it to the start.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 32px;
    background: rgba(8, 6, 13, 0.45);
  }

  .dialog {
    width: 540px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
    box-shadow: 0 18px 48px rgba(8, 6, 13, 0.3);
  }

  .dialog:focus {
    outline: none;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  header h2 {
    margin: 0;
  }

  .close {
    width: 30px;
    height: 30px;
    border: 1px solid #c9c5d1;
    border-radius: 6px;
    background: var(--bg);
    font: inherit;
    font-size: 20px;
    line-height: 1;
    color: var(--text-h);
    cursor: pointer;
  }

  .close:hover {
    background: #f0eef2;
  }

  /* The explanation is long enough to scroll; the header stays put. */
  .body {
    overflow-y: auto;
    padding: 16px 20px 20px;
    font-size: 14px;
  }

  .body h3 {
    margin: 20px 0 6px;
    font-size: 15px;
  }

  .body h3:first-child {
    margin-top: 0;
  }

  ul {
    margin: 6px 0 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 6px;
  }

  strong {
    color: var(--text-h);
    font-weight: 600;
  }
</style>
