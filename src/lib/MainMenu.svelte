<script>
  import logo from "../assets/triviaapp-mc.png";
  import * as Constants from "./Constants";
  export let gameState;

  const hostGame = () => {gameState = Constants.HOST}
  const joinGame = () => {gameState = Constants.PLAYER}
</script>

<div>
  <img src={logo} class="logo" alt="Logo" />
</div>

<div class="menu">
  <button class="menu-items join-game" on:click={joinGame}> Join a game </button>
  <button class="menu-items join-game" on:click={hostGame}> Host a new game </button>  
</div>


<style>
  .menu {
    padding: .5em;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .menu-items {
    margin: .5em;
  }
  .join-game {
    width: 100%;
  }
  .secondary-buttons {
    margin-top: .5em;
    width: 45%;
  }

  .logo {
    width: 100%;
  }
</style>