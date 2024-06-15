<script>
    export let player;
    let minusColor;
    let plusColor;

    function adjustScore(amount) {
        player.scoreDelta += amount;
        if (player.scoreDelta < 0) {
            minusColor = "rgba(255, 0, 0, 0.5)";
            plusColor = "white";
        } else if (player.scoreDelta > 0) {
            plusColor = "rgba(0, 128, 0, 0.5)";
            minusColor = "white";
        } else {
            plusColor = "white";
            minusColor = "white";
        }
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
            <h3 class="scoreLabel">{player.scoreDelta}</h3> 
            <button class="scoreButton" style="background-color: {minusColor};" on:click={() => adjustScore(-1)}>-1</button>
            <button class="scoreButton" style="background-color: {plusColor};" on:click={() => adjustScore(1)}>+1</button>
            <h3>Total Score: {player.score}</h3>
        </div>
    </div>
</main>

<style>
    .scoreLabel {
        font-size: x-large;
        font-weight: bold;
    }
</style>