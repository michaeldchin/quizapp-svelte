<script>
 const PLAYERSTATE = {
    prompt: 'prompt',
    waiting: 'waiting',
    hostLeftGameClose: 'hostLeftGameClose',
    hostStartedGame: 'hostStartedGame',
    questionMultipleChoice: 'questionMultipleChoice',
}
  let gameId = 'aaaa'
  let fellowPlayers = []
  let state = PLAYERSTATE.prompt
  const connectToGame = () => {
    const ws = new WebSocket(`ws://localhost:8080/?player=player&gameId=${gameId}`);
    ws.onmessage = (msg) => {
      console.log(msg)
      state = PLAYERSTATE.waiting
      const resp = JSON.parse(msg.data)
      if (resp.event === 'playerJoin') {
        fellowPlayers = resp.players
      }
      if (resp.event === PLAYERSTATE.hostLeftGameClose) {
        state = PLAYERSTATE.hostLeftGameClose
      }
      if (resp.event === PLAYERSTATE.hostStartedGame) {
        state = PLAYERSTATE.hostStartedGame
      }
    }
  }
  const selectChoice = (choice) => {
    document
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

  <div id="gameClosedByHost" hidden={state !== PLAYERSTATE.hostLeftGameClose}>
    <p>Game ended by host, refresh to get back to main menu</p>
  </div>

  <div id="hostStartedGame" hidden={state !== PLAYERSTATE.hostStartedGame}>
    <p>Game started. Waiting for host to send question</p>
  </div>

  <div id="questionMultipleChoice" hidden={state !== PLAYERSTATE.questionMultipleChoice}>
    <button id="a" on:click={() => selectChoice('a')}>A</button>
    <button id="b" on:click={() => selectChoice('b')}>B</button>
    <button id="c" on:click={() => selectChoice('c')}>C</button>
    <button id="d" on:click={() => selectChoice('d')}>D</button>
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
  .selectedChoice {
    background-color: gainsboro;
  }
</style>
