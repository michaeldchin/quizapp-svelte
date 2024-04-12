<script>
  import logo from './assets/triviaapp-mc.png'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
</script>

<main>
  <div>
    <img src={logo} class="logo" alt="Logo" />
  </div>

  <div class="card">
    <Counter />
  </div>
</main>

<style>
  .logo {
    height: 50vh;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
</style>
