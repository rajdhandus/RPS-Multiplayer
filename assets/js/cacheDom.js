var cacheDom = (function() {
  var $nameInput = $("#nameInput");
  var $startBtn = $("#startBtn");
  var $player1Name = $("#player1Name");
  var $player2Name = $("#player2Name");

  var $player1Rock = $("#player1Rock");
  var $player1Paper = $("#player1Paper");
  var $player1Scissors = $("#player1Scissors");

  var $player2Rock = $("#player2Rock");
  var $player2Paper = $("#player2Paper");
  var $player2Scissors = $("#player2Scissors");

  return {
    $nameInput: $nameInput,
    $startBtn: $startBtn,
    $player1Name: $player1Name,
    $player2Name: $player2Name,
    $player1Rock: $player1Rock,
    $player1Paper: $player1Paper,
    $player1Scissors: $player1Scissors,
    $player2Rock: $player2Rock,
    $player2Paper: $player2Paper,
    $player2Scissors: $player2Scissors
  };
})();
