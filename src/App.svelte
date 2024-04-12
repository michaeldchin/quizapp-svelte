<script>
  import logo from './assets/triviaapp-mc.png'
  import Counter from './lib/Counter.svelte'
  import Host from './lib/Host.svelte'
  let gameState = ''
</script>

<main>
  
  {#if gameState === ''}
    <div>
      <img src={logo} class="logo" alt="Logo" />
    </div>

    <div class="card">
    <button on:click={() => gameState = 'host'}>
      Host a new game
    </button>
  </div>
  {:else if gameState === 'host'}
    <Host />
  {/if}
</main>

<style>
  .logo {
    height: 25vh;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
    background-color: lightcyan;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
</style>
