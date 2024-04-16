<script>
  import logo from "../assets/triviaapp-mc.png";
  import * as Constants from "./Constants";
  export let gameState;

  const hostGame = () => {gameState = Constants.HOST}
  const joinGame = () => {gameState = Constants.PLAYER}
  const viewGame = () => {gameState = Constants.VIEWER}
</script>

<div>
  <img src={logo} class="logo" alt="Logo" />
</div>

<div class="card">
  <button on:click={hostGame}> Host a new game </button>
</div>

<div class="card">
  <button on:click={joinGame}> Join a game </button>
</div>

<div class="card">
  <button on:click={viewGame}> View a game </button>
</div>