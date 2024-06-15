<script>
  import { fade, fly } from 'svelte/transition';
  export let players;
</script>
<main>
  <h2>Waiting for player responses</h2>
  <!-- status of players responses -->
  {#each players as player}
  <div class="playerRow">
    <div>{player.name}</div>
    {#if !player.answer}
      <div transition:fade>❌</div>
    {:else}
      <div in:fly={{delay: 400, x: '800', duration: 2000}}>✅</div>
    {/if}
  </div>
  {/each}
</main>

<style>
  .playerRow {
    display: flex;
    justify-content: center;
    font-size: x-large;
  }
</style>