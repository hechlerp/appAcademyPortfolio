var FryThief = require("./fry_thief");
var Fries = require("./fries");

var Game = function (ctx, canvas) {
  this.thieves = [];
  this.fries = [new Fries({pos: [800, 550]})];
  this.ctx = ctx;
  this.rate = 200;
  this.draggedThief = null;
  this.ground = 550;
  this.points = 0;
};

Game.BG_COLOR = "#ccc";
Game.DIM_X = 1000;
Game.DIM_Y = 600;
Game.MAX_THIEVES = 10;



Game.prototype.maybeAddThieves = function () {
  if (this.thieves.length < Game.MAX_THIEVES) {
    var spawn = Math.random() * this.rate;
    if (spawn <= 1) {
      this.thieves.push(new FryThief({
        pos: [0, this.ground],
        vel: [Math.random() * 1.5 + 0.5,0],
        accel: [0,0],
        game: this,
      }));
    }
    if (this.rate > 100) {
      this.rate -= 0.05;
    }
  }
};

Game.prototype.drag = function (e) {
  if (this.draggedThief) {
    this.draggedThief.pos[0] = e.x;
    this.draggedThief.pos[1] = e.y;
    this.draggedThief.vel[0] = 0;
    this.draggedThief.vel[1] = 0;
  }
};

Game.prototype.start = function () {
  this.lastTime = Date.now();
  document.getElementsByTagName("canvas")[0].addEventListener("mousemove", this.drag.bind(this));
  var gameRunner = setInterval(function() {
    var timeDelta = Date.now() - this.lastTime;
    this.moveObjects(timeDelta, this.ctx);
    this.draw(this.ctx);
    this.lastTime = Date.now();
    this.maybeAddThieves();
    this.thieves.forEach( function (fryThief) {
      if (fryThief.grabbed) {
        this.draggedThief = fryThief;
      }
    if (this.over()) {
      window.clearInterval(gameRunner);
      console.log("You lost, but at least you earned " + this.points + " points. Nerd." );
    }
    }.bind(this));
  }.bind(this), 20);
};

Game.prototype.remove = function (fryThief) {
  this.thieves.splice(this.thieves.indexOf(fryThief), 1);
  this.points += 10;
};

Game.prototype.isOutOfXBounds = function (posX) {
  return (posX < 0) || (posX > Game.DIM_X);
};

Game.prototype.allObjects = function () {
  return [].concat(this.fries, this.thieves);
};

Game.prototype.moveObjects = function (delta, ctx) {
  this.thieves.forEach( function (el) {
    el.move(delta, ctx);
    if (this.isOutOfXBounds(el.pos[0])) {
      el.vel[0] = -el.vel[0];
    }
  }.bind(this));
};

Game.prototype.draw = function (ctx) {
  ctx.clearRect(0,0, Game.DIM_X, Game.DIM_Y);
  ctx.fillStyle = Game.BG_COLOR;
  ctx.fillRect(0,0, Game.DIM_X, Game.DIM_Y);
  ctx.fillStyle = "#000";
  ctx.font = "18px sans-serif";
  ctx.fillText(((this.points) + " points"), 100, 30);
  this.allObjects().forEach( function(el) {
    el.draw(ctx);
  });
};

Game.prototype.over = function () {
  if (this.fries[0].health <= 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = Game;
