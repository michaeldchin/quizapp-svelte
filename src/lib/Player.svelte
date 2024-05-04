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
  }
  const baseURL = import.meta.env.VITE_BASEURL

  let gameId = 'aaaa'
  let fellowPlayers = []
  let answer = ''
  let state = PLAYERSTATE.prompt
  let ws = undefined;
  const connectToGame = () => {
    ws = new WebSocket(`${baseURL}/?player=player&gameId=${gameId}`);
    ws.onmessage = (msg) => {
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
      <input bind:value={gameId} placeholder="Enter game ID" />
    </div>
    <button disabled={!gameId} on:click={connectToGame}>Join Game</button>
    <p class="input-warning"></p>
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
    <input bind:value={answer} placeholder="Enter Answer" />
  </div>

  <div id="hostEndedQuestion" hidden={state !== PLAYERSTATE.hostEndedQuestion}>
    <h2>Your Answer</h2>
    <h3>{answer}</h3>
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
