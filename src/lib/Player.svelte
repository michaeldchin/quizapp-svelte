<script>
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

  let gameId = 'aaaa'
  let playerName = randomDefaultNames[Math.floor(Math.random() * randomDefaultNames.length)]
  let fellowPlayers = []
  let answer = ''
  let state = PLAYERSTATE.prompt
  let warning
  let ws = undefined;
  const connectToGame = () => {
    ws = new WebSocket(`${baseURL}/?player=player&gameId=${gameId}&playerName=${playerName}`);
    ws.onmessage = (msg) => {
      if (msg.data === 'There is no host, try again when someone is hosting a game') {
        warning = msg.data
        return
      }
      state = PLAYERSTATE.waiting
      const resp = JSON.parse(msg.data)
      console.log(resp)
      if (resp.event === 'playerJoin') {
        fellowPlayers = resp.players
      }
      if (resp.event === PLAYERSTATE.hostLeftGameClose) {
        state = PLAYERSTATE.hostLeftGameClose
      }
      if (resp.event === PLAYERSTATE.hostStartedGame) {
        state = PLAYERSTATE.hostStartedGame
      }
      if (resp.event === PLAYERSTATE.questionMultipleChoice) {
        answer = '' // new question
        state = PLAYERSTATE.questionMultipleChoice
      }
      if (resp.event === PLAYERSTATE.questionTrueFalse) {
        answer = '' // new question
        state = PLAYERSTATE.questionTrueFalse
      }
      if (resp.event === PLAYERSTATE.questionOpenEnded) {
        answer = '' // new question
        state = PLAYERSTATE.questionOpenEnded
      }
      if (resp.event === PLAYERSTATE.hostEndedQuestion) {
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
</script>

<main>
  <div id="join-prompt" hidden={state !== 'prompt'}>
    <div class="input-container">
      <!-- <h3>Game Id (Hardcoded you can't change this):</h3>
      <input bind:value={gameId} disabled placeholder="Enter game ID" /> -->
      
      <h3>Player Name:</h3><input bind:value={playerName} placeholder="Enter PlayerName" />
    </div>
    <button disabled={!gameId} on:click={connectToGame}>Join Game</button>
    <p class="input-warning" hidden={!warning}>{warning}</p>
  </div>

  <div id="waiting" hidden={state !== 'waiting'}>
    <p>Waiting for game to start</p>
    <p>Fellow players:</p>
    {#each fellowPlayers as player}
      <div class="waitingPlayers">{player.name}</div>
    {/each}
  </div>

  <div id="gameClosedByHost" hidden={state !== PLAYERSTATE.hostLeftGameClose}>
    <p>Game ended by host, refresh to get back to main menu</p>
  </div>

  <div id="hostStartedGame" hidden={state !== PLAYERSTATE.hostStartedGame}>
    <p>Game started. Waiting for host to send question</p>
  </div>

  <div id="questionMultipleChoice" hidden={state !== PLAYERSTATE.questionMultipleChoice}>
    {#each ['A','B','C','D'] as option}
      <button id={option} 
              class:selectedChoice="{option === answer}"
              class="choices"
              on:click={() => selectChoice(option)}>{option}</button>
    {/each}
  </div>

  <div id="questionTrueFalse" hidden={state !== PLAYERSTATE.questionTrueFalse}>
    {#each ['True','False'] as option}
      <button id={option} 
              class:selectedChoice="{option === answer}"
              class="choices"
              on:click={() => selectChoice(option)}>{option}</button>
    {/each}
  </div>

  <div id="questionOpenEnded" hidden={state !== PLAYERSTATE.questionOpenEnded}>
    <input bind:value={answer} placeholder="Enter Answer" maxlength="255"/>
  </div>

  <div id="hostEndedQuestion" hidden={state !== PLAYERSTATE.hostEndedQuestion}>
    {#each fellowPlayers as player}
      <h3>{player.name}: </h3>
      <h3>{player.answer}</h3>
    {/each}
  </div>

  <div hidden={state !== PLAYERSTATE.hostGradedAnswers}>
    {#each fellowPlayers as player}
      <h3>{player.name}: </h3>
      <h3>{player.score}</h3>
    {/each}
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
