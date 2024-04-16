<script>
  let gameId = 'aaaa'
  let fellowPlayers = []
  let state = 'prompt'
  const connectToGame = () => {
    const ws = new WebSocket(`ws://localhost:8080/?player=player&gameId=${gameId}`);
    ws.onmessage = (msg) => {
      console.log(msg)
      state = 'waiting'
      const resp = JSON.parse(msg.data)
      if (resp.event === 'playerJoin') {
        fellowPlayers = resp.players
      }
    }
  }

</script>
<main>
  <div id="join-prompt" hidden={state !== 'prompt'}>
    <input bind:value={gameId} placeholder="Enter game ID" />
    <button disabled={!gameId} on:click={connectToGame}>Join Game</button>
    <p class="input-warning"></p>
  </div>

  <div id="waiting" hidden={state !== 'waiting'}>
    <p>Waiting for game to start</p>
    <p>Fellow players:</p>
    {#each fellowPlayers as player}
      <div class="waitingPlayers">{player}</div>
    {/each}
  </div>
</main>

<style>
  .waitingPlayers {
    font-size: 2em;
  }
</style>