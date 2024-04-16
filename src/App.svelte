<script>
  import Host from './lib/Host.svelte'
  import MainMenu from './lib/MainMenu.svelte';
  import Player from './lib/Player.svelte';
  import * as Constants from './lib/Constants';
    import Viewer from './lib/Viewer.svelte';
  let gameState = ''
</script>

<main>
  
  {#if gameState === ''}
    <MainMenu bind:gameState={gameState}/>
  {:else if gameState === Constants.HOST}
    <Host />
  {:else if gameState === Constants.PLAYER}
    <Player />
  {:else if gameState === Constants.VIEWER}
    <Viewer />
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
