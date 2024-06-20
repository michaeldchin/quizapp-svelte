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
    <div class="box boxborder">
        <div class="nameAnswer">
            <div class="name">
            <p>{player.name} ({player.score} pts)
            </p>
            </div>
            <div class="answer">
                {#each player.answerStack as answer}
                    <p style="margin: 0; font-size: 1.25em">{answer}</p>
                {/each}
            </div>
        </div>
        <div>
            <div class="scoringSection">
                <h3 class="scoreLabel" style="background-color: {scoreLabelColor};">{player.scoreDelta}</h3> 
                <div class="buttonContainer">
                    <button class="scoreButton" on:click={() => adjustScore(-1)}>-1</button>
                    <button class="scoreButton" on:click={() => adjustScore(1)}>+1</button>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    .box {
        min-width: 175px;
        padding: 0.25em;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .scoreLabel {
        font-size: x-large;
        font-weight: bold;
        padding: 0.5em;
    }
    .buttonContainer {
        padding-bottom: 0.25em;
    }
</style>
