<script>
  let gameId = localStorage.getItem("gameId");
  if (gameId == null) {

  }
  const ws = new WebSocket(`ws://localhost:8080/?player=host`); //&gameId=${gameId}

  let gameState = 'waiting'

  export let response = null
  let players = []
  ws.onmessage = msg => {
    const resp = JSON.parse(msg.data)
    if (resp.event === 'newGame') {
      response = 'GAME ID: ' + resp.gameId
      gameId = resp.gameId
    }
    if (resp.event === 'playerJoin') {
      players = resp.players
    }
    
  }

  const startGame = () => {
    gameState = 'hostStartedGame'
    ws.send(JSON.stringify({event: gameState, gameId}))
  }
</script>

<main>
  <div hidden={gameState !== 'waiting'}>
    <p class="waitingPlayers" >Waiting for players to join...</p>
    <p class="waitingPlayers" >{response}</p>
    <p>Players: </p>
    {#each players as p}
      <div>{p}</div>
    {/each}
    <div hidden={players.length < 1}>
      <button on:click={startGame}>Start Game</button>
    </div>
  </div>

  <div hidden={gameState !== 'hostStartedGame'}>
    Game started
  </div>
</main>

<style>
  .waitingPlayers {
    font-size: 1em;
  }
</style>
