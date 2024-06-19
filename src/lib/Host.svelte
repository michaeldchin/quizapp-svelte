<script>
  import Scorecard from "./Scorecard.svelte";
  import Leaderboard from "./Leaderboard.svelte";
  import HostWaitingForResponses from "./HostWaitingForResponses.svelte";
  import { fly } from 'svelte/transition';

  const flyInParams = {
    delay: 200,
    duration: 200,
    y: -1000
  }
  const flyOutParams = {
    duration: 200,
    y: 1000
  }


  const HOSTSTATE = {
    newGame: 'newGame',
    waiting: 'waiting',
    errorWithGameServer: 'errorWithGameServer',
    hostStartedGame: 'hostStartedGame',
    questionSentWaitingForPlayers: 'questionSentWaitingForPlayers',
    hostEndedQuestion: 'hostEndedQuestion',
    hostGradedAnswers: 'hostGradedAnswers'
  }

  let gameId
  const baseURL = import.meta.env.VITE_BASEURL
  const ws = new WebSocket(`${baseURL}/?player=host`); //&gameId=${gameId}
  // keep alive
  setInterval(() => {
    ws.send(JSON.stringify({event: 'keepAlive'}))
  }, 5000)

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
    if (resp.event === 'hostGradedAnswers') {
      players = resp.players 
    }
    if (resp.event === 'gameAlreadyExists') {
      response = 'Someone is already hosting a game! '
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

  const gradeAnswers = (players) => {
    gameState = HOSTSTATE.hostGradedAnswers
    ws.send(JSON.stringify({event: gameState, gameId, players}))
  }
</script>

<main>
  {#if gameState === 'waiting'}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h2 class="waitingPlayers" >Waiting for players to join...</h2>
    <h2 class="error" hidden={response}>No response from server</h2>
    {#each players as p}
      <h3>{p.name}</h3>
    {/each}
    <div hidden={players.length < 1}>
      <button on:click={startGame}>Start Game</button>
    </div>
  </div>

  {:else if gameState === HOSTSTATE.hostStartedGame}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h2>Choose question type</h2>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <button on:click={() => sendQuestion('trueFalse')}>True or False</button>
    <button on:click={() => sendQuestion('openEnded')}>Open Ended</button>
    <!-- <button>Open Ended</button> -->
  </div>

  {:else if gameState === HOSTSTATE.questionSentWaitingForPlayers}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <HostWaitingForResponses players={players}></HostWaitingForResponses>
    <button on:click={endQuestion} style="margin-top: 1em;">End Question</button>
    <h2>Choose question type</h2>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <button on:click={() => sendQuestion('trueFalse')}>True or False</button>
    <button on:click={() => sendQuestion('openEnded')}>Open Ended</button>
  </div>

  {:else if gameState === HOSTSTATE.hostEndedQuestion}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h2>Player answers</h2>
    <div class="playerCards">
    {#each players as player}
      <Scorecard player={player}></Scorecard>
    {/each}
    </div>
    <button on:click={() => gradeAnswers(players)} style="margin-top: 1em;">Submit Scores</button>
  </div>

  {:else if gameState === HOSTSTATE.hostGradedAnswers}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <Leaderboard players={players}></Leaderboard>
    
    <h3 style="margin-top: 1em;">Next Question</h3>
    <button on:click={() => sendQuestion('multipleChoice')}>Multiple Choice</button>
    <button on:click={() => sendQuestion('trueFalse')}>True or False</button>
    <button on:click={() => sendQuestion('openEnded')}>Open Ended</button>
  </div>

  {:else if gameState === HOSTSTATE.errorWithGameServer}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h1 class="errorState">ERROR</h1>
    <h3 class="errorState">Unable to connect to gameserver</h3>
  </div>
  {/if}
</main>

<style>
  .waitingPlayers {
    font-size: 1em;
  }
  .errorState {
    color: red;
  }
  .playerCards {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  main {
    width: 50vw;
  }
</style>
