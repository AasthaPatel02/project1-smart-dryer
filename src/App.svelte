<script>
</script>

<main>
  <section class="device">
    <p>Device UI</p>
  </section>
  <section class="testing">
    <p>Testing / Project Info</p>
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