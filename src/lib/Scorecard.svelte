<script>
    export let player;
</script>

<main>
    <div class="playerAnswerScoring">
        <div class="nameAnswer">
            <div class="name">
            <h3>{player.name}</h3>
            </div>
            <div class="answer">
            <h4 class="answerLabel">Answer:</h4><h4>{player.answer}</h4>
            </div>
        </div>
        <div class="scoringSection">
            <h3>{player.scoreDelta}</h3>
            <button class="scoreButton" on:click={() => player.scoreDelta--}>-1</button>
            <button class="scoreButton" on:click={() => player.scoreDelta++}>+1</button>
            <h3>Total Score: {player.score}</h3>
        </div>
    </div>
</main>

<style>
    .playerAnswerScoring {
        border: solid 2px;
    }
</style>