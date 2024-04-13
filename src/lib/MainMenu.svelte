<script>
  import logo from "../assets/triviaapp-mc.png";
  import * as Constants from "./Constants";
  export let gameState;

  const joinGame = () => {
    gameState = Constants.HOST
  }
</script>

<div>
  <img src={logo} class="logo" alt="Logo" />
</div>

<div class="card">
  <button on:click={() => (gameState = Constants.HOST)}> Host a new game </button>
</div>


<div class="card">
  <button on:click={joinGame}> Join a game </button>
</div>
