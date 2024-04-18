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
      if (resp.event === 'hostLeftGameClose') {
        state = 'hostLeftGameClose'
      }
      if (resp.event === 'hostStartedGame') {
        state = 'hostStartedGame'
      }
    }
  }

</script>
<main>
  <div id="join-prompt" hidden={state !== 'prompt'}>
    <div class="input-container">
      <input bind:value={gameId} placeholder="Enter game ID" />
    </div>
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

  <div id="gameClosedByHost" hidden={state !== 'hostLeftGameClose'}>
    <p>Game ended by host, refresh to get back to main menu</p>
  </div>

  <div id="hostStartedGame" hidden={state !== 'hostStartedGame'}>
    <p>Game Started</p>
  </div>
</main>

<style>
  input {
    height: 2rem;
    width: 75%;
    font-size: 2rem;
    text-align: center;
  }
  .input-container {
    padding: 1rem;
  }
  .waitingPlayers {
    font-size: 2em;
  }
</style>
