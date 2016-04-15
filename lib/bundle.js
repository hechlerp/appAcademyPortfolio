/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/lib/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);
	var GameView = __webpack_require__(5);
	
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var FryThief = __webpack_require__(2);
	var Fries = __webpack_require__(4);
	
	var Game = function (ctx, canvas) {
	  this.thieves = [];
	  this.fries = [new Fries({pos: [800, 550]})];
	  this.ctx = ctx;
	  this.rate = 200;
	  this.draggedThief = null;
	  this.ground = 550;
	  this.displayedPoints = 0;
	  this.pointIncrementRate = 0;
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
	    if (this.rate > 50) {
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
	      this.ctx.font = "36px sans-serif";
	      this.ctx.fillStyle = "#000";
	      this.ctx.textAlign = "center";
	      this.ctx.fillText(
	        ("Look at that. You lost. You earned " + this.points + " points I guess."),
	        500,
	        200
	      );
	    }
	    }.bind(this));
	  }.bind(this), 20);
	};
	
	Game.prototype.remove = function (fryThief) {
	  this.thieves.splice(this.thieves.indexOf(fryThief), 1);
	  this.points += 30;
	  this.pointIncrementRate += 3;
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
	  this.incrementPoints.call(this, this.pointIncrementRate);
	  ctx.clearRect(0,0, Game.DIM_X, Game.DIM_Y);
	  ctx.drawImage((document.getElementById("background")),0, 0, Game.DIM_X, Game.DIM_Y);
	  ctx.fillStyle = "#000";
	  ctx.font = "18px sans-serif";
	  ctx.fillText(((this.displayedPoints) + " points"), 100, 30);
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
	
	Game.prototype.incrementPoints = function (rate) {
	  if (this.points > this.displayedPoints) {
	    this.displayedPoints += rate;
	    if (this.displayedPoints > this.points) {
	      this.displayedPoints = this.points;
	    }
	  } else {
	    this.pointIncrementRate = 0;
	  }
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(3);
	
	var FryThief = function (options) {
	  this.pos = options.pos;
	  this.vel = options.vel;
	  this.runSpeed = options.vel[0];
	  this.color = "#000";
	  this.game = options.game;
	  this.accel = options.accel;
	  this.grabbed = false;
	  this.stealing = false;
	  this.closing = 0;
	};
	
	FryThief.prototype.draw = function (ctx) {
	  if (this.stealing && this.stealing <= 10) {
	    this.stealing += 1;
	    ctx.drawImage(document.getElementById("master-hand-open"), this.pos[0] - 40, this.pos[1] - 50, 50, 50);
	  } else if (this.stealing > 10 && this.stealing <= 20) {
	    this.stealing += 1;
	    ctx.drawImage(document.getElementById("master-hand-closing"), this.pos[0] - 38, this.pos[1] - 40, 50, 50);
	  } else if (this.stealing > 20 && this.stealing <= 30) {
	    this.stealing += 1;
	    ctx.drawImage(document.getElementById("master-hand-closed"), this.pos[0] - 38, this.pos[1] - 40, 50, 50);
	
	  } else if (this.stealing && this.stealing > 30) {
	    this.stealing += 1;
	    ctx.drawImage(document.getElementById("master-hand-clenched"), this.pos[0] - 32, this.pos[1] - 30, 37, 37);
	    if (this.stealing >= 45) {
	      this.stealing = 1;
	    }
	  } else {
	    ctx.drawImage(document.getElementById("master-hand"), this.pos[0] - 40, this.pos[1] - 40, 40, 40);
	  }
	};
	
	var NORMAL_FRAME_TIME_DELTA = 1000/60;
	
	FryThief.prototype.move = function (timeDelta, ctx) {
	  var velocityScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
	  var deltaX = this.vel[0] * velocityScale;
	  var deltaY = this.vel[1] * velocityScale;
	  if (this.pos[1] + deltaY > this.game.ground) {
	    this.splat();
	    this.pos[1] = this.game.ground;
	    this.accel[1] = 0;
	    this.vel[1] = 0;
	    this.vel[0] = this.runSpeed;
	  } else {
	    this.pos[1] = this.pos[1] + deltaY;
	    this.vel[0] = this.runSpeed;
	  }
	  this.vel = [this.vel[0] + this.accel[0], this.vel[1] + this.accel[1]];
	  this.adjustX(deltaX, ctx);
	};
	
	FryThief.prototype.splat = function () {
	  if (this.vel[1] >= 13) {
	    this.game.remove(this);
	  }
	};
	
	FryThief.prototype.adjustX = function (deltaX, ctx) {
	  if (this.pos[1] === this.game.ground && this.pos[0] >= (this.game.fries[0].pos[0] + 30)) {
	    this.pos[0] = this.game.fries[0].pos[0] + 30;
	    this.vel[0] = 0;
	    this.game.fries[0].health -= 0.3;
	    this.game.fries[0].changed = true;
	    if (!this.stealing) {
	      this.stealing = 1;
	    }
	
	  } else {
	    this.pos[0] = this.pos[0] + deltaX;
	    this.stealing = false;
	  }
	};
	
	FryThief.prototype.other = function () {
	  console.log("http://www.freesound.org/people/wubitog/sounds/234783/");
	};
	
	
	module.exports = FryThief;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Util = {
	  distance: function (initPos, endPos) {
	    return Math.sqrt(
	      Math.pow(initPos[0] - endPos[0], 2) + Math.pow(initPos[0] - endPos[0], 2)
	    );
	  },
	
	  magnitude: function (vector) {
	    return Util.distance([0,0], vector);
	  },
	
	
	  inherits: function (ChildClass, ParentClass) {
	    function Surrogate () {}
	    Surrogate.prototype = ParentClass.prototype;
	    ChildClass.prototype = new Surrogate();
	    ChildClass.prototype.constructor = ChildClass;
	  }
	};
	
	
	module.exports = Util;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var Fries = function (options) {
	  this.pos = options.pos;
	  this.health = 1000;
	  this.changed = false;
	};
	
	Fries.prototype.draw = function (ctx) {
	  var offset = function () {
	    if (this.changed) {
	      var intensity = (1 - (this.health / 1000)) * 20;
	      return (Math.random() * intensity) - (intensity / 2);
	    } else {
	      return 0;
	    }
	  };
	  ctx.drawImage(document.getElementById("fries"), this.pos[0], this.pos[1] - 45, 80, 80);
	  ctx.fillStyle= "#000";
	  ctx.font = "18px sans-serif";
	  ctx.textAlign = "center";
	  ctx.fillText(("You have " + Math.floor(this.health) + " fries left"), 770 + offset.call(this), 30 + offset.call(this), 250);
	  ctx.fillStyle = "#ccc";
	  ctx.fillRect(600, 50, 350, 30);
	  ctx.strokeStyle = "#000;";
	  ctx.lineWidth = 10;
	  ctx.strokeRect(600, 50, 350, 30);
	  ctx.fillStyle = "#f00";
	  ctx.fillRect(605, 55, (this.health / 2.94), 20);
	  this.changed = false;
	};
	
	module.exports = Fries;


/***/ },
/* 5 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map