$("#updateBoard").click(function () {
  score.teamA.name = $("#nameTeamA").val();
  score.teamA.score = $("#scoreTeamA").val();
  score.teamA.fouls = $("#foulsTeamA").val();
  score.teamA.timeout = $("#timeoutTeamA").val();

  score.teamB.name = $("#nameTeamB").val();
  score.teamB.score = $("#scoreTeamB").val();
  score.teamB.fouls = $("#foulsTeamB").val();
  score.teamB.timeout = $("#timeoutTeamB").val();

  let r = confirm("Are you sure you want to update the board?");
  if (r) {
    sendMsg(JSON.stringify(score), "boardUpdate");
  }
});
