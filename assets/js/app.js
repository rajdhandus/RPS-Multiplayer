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
var whoAmI = 0;
var $person1 = $("#person1");
var $person2 = $("#person2");
var $statusMsg = $("#statusMsg");
var $results = $("#results");

$startBtn.on("click", assignPlayer);
$player1Rock.on("click", playerChoiceEvent);
$player1Paper.on("click", playerChoiceEvent);
$player1Scissors.on("click", playerChoiceEvent);
$player2Rock.on("click", playerChoiceEvent);
$player2Paper.on("click", playerChoiceEvent);
$player2Scissors.on("click", playerChoiceEvent);

var config = {
  apiKey: "AIzaSyC3o9XOzo0RR79sKZj-P3nrxbvBGktmm54",
  authDomain: "rps-game-d1526.firebaseapp.com",
  databaseURL: "https://rps-game-d1526.firebaseio.com",
  projectId: "rps-game-d1526",
  storageBucket: "",
  messagingSenderId: "854848246293"
};

firebase.initializeApp(config);
var database = firebase.database();

var playersObject = {
  players: {
    player1: {
      name: "",
      wins: 0,
      losses: 0,
      ties: 0,
      currentChoice: ""
    },
    player2: {
      name: "",
      wins: 0,
      losses: 0,
      ties: 0,
      currentChoice: ""
    }
  },
  whoseTurn: 0,
  whoWon: -1
};

console.log(playersObject);

window.onbeforeunload = function() {
  if (whoAmI === 1) {
    database.ref("/players/player1/name").set("");
    database.ref("/players/player1/currentChoice").set("");
    database.ref("/players/player1/losses").set(0);
    database.ref("/players/player1/wins").set(0);
    database.ref("/players/player1/ties").set(0);
  } else if (whoAmI === 2) {
    database.ref("/players/player2/name").set("");
    database.ref("/players/player2/currentChoice").set("");
    database.ref("/players/player2/losses").set(0);
    database.ref("/players/player2/wins").set(0);
    database.ref("/players/player2/ties").set(0);
  }
  database.ref("/whoseTurn").set(0);
  database.ref("/whoWon").set(-1);
  database.ref("/messages").set("");
  $person2.removeClass("highlight");
  $person1.removeClass("highlight");
};

function assignPlayer() {
  var nameOfPlayer = $nameInput.val().trim();
  console.log(nameOfPlayer);

  if (playersObject.players.player1.name === "") {
    playersObject.players.player1.name = nameOfPlayer;
    whoAmI = 1;
    $("#statusMsg").html("&nbsp;");
    if (playersObject.players.player2.name !== "") {
      playersObject.whoseTurn = 1;
    }
  } else if (playersObject.players.player2.name === "") {
    playersObject.players.player2.name = nameOfPlayer;
    whoAmI = 2;
    $("#statusMsg").html("&nbsp;");
    playersObject.whoseTurn = 1;
  } else {
    console.log("Both players are assigned");
  }
  $player1Name.text(nameOfPlayer);
  $nameInput.replaceWith(
    "<p>Hi " + nameOfPlayer + ". You are player # " + whoAmI + "</p>"
  );
  $startBtn.remove();
  updateDB();
}

database.ref("/players").on("value", syncLocalObj, errorHanlder);
database.ref("/whoseTurn").on("value", turnChanged, errorHanlder);
database.ref("/whoWon").on("value", announceWinner, errorHanlder);

database.ref("/messages").on("child_added", function(snapshot) {
  var newPost = snapshot.val();
  console.log("message added");
  $("textarea").val(
    newPost.who + moment(newPost.postedAt).fromNow() + newPost.msg
  );
});

function announceWinner(snapshot) {
  var winner = snapshot.val();
  console.log("Winner is " + winner);
  if (winner !== null && winner !== "") {
    if (winner === 1) {
      $results.text(playersObject.players.player1.name + " wins!!!");
    } else if (winner === 2) {
      $results.text(playersObject.players.player2.name + " wins!!!");
    } else if (winner === 0) {
      $results.text("It's a TIE!!!");
    } else {
      $results.text("");
    }
    playersObject.whoWon = winner;
  }
}

function turnChanged(snapshot) {
  console.log("turnChanged event happened " + snapshot.val());
  playersObject.whoseTurn = snapshot.val();
  highlightTurns();
}

function syncLocalObj(snapshot) {
  console.log("syncLocalObj ");
  console.log(snapshot.val());
  if (snapshot.val() !== null) {
    playersObject.players = snapshot.val();
    refreshUI();
    disableOtherBtns();
  }
}

function highlightTurns() {
  console.log("highlightTurns " + playersObject.whoseTurn);

  if (
    playersObject &&
    playersObject.whoseTurn &&
    playersObject.whoseTurn === 1
  ) {
    $person1.addClass("highlight");
    $person2.removeClass("highlight");
    if (whoAmI === 2) {
      $statusMsg.text("Opponent's turn! Please wait");
      toggleButtons(whoAmI, false);
    } else if (whoAmI === 1) {
      $statusMsg.text("Your turn to choose");
      toggleButtons(whoAmI, true);
    }
  }
  if (
    playersObject &&
    playersObject.whoseTurn &&
    playersObject.whoseTurn === 2
  ) {
    $person2.addClass("highlight");
    $person1.removeClass("highlight");
    if (whoAmI === 1) {
      $statusMsg.text("Opponent's turn! Please wait");
      toggleButtons(whoAmI, false);
      toggleButtons();
    } else if (whoAmI === 2) {
      $statusMsg.text("Your turn to choose");
      toggleButtons(whoAmI, true);
    }
  }
}

function disableOtherBtns() {
  if (whoAmI === 1) {
    $player2Paper.attr("disabled", "disabled");
    $player2Paper.toggleClass("disabled", true);
    $player2Rock.attr("disabled", "disabled");
    $player2Rock.toggleClass("disabled", true);
    $player2Scissors.attr("disabled", "disabled");
    $player2Scissors.toggleClass("disabled", true);
  } else if (whoAmI === 2) {
    $player1Paper.attr("disabled", "disabled");
    $player1Paper.toggleClass("disabled", true);
    $player1Rock.attr("disabled", "disabled");
    $player1Rock.toggleClass("disabled", true);
    $player1Scissors.attr("disabled", "disabled");
    $player1Scissors.toggleClass("disabled", true);
  }
}

function refreshUI() {
  if (
    playersObject &&
    playersObject.players.player1 &&
    playersObject.players.player1.name !== ""
  ) {
    $player1Name.text(playersObject.players.player1.name);
  }
  if (
    playersObject &&
    playersObject.players.player2 &&
    playersObject.players.player2.name !== ""
  ) {
    $player2Name.text(playersObject.players.player2.name);
  }
}
function errorHanlder(errorObj) {
  console.log(errorObj);
}

function updateDB() {
  console.log(playersObject);
  database.ref().set(playersObject);
}

function playerChoiceEvent() {
  console.log("playerChoiceEvent called");
  if (
    $(this)
      .attr("id")
      .includes("player1")
  ) {
    console.log("Player 1 button clicked");
    console.log($(this).attr("id"));
    playersObject.players.player1.currentChoice = $(this).text();
    playersObject.whoseTurn = 2;
    database.ref().set(playersObject);
    toggleButtons(whoAmI, false);
  } else if (
    $(this)
      .attr("id")
      .includes("player2")
  ) {
    console.log("Player 2 button clicked");
    console.log($(this).attr("id"));
    playersObject.players.player2.currentChoice = $(this).text();
    playersObject.whoseTurn = 1;
    database.ref().set(playersObject);
    toggleButtons(whoAmI, false);
    chickenDinner();
  }
}

function toggleButtons(whocalled, enable) {
  if (!enable) {
    if (whocalled === 1) {
      $player1Paper.attr("disabled", "disabled");
      $player1Paper.toggleClass("disabled", true);
      $player1Rock.attr("disabled", "disabled");
      $player1Rock.toggleClass("disabled", true);
      $player1Scissors.attr("disabled", "disabled");
      $player1Scissors.toggleClass("disabled", true);
    } else if (whocalled === 2) {
      $player2Paper.attr("disabled", "disabled");
      $player2Paper.toggleClass("disabled", true);
      $player2Rock.attr("disabled", "disabled");
      $player2Rock.toggleClass("disabled", true);
      $player2Scissors.attr("disabled", "disabled");
      $player2Scissors.toggleClass("disabled", true);
    }
  } else {
    if (whocalled === 1) {
      $player1Paper.attr("disabled", "");
      $player1Paper.prop("disabled", false);
      $player1Paper.removeClass("disabled");

      $player1Rock.attr("disabled", "");
      $player1Rock.prop("disabled", false);
      $player1Rock.removeClass("disabled");

      $player1Scissors.attr("disabled", "");
      $player1Scissors.prop("disabled", false);
      $player1Scissors.removeClass("disabled");
    } else if (whocalled === 2) {
      $player2Paper.attr("disabled", "");
      $player2Paper.prop("disabled", false);
      $player2Paper.removeClass("disabled");

      $player2Rock.attr("disabled", "");
      $player2Rock.prop("disabled", false);
      $player2Rock.removeClass("disabled");

      $player2Scissors.attr("disabled", "");
      $player2Scissors.prop("disabled", false);
      $player2Scissors.removeClass("disabled");
    }
  }
}

function chickenDinner() {
  var p1Choice;
  var p2Choice;

  database
    .ref("/players/player1/currentChoice")
    .on("value", function(snapshot) {
      console.log(snapshot.val());
      p1Choice = snapshot.val();
    });

  database
    .ref("/players/player2/currentChoice")
    .on("value", function(snapshot) {
      console.log(snapshot.val());
      p2Choice = snapshot.val();
    });

  if (p1Choice === p2Choice) {
    playerWin(0);
  } else if (p1Choice === "Rock" && p2Choice === "Scissors") {
    playerWin(1);
  } else if (p1Choice === "Rock" && p2Choice === "Paper") {
    playerWin(2);
  } else if (p1Choice === "Paper" && p2Choice === "Scissors") {
    playerWin(2);
  } else if (p1Choice === "Paper" && p2Choice === "Rock") {
    playerWin(1);
  } else if (p1Choice === "Scissors" && p2Choice === "Rock") {
    playerWin(2);
  } else if (p1Choice === "Scissors" && p2Choice === "Paper") {
    playerWin(1);
  }
}

$('input[name="chatInput"]').on("keyup", function() {
  if (whoAmI === 1 || whoAmI === 2) {
    if ($(this).val()) {
      $("#sendBtn").removeAttr("disabled");
      $("#sendBtn").removeClass("disabled");
    }
  } else {
    $("#statusMsg").text("Please log-in to send messages");
  }
});

$("#sendBtn").on("click", sendChat);

function sendChat() {
  console.log("message is sent");

  var msgPushRef = database.ref("/messages").push();

  msgPushRef.set({
    who: whoAmI,
    msg: $('input[name="chatInput"]')
      .val()
      .trim(),
    postedAt: firebase.database.ServerValue.TIMESTAMP
  });

  $('input[name="chatInput"]').val("");
  $("#sendBtn").attr("disabled", "disabled");
  $("#sendBtn").addClass("disabled");
}

function playerWin(whoThat) {
  playersObject.whoWon = whoThat;
  if (whoThat === 1) {
    console.log("Player 1 wins");
    database.ref("/whoWon").set(1);
    database.ref("/players/player1/wins").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
    database.ref("/players/player2/losses").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
  } else if (whoThat === 2) {
    console.log("Player 2 wins");
    database.ref("/whoWon").set(2);
    database.ref("/players/player2/wins").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
    database.ref("/players/player1/losses").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
  } else {
    console.log("It's a tie");
    database.ref("/whoWon").set(0);
    database.ref("/players/player1/ties").transaction(function(currentties) {
      return (currentties || 0) + 1;
    });
    database.ref("/players/player2/ties").transaction(function(currentties) {
      return (currentties || 0) + 1;
    });
  }
}
