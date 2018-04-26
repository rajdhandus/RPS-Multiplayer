var db = (function() {
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

  var players = {
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
    },
    whoseTurn: 0
  };

  var setChoice = function(choice, choosing_player) {
    console.log(choice, choosing_player);
    if (choosing_player.includes("player1")) {
      console.log("player1 is choosing " + choice);
      db.players.player1.currentChoice = choice;
      db.database.ref("/player1/currentChoice").set(choice);
    } else if (choosing_player.includes("player2")) {
      console.log("player2 is choosing " + choice);
      db.players.player2.currentChoice = choice;
      db.database.ref("/player2/currentChoice").set(choice);
    }
  };

  var initPlayer = function(playerName) {
    if (players.player1.name === "") {
      players.player1.name = playerName;
      player.nthPlayer = 1;
      player.whoAmI = 1;
      updateGreeting(1);
      // return 1;
    } else if (players.player2.name === "") {
      players.player2.name = playerName;
      player.nthPlayer = 2;
      player.whoAmI = 2;
      updateGreeting(2);
    }
    database.ref().set(players);
    // return 2;
  };

  var toggleTurns = function(to) {
    if (to === 1) {
      players.whoseTurn = 1;
      database.ref().set(players);
    } else {
      players.whoseTurn = 2;
      database.ref().set(players);
    }
  };

  database.ref().on(
    "value",
    function(snapshot) {
      db.players = snapshot.val();
      if (snapshot.child("player1").val() !== null) {
        var player1NameDB = snapshot.child("player1").val().name;
        if (player1NameDB !== "") {
          cacheDom.$player1Name.text(snapshot.child("player1").val().name);
          players = snapshot.val();
        }
      }
      if (snapshot.child("player2").val() !== null) {
        var player2NameDB = snapshot.child("player2").val().name;
        if (player2NameDB !== "") {
          cacheDom.$player2Name.text(snapshot.child("player2").val().name);
          players = snapshot.val();
          toggleTurns(1);
        }
      }

      if (snapshot.child("whoseTurn").val() !== null) {
        console.log("Player Turn" + snapshot.child("whoseTurn").val());
        // write code to highlight the current players turn
        if (snapshot.child("whoseTurn").val() === 1) {
          $("#person1").toggleClass("highlight");
        } else {
          $("#person2").toggleClass("highlight");
        }
      }
    },
    function(errorObj) {
      console.log(errorObj);
    }
  );

  var updateGreeting = function(nth) {
    var playerName = cacheDom.$nameInput.val().trim();
    cacheDom.$nameInput.replaceWith(
      "<p> Hi " +
        playerName +
        " ! Welcome.. You are Player # " +
        player.whoAmI +
        " </p>"
    );
    cacheDom.$startBtn.remove();
    disableClikOnOtherSide();
  };

  var disableClikOnOtherSide = function() {
    console.log("disableClikOnOtherSide called " + player.whoAmI);
    if (player.whoAmI === 1) {
      cacheDom.$player2Rock.attr("disabled", "disabled");
      cacheDom.$player2Rock.toggleClass("disabled", true);
      cacheDom.$player2Paper.attr("disabled", "disabled");
      cacheDom.$player2Scissors.attr("disabled", "disabled");
    } else if (player.whoAmI === 2) {
      cacheDom.$player1Rock.attr("disabled", "disabled");
      cacheDom.$player1Paper.attr("disabled", "disabled");
      cacheDom.$player1Scissors.attr("disabled", "disabled");
    }
  };

  return {
    initPlayer: initPlayer,
    toggleTurns: toggleTurns,
    setChoice: setChoice,
    players: players,
    database: database
  };
})();
