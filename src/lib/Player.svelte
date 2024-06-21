<script>
  import { fly, fade } from 'svelte/transition';

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
    hostGradedAnswers: 'hostGradedAnswers',
    playerAnswersUpdate: 'playerAnswersUpdate'
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
      if (resp.event === PLAYERSTATE.playerAnswersUpdate) {
        fellowPlayers = resp.players
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

  const selectChoice = (c) => {
    answer = c
    ws.send(JSON.stringify({event: 'playerAnswer', gameId, answer}))
  }

  let unique = {}
  function triggerTransition() {
    unique = {} // every {} is unique, {} === {} evaluates to false
  }

  function getScoreLabelColor(player) {
    if (player.scoreDelta < 0) {
      return `rgba(255, 0, 0, ${Math.abs(player.scoreDelta) / 10})`;
    } else if (player.scoreDelta > 0) {
      return `rgba(0, 255, 0, ${Math.abs(player.scoreDelta) / 10})`;
    } else {
      return "transparent";
    }
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
    <div class="input-container">
      <input bind:value={answer} placeholder="Enter Answer" maxlength="255" />
    </div>
    <button on:click={() => selectChoice(answer)} style="margin-top: .25em; font-size: 1.25em;">Submit</button>
    {#if currentPlayerInfo.answer}
      <p transition:fade class="submittedAnswer">Submitted: {currentPlayerInfo.answer}</p>
    {:else}
      <!-- invisible character to keep the transition smooth -->
      <p class="submittedAnswer">‎</p>
    {/if}
    {/if}
  </div>
  {/key}

  {:else if state === PLAYERSTATE.hostEndedQuestion}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    <h1>Answers</h1>
    {#each fellowPlayers as player}
    <div class="boxborder" style="padding: 0.5em; margin-bottom: .25em;">
      {player.name} ({player.score} pts)
      <h4>{player.answerStack}</h4>
    </div>
    {/each}
  </div>

  {:else if state === PLAYERSTATE.hostGradedAnswers}
  <div in:fly={flyInParams} out:fly={flyOutParams}>
    {#each fellowPlayers as player}
      <div class="playerScoreResults">{player.name} ({player.score} pts) 
        <mark style="background-color: {getScoreLabelColor(player)};">{player.scoreDelta > 0 ? '+' : ''}{player.scoreDelta}</mark>
      </div>
    {/each}
  </div>
  {/if}

  <div class="playerFooter">
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
  .submittedAnswer {
    font-size: 1.25rem;
    font-style: italic;
    color: gray;
  }
  .choices {
    font-size: 2rem;
    margin: 4px ;
  }
  .playerFooter {
    position: fixed; 
    font-size: 1.25rem;
    bottom: 10px; 
    left: 10px;
  }
  .playerScoreResults {
    font-size: 1.5rem;
  }
</style>

