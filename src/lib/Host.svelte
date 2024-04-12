<script>
  const gameId = localStorage.getItem("gameId");
  if (gameId == null) {

  }
  const ws = new WebSocket(`ws://localhost:8080/?player=host&gameId=${gameId}`);

  // localStorage.setItem('gameId', 'aaab')
</script>

<main>
  <p>stuuff</p>
</main>
