<script>
  import DeviceUI from './lib/DeviceUI.svelte';
  import TestingUI from './lib/TestingUI.svelte';
</script>

<main>
  <section class="device">
    <DeviceUI />
  </section>
  <section class="testing">
    <TestingUI />
  </section>
</main>

<style>
  main {
    display: flex;
    min-height: 100vh;
  }

  .device {
    flex: 2;
    display: grid;
    place-items: center;
    background: #faf9f7;
  }

  .testing {
    flex: 1;
    padding: 24px;
    border-left: 1px solid var(--border);
    overflow-y: auto;
  }
</style>