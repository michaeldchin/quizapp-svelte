<script>
  const gameId = localStorage.getItem("gameId");
  if (gameId == null) {

  }
  const ws = new WebSocket(`ws://localhost:8080/?player=host&gameId=${gameId}`);

  export let response = null
  let players = []
  ws.onmessage = msg => {
    const resp = JSON.parse(msg.data)
    if (resp.event === 'newGame') {
      response = 'GAME ID: ' + resp.gameId
    }
    if (resp.event === 'playerJoin') {
      players = resp.players
    }
    
  }
</script>

<main>
  <p class="waitingPlayers" >Waiting for players to join...</p>
  <p class="waitingPlayers" >{response}</p>
  <p>Players: </p>
  {#each players as p}
    <div>{p}</div>
  {/each}
</main>

<style>
  .waitingPlayers {
    font-size: 1em;
  }
</style>
