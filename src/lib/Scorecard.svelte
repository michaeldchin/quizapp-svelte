<script>
    export let player;
    let scoreLabelColor;

    function updateScoreLabelColor() {
        if (player.scoreDelta < 0) {
            scoreLabelColor = `rgba(255, 0, 0, ${Math.abs(player.scoreDelta) / 10})`;
        } else if (player.scoreDelta > 0) {
            scoreLabelColor = `rgba(0, 255, 0, ${Math.abs(player.scoreDelta) / 10})`;
        } else {
            scoreLabelColor = "transparent";
        }
    }

    function adjustScore(amount) {
        player.scoreDelta += amount;
        updateScoreLabelColor();
    }   
</script>

<main>
    <div class="boxborder">
        <div class="nameAnswer">
            <div class="name">
            <h3>{player.name}</h3>
            </div>
            <div class="answer">
            <h4 class="answerLabel">Answer:</h4><h4>{player.answer}</h4>
            </div>
        </div>
        <div class="scoringSection">
            <h3 class="scoreLabel" style="background-color: {scoreLabelColor};">{player.scoreDelta}</h3> 
            <button class="scoreButton" on:click={() => adjustScore(-1)}>-1</button>
            <button class="scoreButton" on:click={() => adjustScore(1)}>+1</button>
            <h3>Total Score: {player.score}</h3>
        </div>
    </div>
</main>

<style>
    .scoreLabel {
        font-size: x-large;
        font-weight: bold;
        padding: 0.5em;
    }
</style>