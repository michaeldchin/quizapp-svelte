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