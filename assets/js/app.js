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
let firstIteration = true;

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

window.onbeforeunload = resetDB;

function resetDB() {
  if (whoAmI === 1) {
    database.ref("/players/player1/name").set("");
    database.ref("/players/player1/currentChoice").set("");
    database.ref("/players/player1/losses").set(0);
    database.ref("/players/player1/wins").set(0);
    database.ref("/players/player1/ties").set(0);
    database.ref("/whoseTurn").set(0);
    database.ref("/whoWon").set(-1);
    database.ref("/messages").set("");
    $person2.removeClass("highlight");
    $person1.removeClass("highlight");
  } else if (whoAmI === 2) {
    database.ref("/players/player2/name").set("");
    database.ref("/players/player2/currentChoice").set("");
    database.ref("/players/player2/losses").set(0);
    database.ref("/players/player2/wins").set(0);
    database.ref("/players/player2/ties").set(0);
    database.ref("/whoseTurn").set(0);
    database.ref("/whoWon").set(-1);
    database.ref("/messages").set("");
    $person2.removeClass("highlight");
    $person1.removeClass("highlight");
  }
}

function enableChat() {
  $("#chatInput").attr("placeholder", "Type your messages here");
  $("#chatInput").attr("disabled", "");
  $("#chatInput").prop("disabled", false);
  $("#chatInput").removeClass("disabled");
}

function assignPlayer() {
  var nameOfPlayer = $nameInput.val().trim();

  if (playersObject.players.player1.name === "") {
    playersObject.players.player1.name = nameOfPlayer;
    whoAmI = 1;
    $("#statusMsg").html("&nbsp;");
    enableChat();
    if (playersObject.players.player2.name !== "") {
      playersObject.whoseTurn = 1;
    }
  } else if (playersObject.players.player2.name === "") {
    playersObject.players.player2.name = nameOfPlayer;
    whoAmI = 2;
    $("#statusMsg").html("&nbsp;");
    enableChat();
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
  var message = $("<div>");
  message.addClass("message");
  var img = $("<img>");
  img.addClass("avatar");
  if (newPost.who === playersObject.players.player1.name) {
    img.attr("src", "./assets/images/icons8-account-26.png");
  } else {
    img.attr("src", "./assets/images/icons8-contacts-26.png");
  }
  var timeDiv = $("<div>");
  timeDiv.addClass("datetime");
  timeDiv.text(moment(newPost.postedAt).fromNow());
  var pMsg = $("<p>");
  pMsg.text(newPost.msg);

  message.append(img);
  message.append(timeDiv);
  message.append(pMsg);

  message.prependTo(".chat-container");
});

function announceWinner(snapshot) {
  var winner = snapshot.val();
  if (winner !== null && winner !== "") {
    if (winner === 1) {
      $results.text(playersObject.players.player1.name + " wins!!!");
      $results.append(
        "<p>" +
          playersObject.players.player1.currentChoice +
          " VS " +
          playersObject.players.player2.currentChoice +
          "<p>"
      );
      setTimeout(function() {
        $results.text("");
        database.ref("/whoWon").set(-1);
      }, 2000);
    } else if (winner === 2) {
      $results.text(playersObject.players.player2.name + " wins!!!");
      $results.append(
        "<p>" +
          playersObject.players.player1.currentChoice +
          " VS " +
          playersObject.players.player2.currentChoice +
          "<p>"
      );
      setTimeout(function() {
        $results.text("");
        database.ref("/whoWon").set(-1);
      }, 2000);
    } else if (winner === 0) {
      $results.text("It's a TIE!!!");
      $results.append(
        "<p>" +
          playersObject.players.player1.currentChoice +
          " VS " +
          playersObject.players.player2.currentChoice +
          "<p>"
      );
      setTimeout(function() {
        $results.text("");
        database.ref("/whoWon").set(-1);
      }, 2000);
    } else {
      $results.text("");
    }
    playersObject.whoWon = winner;
  }
}

function turnChanged(snapshot) {
  playersObject.whoseTurn = snapshot.val();
  highlightTurns();
}

function syncLocalObj(snapshot) {
  if (snapshot.val() !== null) {
    playersObject.players = snapshot.val();
    refreshUI();
    if (whoAmI === 1) {
      toggleButtons(2, false);
    } else if (whoAmI === 2) {
      toggleButtons(1, false);
    }
  }
}

function highlightTurns() {
  if (
    playersObject &&
    playersObject.whoseTurn &&
    playersObject.whoseTurn === 1
  ) {
    $person2.removeClass("highlight");

    if (whoAmI === 2) {
      toggleButtons(whoAmI, false);
    } else if (whoAmI === 1) {
      toggleButtons(whoAmI, true);
    }
    $statusMsg.html("&nbsp;");

    let timeToWait = 2000;

    if (firstIteration) {
      timeToWait = 0;
      firstIteration = false;
    }
    setTimeout(function() {
      $person1.addClass("highlight");
      if (whoAmI === 2) {
        $statusMsg.text("Opponent's turn! Please wait");
      } else if (whoAmI === 1) {
        $statusMsg.text("Your turn to choose");
      }
    }, timeToWait);
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

function refreshUI() {
  if (
    playersObject &&
    playersObject.players.player1 &&
    playersObject.players.player1.name !== ""
  ) {
    $player1Name.text(playersObject.players.player1.name);
    $("#p1wins").text(playersObject.players.player1.wins);
    $("#p1losses").text(playersObject.players.player1.losses);
    $("#p1ties").text(playersObject.players.player1.ties);
  }
  if (
    playersObject &&
    playersObject.players.player2 &&
    playersObject.players.player2.name !== ""
  ) {
    $player2Name.text(playersObject.players.player2.name);
    $("#p2wins").text(playersObject.players.player2.wins);
    $("#p2losses").text(playersObject.players.player2.losses);
    $("#p2ties").text(playersObject.players.player2.ties);
  }
}
function errorHanlder(errorObj) {
  console.log(errorObj);
}

function updateDB() {
  database.ref().set(playersObject);
}

function playerChoiceEvent() {
  if (
    $(this)
      .attr("id")
      .includes("player1")
  ) {
    playersObject.players.player1.currentChoice = $(this).text();
    playersObject.whoseTurn = 2;
    database.ref().set(playersObject);
    toggleButtons(whoAmI, false);
  } else if (
    $(this)
      .attr("id")
      .includes("player2")
  ) {
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
      p1Choice = snapshot.val();
    });

  database
    .ref("/players/player2/currentChoice")
    .on("value", function(snapshot) {
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

function playerWin(whoThat) {
  playersObject.whoWon = whoThat;
  if (whoThat === 1) {
    database.ref("/whoWon").set(1);
    database.ref("/players/player1/wins").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
    database.ref("/players/player2/losses").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
  } else if (whoThat === 2) {
    database.ref("/whoWon").set(2);
    database.ref("/players/player2/wins").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
    database.ref("/players/player1/losses").transaction(function(currentwins) {
      return (currentwins || 0) + 1;
    });
  } else {
    database.ref("/whoWon").set(0);
    database.ref("/players/player1/ties").transaction(function(currentties) {
      return (currentties || 0) + 1;
    });
    database.ref("/players/player2/ties").transaction(function(currentties) {
      return (currentties || 0) + 1;
    });
  }
}

$(function() {
  $("form").on("submit", function(event) {
    event.preventDefault();
    var msgPushRef = database.ref("/messages").push();
    var thisPlayerName = "player" + whoAmI;
    msgPushRef.set({
      who: playersObject.players[thisPlayerName].name,
      msg: $("#chatInput")
        .val()
        .trim(),
      postedAt: firebase.database.ServerValue.TIMESTAMP
    });
    $("#chatInput").val("");
  });
});
