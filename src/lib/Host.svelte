<script>
  const HOSTSTATE = {
    newGame: 'newGame',
    waiting: 'waiting',
    errorWithGameServer: 'errorWithGameServer',
    hostStartedGame: 'hostStartedGame',
    questionSentWaitingForPlayers: 'questionSentWaitingForPlayers',
  }

  let gameId = localStorage.getItem("gameId");
  if (gameId == null) {

  }
  const baseURL = import.meta.env.VITE_BASEURL
  const ws = new WebSocket(`${baseURL}/?player=host`); //&gameId=${gameId}

  let gameState = HOSTSTATE.waiting
  export let response = null
  let players = []
  ws.onmessage = msg => {
    const resp = JSON.parse(msg.data)
    if (resp.event === HOSTSTATE.newGame) {
      response = 'GAME ID: ' + resp.gameId
      gameId = resp.gameId
    }
    if (resp.event === 'playerJoin') {
      players = resp.players
    }
    if (resp.event === 'playerAnswersUpdate') {
      players = resp.players 
    }
  }

  ws.onerror = err => {
    gameState = HOSTSTATE.errorWithGameServer
    console.error('Error with gameserver: ', err)
  }

  const startGame = () => {
    gameState = HOSTSTATE.hostStartedGame
    ws.send(JSON.stringify({event: gameState, gameId}))
  }

  const sendQuestion = (questionType) => {
    gameState = HOSTSTATE.questionSentWaitingForPlayers
    ws.send(JSON.stringify({event: gameState, gameId, questionType}))
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

  <div hidden={gameState !== HOSTSTATE.hostStartedGame}>
    <h2>Choose question type</h2>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <!-- <button>Open Ended</button> -->
  </div>

  <div hidden={gameState !== HOSTSTATE.questionSentWaitingForPlayers}>
    <h2>questionSentWaitingForPlayers</h2>
     <!-- status of players responses -->
     {#each players as player}
      <li>{player.name} {player.score} {player.answer} </li>
     {/each}
  </div>

  <div hidden={gameState !== HOSTSTATE.errorWithGameServer}>
    <h1 class="errorState">ERROR</h1>
    <h3 class="errorState">Gameserver not available</h3>
  </div>
</main>

<style>
  .waitingPlayers {
    font-size: 1em;
  }
  .errorState {
    color: red;
  }
</style>
