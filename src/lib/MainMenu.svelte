<script>
  import logo from "../assets/triviaapp-mc.svg";
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

  .logo {
    max-width: min(550px, 80vw);
  }
</style>