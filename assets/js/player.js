var player = (function() {
  var addEventListeners = function() {
    cacheDom.$startBtn.on("click", assignPlayer);
    cacheDom.$player1Rock.on("click", playerChoiceEvent);
    cacheDom.$player1Paper.on("click", playerChoiceEvent);
    cacheDom.$player1Scissors.on("click", playerChoiceEvent);
    cacheDom.$player2Rock.on("click", playerChoiceEvent);
    cacheDom.$player2Paper.on("click", playerChoiceEvent);
    cacheDom.$player2Scissors.on("click", playerChoiceEvent);
  };

  var whoAmI = 0;

  var assignPlayer = function() {
    var playerName = cacheDom.$nameInput.val().trim();
    console.log(playerName);
    db.initPlayer(playerName);
  };

  var playerChoiceEvent = function() {
    console.log($(this).text());
    db.toggleTurns(2);
    db.setChoice($(this).text(), $(this).attr("id"));
  };

  return {
    addEventListeners: addEventListeners,
    whoAmI: whoAmI
  };
})();
