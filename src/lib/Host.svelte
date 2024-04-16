<script>
  const gameId = localStorage.getItem("gameId");
  if (gameId == null) {

  }
  const ws = new WebSocket(`ws://localhost:8080/?player=host&gameId=${gameId}`);

  export let response = null
  ws.onmessage = msg => {
    console.log(msg)
    response = msg.data

    // handle players joining your game
    // handle 
    
  }
  // localStorage.setItem('gameId', 'aaab')
</script>

<main>
  <p>stuuff</p>
  <p>{response}</p>
  <p class="waitingPlayers"></p>
</main>

<style>
  .waitingPlayers {
    font-size: 1em;
  }
</style>