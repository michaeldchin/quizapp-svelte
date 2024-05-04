<script>
  const HOSTSTATE = {
    newGame: 'newGame',
    waiting: 'waiting',
    errorWithGameServer: 'errorWithGameServer',
    hostStartedGame: 'hostStartedGame',
    questionSentWaitingForPlayers: 'questionSentWaitingForPlayers',
    hostEndedQuestion: 'hostEndedQuestion',

  }

  let gameId
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
      console.log(resp)
    }
    if (resp.event === 'playerAnswersUpdate') {
      players = resp.players 
    }
  }

  ws.onerror = err => {
    gameState = HOSTSTATE.errorWithGameServer
    console.error('Error with connecting to gameserver: ', err)
  }

  const startGame = () => {
    gameState = HOSTSTATE.hostStartedGame
    ws.send(JSON.stringify({event: gameState, gameId}))
  }

  const sendQuestion = (questionType) => {
    gameState = HOSTSTATE.questionSentWaitingForPlayers
    ws.send(JSON.stringify({event: gameState, gameId, questionType}))
  }

  const endQuestion = () => {
    gameState = HOSTSTATE.hostEndedQuestion
    ws.send(JSON.stringify({event: gameState, gameId}))
  }
</script>

<main>
  <div hidden={gameState !== 'waiting'}>
    <h2 class="waitingPlayers" >Waiting for players to join...</h2>
    <p class="waitingPlayers" >{response}</p>
    <h2 class="error" hidden={response}>No response from server</h2>
    <p>Players: </p>
    {#each players as p}
      <h3>{p.name}</h3>
    {/each}
    <div hidden={players.length < 1}>
      <button on:click={startGame}>Start Game</button>
    </div>
  </div>

  <div hidden={gameState !== HOSTSTATE.hostStartedGame}>
    <h2>Choose question type</h2>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <button on:click={() => sendQuestion('trueFalse')}>True or False</button>
    <button on:click={() => sendQuestion('openEnded')}>Open Ended</button>
    <!-- <button>Open Ended</button> -->
  </div>

  <div hidden={gameState !== HOSTSTATE.questionSentWaitingForPlayers}>
    <h2>Waiting for player responses</h2>
    <!-- status of players responses -->
    {#each players as player}
      <h3>{player.name} {!!player.answer} </h3>
    {/each}
    <button on:click={endQuestion}>End Question</button>
  </div>

  <div hidden={gameState !== HOSTSTATE.hostEndedQuestion}>
    <h2>Player answers</h2>
    {#each players as player}
      <h3>{player.name}: {player.answer}</h3>
    {/each}
    <h3>Next Question</h3>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <button on:click={() => sendQuestion('trueFalse')}>True or False</button>
    <button on:click={() => sendQuestion('openEnded')}>Open Ended</button>
  </div>

  <div hidden={gameState !== HOSTSTATE.errorWithGameServer}>
    <h1 class="errorState">ERROR</h1>
    <h3 class="errorState">Unable to connect to gameserver</h3>
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
