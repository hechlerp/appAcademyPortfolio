var GameView = function (game, ctx) {
  this.ctx = ctx;
  this.game = game;
  this.stopped = false;

};


GameView.prototype.bindKeyHandlers = function () {
  var game = this.game;

  // Object.keys(GameView.MOVES).forEach(function (k) {
  //   var move = GameView.MOVES[k];
  //   key(k, function () { ship.power(move); });
  // });

  key("enter", function () {
    this.progress();
  }.bind(this));
};

GameView.prototype.start = function () {
  this.bindKeyHandlers();
  game.draw(this.ctx);
  this.ctx.fillStyle = "rgba(0,0,0, 0.4)";
  this.ctx.fillRect(0,0,1000,600);

  this.ctx.fillStyle = "#fff";
  this.ctx.font = "18px sans-serif";
  this.ctx.textAlign = "left";
  this.startText();
  this.stopped = true;
};

GameView.prototype.startText = function () {
  this.ctx.fillText("Welcome to Defend Your Fries! Ward off moochers by throwing", 250, 300);
  this.ctx.fillText("them high enough with the mouse. If you run out of fries, you lose!", 250, 350);
  this.ctx.textAlign = "center";
  this.ctx.fillText("Press ENTER to start", 500, 400);
};

GameView.prototype.progress = function () {
  if (this.stopped === true) {
    this.game.start();
  }
};

GameView.prototype.animate = function(time){
  var timeDelta = time - this.lastTime;

  this.game.step(timeDelta);
  this.game.draw(this.ctx);
  this.lastTime = time;

  //every call to animate requests causes another call to animate
  requestAnimationFrame(this.animate.bind(this));
};

module.exports = GameView;
