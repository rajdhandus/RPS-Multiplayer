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
  whoseTurn: 0
};

console.log(playersObject);

function assignPlayer() {
  var nameOfPlayer = $nameInput.val().trim();
  console.log(nameOfPlayer);

  if (playersObject.players.player1.name === "") {
    playersObject.players.player1.name = nameOfPlayer;
    whoAmI = 1;
  } else if (playersObject.players.player2.name === "") {
    playersObject.players.player2.name = nameOfPlayer;
    whoAmI = 2;
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
// database.ref("/player1").on("value", syncLocalObj1, errorHanlder);
// database.ref("/player2").on("value", syncLocalObj2, errorHanlder);
database.ref("/whoseTurn").on("value", turnChanged, errorHanlder);

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
    // highlightTurns();
  }
}

// function syncLocalObj1(snapshot) {
//   console.log("syncLocalObj ");
//   console.log(snapshot.val());
//   if (snapshot.val() !== null) {
//     playersObject.players.player1 = snapshot.val();
//     refreshUI();
//     disableOtherBtns();
//     // highlightTurns();
//   }
// }

// function syncLocalObj2(snapshot) {
//   console.log("syncLocalObj ");
//   console.log(snapshot.val());
//   if (snapshot.val() !== null) {
//     playersObject.players.player2 = snapshot.val();
//     refreshUI();
//     disableOtherBtns();
//     // highlightTurns();
//   }
// }

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
    } else if (whoAmI === 1) {
      $statusMsg.text("Your turn to choose");
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
    } else if (whoAmI === 2) {
      $statusMsg.text("Your turn to choose");
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
    playersObject.players.player1.currentChoice = $(this).attr("id");
    playersObject.whoseTurn = 2;
    database.ref().set(playersObject);
    // database.ref("/player1/currentChoice").set($(this).attr("id"));
    // database.ref("/whoseTurn").set(2);
    // highlightTurns();
  } else if (
    $(this)
      .attr("id")
      .includes("player2")
  ) {
    console.log("Player 2 button clicked");
    console.log($(this).attr("id"));
    playersObject.players.player2.currentChoice = $(this).attr("id");
    playersObject.whoseTurn = 1;
    database.ref().set(playersObject);
    // database.ref("/player2/currentChoice").set($(this).attr("id"));
    // database.ref("/whoseTurn").set(1);
    // highlightTurns();
  }
}
