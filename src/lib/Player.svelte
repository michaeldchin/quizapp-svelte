<script>
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

 const PLAYERSTATE = {
    prompt: 'prompt',
    waiting: 'waiting',
    hostLeftGameClose: 'hostLeftGameClose',
    hostStartedGame: 'hostStartedGame',
    questionMultipleChoice: 'questionMultipleChoice',
    questionTrueFalse: 'questionTrueFalse',
    questionOpenEnded: 'questionOpenEnded',
    hostEndedQuestion: 'hostEndedQuestion',
    hostGradedAnswers: 'hostGradedAnswers'
  }
  const baseURL = import.meta.env.VITE_BASEURL
  const randomDefaultNames = ['Tim', 'p','player', 'SomeDude', 'whosaidmyname', 'Micoolman', 'Unknown', 'nuciiknab','MichaelAndJello']

  let playerId
  $: currentPlayerInfo = fellowPlayers.find(player => player.id === playerId)

  let gameId = 'aaaa'
  let playerName = randomDefaultNames[Math.floor(Math.random() * randomDefaultNames.length)]
  let fellowPlayers = []
  let answer = ''
  let state = PLAYERSTATE.prompt
  let warning
  let ws = undefined;
  const connectToGame = () => {
    ws = new WebSocket(`${baseURL}/?player=player&gameId=${gameId}&playerName=${playerName}`);
    // keep alive
    setInterval(() => {
      ws.send(JSON.stringify({event: 'keepAlive'}))
    }, 5000)

    ws.onmessage = (msg) => {
      if (msg.data === 'There is no host, try again when someone is hosting a game') {
        warning = msg.data
        return
      }
      if (msg.data.startsWith('Cannot join game')) {
        warning = msg.data
        return
      }
      const resp = JSON.parse(msg.data)
      console.log(resp)
      if (resp.event === 'yourPlayerId') {
        state = PLAYERSTATE.waiting
        playerId = resp.playerId
      }
      if (resp.event === 'playerJoin') {
        fellowPlayers = resp.players
      }
      if (resp.event === PLAYERSTATE.hostLeftGameClose) {
        state = PLAYERSTATE.hostLeftGameClose
      }
      if (resp.event === PLAYERSTATE.hostStartedGame) {
        state = PLAYERSTATE.hostStartedGame
      }
      if ([PLAYERSTATE.questionMultipleChoice, 
        PLAYERSTATE.questionTrueFalse, 
        PLAYERSTATE.questionOpenEnded].includes(resp.event)) {
        answer = '' // new question
        triggerTransition()
        state = resp.event
      }
      if (resp.event === PLAYERSTATE.hostEndedQuestion) {
        fellowPlayers = resp.players
        state = PLAYERSTATE.hostEndedQuestion
      }
      if (resp.event === PLAYERSTATE.hostGradedAnswers) {
        fellowPlayers = resp.players
        state = PLAYERSTATE.hostGradedAnswers
      }
    }
  }

  //resend answer mainly to handle openended
  let oldAnswer = '';
  setInterval(() => {
    if (oldAnswer != answer) {
      oldAnswer = answer
      ws.send(JSON.stringify({event: 'playerAnswer', gameId, answer}))
    }
  },1000)

  const selectChoice = (c) => {
    answer = c
    ws.send(JSON.stringify({event: 'playerAnswer', gameId, answer}))
  }

  let unique = {}
  function triggerTransition() {
    unique = {} // every {} is unique, {} === {} evaluates to false
  }
</script>

<main>
  {#if state === 'prompt'}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <div class="input-container">
      <!-- <h3>Game Id (Hardcoded you can't change this):</h3>
      <input bind:value={gameId} disabled placeholder="Enter game ID" /> -->
      
      <h3>Player Name:</h3>
      <input maxlength="60" bind:value={playerName} placeholder="Enter PlayerName" />
    </div>
    <button disabled={!gameId} on:click={connectToGame}>Join Game</button>
    <p class="input-warning" hidden={!warning}>{warning}</p>
  </div>

  {:else if state === 'waiting'}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <p>Waiting for game to start</p>
    <p>Fellow players:</p>
    {#each fellowPlayers as player}
      <div class="waitingPlayers">{player.name}</div>
    {/each}
  </div>

  {:else if state === PLAYERSTATE.hostLeftGameClose}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <p>Game ended by host, refresh to get back to main menu</p>
  </div>

  {:else if state === PLAYERSTATE.hostStartedGame}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <p>Game started. Waiting for host to send question</p>
  </div>

  {:else if [
    PLAYERSTATE.questionMultipleChoice,
    PLAYERSTATE.questionTrueFalse,
    PLAYERSTATE.questionOpenEnded
  ].includes(state)}
  {#key unique}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    {#if state === PLAYERSTATE.questionMultipleChoice}
      {#each ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as option}
        <button
          id={option}
          class:selectedChoice="{option === answer}"
          class="choices"
          on:click={() => selectChoice(option)}
        >
          {option}
        </button>
      {/each}
    {:else if state === PLAYERSTATE.questionTrueFalse}
      {#each ['True', 'False'] as option}
        <button
          id={option}
          class:selectedChoice="{option === answer}"
          class="choices"
          on:click={() => selectChoice(option)}
        >
          {option}
        </button>
      {/each}
    {:else if state === PLAYERSTATE.questionOpenEnded}
      <input bind:value={answer} placeholder="Enter Answer" maxlength="255" />
    {/if}
  </div>
  {/key}

  {:else if state === PLAYERSTATE.hostEndedQuestion}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h1>Answers</h1>
    {#each fellowPlayers as player}
    <div class="boxborder">
      {player.name} ({player.score} pts)
      <h4>{player.answerStack}</h4>
    </div>
    {/each}
  </div>

  {:else if state === PLAYERSTATE.hostGradedAnswers}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    {#each fellowPlayers as player}
      <div>{player.name} ({player.score} pts)</div>
    {/each}
  </div>
  {/if}

  <div class="playerFooter" style="position: fixed; bottom: 10px; left: 10px;">
    {#if currentPlayerInfo}
      <div>{currentPlayerInfo.name} ({currentPlayerInfo.score} pts)</div>
    {/if}
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
    background-color: cornflowerblue;
  }
  .choices {
    font-size: 2rem;
    margin: 4px ;
  }
</style>

