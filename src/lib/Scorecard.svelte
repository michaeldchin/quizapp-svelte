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
    <div class="boxborder" style="padding: 0.5em;">
        <div class="nameAnswer">
            <div class="name">
            <p>{player.name} ({player.score} pts)
            </p>
            </div>
            <div class="answer">
            <h4>{player.answerStack}</h4>
            </div>
        </div>
        <div class="scoringSection">
            <h3 class="scoreLabel" style="background-color: {scoreLabelColor};">{player.scoreDelta}</h3> 
            <button class="scoreButton" on:click={() => adjustScore(-1)}>-1</button>
            <button class="scoreButton" on:click={() => adjustScore(1)}>+1</button>
        </div>
    </div>
</main>

<style>
    .boxborder {
        padding: 0.5em;
    }
    .scoreLabel {
        font-size: x-large;
        font-weight: bold;
        padding: 0.5em;
    }
</style>