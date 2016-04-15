var Game = require("./game");
var GameView = require("./game_view");

document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementsByTagName("canvas")[0];
  canvas.width = Game.DIM_X;
  canvas.height = Game.DIM_Y;

  var ctx = canvas.getContext("2d");


  game = new Game(ctx, canvas);



  canvas.addEventListener("mousedown", function (e) {
    game.thieves.forEach( function(el) {
      if (
         e.x < el.pos[0] + 30 &&
         e.x > el.pos[0] - 30 &&
         e.y > el.pos[1] - 30 &&
         e.y < el.pos[1] + 30 &&
         el.grabbed === false
      ) {
        el.grabbed = true;
        var startPos = el.pos.slice(0);
        var timeGrabbed = Date.now();
        var release = function () {
          game.draggedThief = null;
          canvas.removeEventListener("mouseup", release);
          el.grabbed = false;
          var timeReleased = Date.now();
          el.vel[1] = (el.pos[1] - startPos[1])/(timeReleased - timeGrabbed) * 5;
          el.vel[0] = (el.pos[0] - startPos[0])/(timeReleased - timeGrabbed) * 5;
          if (el.pos[1] < game.ground) {
            el.accel[1] = 0.3;
          } else {
            el.vel[0] = 1;
          }
        };
        canvas.addEventListener("mouseup", release);
      }
    });
  });
  new GameView(game, ctx).start();


});
