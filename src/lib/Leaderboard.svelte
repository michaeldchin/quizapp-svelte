<script>
  export let players;
  players = [...players].sort((a, b) => b.score - a.score);
</script>


<main>
  <div class="leaderboard-container" style="display: flex; justify-content: center;">
    <table class="leaderboard">
      <thead>
        <tr>
          <th style="width: 50%; text-align: right;">Player</th>
          <th style="width: 50%;">Score</th>
        </tr>
      </thead>
      <tbody>
        {#each players as player}
        <tr>
          <td style="width: 50%; text-align: right;">{player.name}</td>
          <td style="width: 50%;">{player.score}</td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>

<style>
    main {
      justify-content: center;
    }
    
    .leaderboard-container {
      padding: 1rem;
      margin: auto;
      width: 60%;
      display: flex;
      justify-content: center;
    }
    
    .leaderboard {
      table-layout: fixed;
    }
    
    table {
      font-size: 1.5rem;
    }
    
    td {
      padding: .25rem;
    }
</style>

