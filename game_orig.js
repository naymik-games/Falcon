let game;

let gameOptions = {


  // duration of the wall, in milliseconds
  wallDuration: 100,

  // ball start speed, in pixels/second
  ballStartSpeed: 500,

  // ball speed increase at each successful bounce, in pixels/second
  ballSpeedIncrease: 20
}
window.onload = function () {
  let gameConfig = {
    width: 380,
    height: 640,
    scene: [preloadGame, GameSceneStart, GameScene, UIScene],
    backgroundColor: 0x222222,
    physics: {
      default: "arcade"
    }
  }
  game = new Phaser.Game(gameConfig);
  window.focus()
  resize();
  window.addEventListener("resize", resize, false);
}


var GameSceneStart = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GameSceneStart() {
      Phaser.Scene.call(this, { key: 'GameSceneStart' });
    },

  preload: function () {


  },

  create: function () {
    var startinfo = this.add.text(game.config.width / 2, game.config.height / 2, 'Start', { font: '24px Arial', fill: '#ffffff' });


    //  Make them all input enabled
    startinfo.setInteractive();


    this.input.on('pointerdown', this.clickHandler, this);
  },

  clickHandler: function (pointer, block) {


    //  Dispatch a Scene event
    this.scene.start('GameScene');
  }

});
var healthText;

//////////////////////////////////////////////

var GameScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GameScene() {
      Phaser.Scene.call(this, { key: 'GameScene' });
    },

  preload: function () {
    this.load.image('block', 'assets/falcon3.png');
    this.load.image('shield', 'assets/blurred-circle.png');
    this.load.image('bonus', 'assets/bonus3.png');
    this.load.image('asteroid_small', 'assets/asteroid_small.png');

    this.load.image('bar', 'assets/block.png');
    this.load.image('enemy', 'assets/tiefighter3.png');
    this.load.image('laser', 'assets/fire2.png');
    this.load.image('pixel', 'assets/pixel.png');
    this.load.bitmapFont("font", "assets/fonts/arcade.png", "assets/fonts/arcade.xml");


  },
  // shield
  //fuel, when kids x velocity allows
  create: function () {
    this.input.addPointer(9);
    this.hyperspace = false;
    this.hasShield = false;
    this.isImmune = false;
    this.bonusType = 1;
    this.immuneCount = 0;
    var enemyGroup = this.physics.add.group({
      defaultKey: "enemy",
      maxSize: 15,
      visible: false,
      active: false
    });

    var laserGroup = this.physics.add.group({
      defaultKey: "laser",
      maxSize: 16,
      visible: false,
      active: false
    });

    var tieLaserGroup = this.physics.add.group({
      defaultKey: "laser",
      maxSize: 16,
      visible: false,
      active: false
    });

    var bonusGroup = this.physics.add.group({
      defaultKey: "bonus",
      maxSize: 5,
      visible: false,
      active: false
    });

    var smallAsteroidGroup = this.physics.add.group({
      defaultKey: "asteroid_small",
      maxSize: 20,
      visible: false,
      active: false
    });

    this.shield = this.physics.add.image(-100, - 100, "shield").setScale(1).setAlpha(.1);
    this.shield.body.setImmovable(true);

    this.theBlock = this.physics.add.image(game.config.width / 2, game.config.height - 100, "block").setScale(.75);
    this.theBlock.body.setImmovable(true);
    this.theBlock.body.collideWorldBounds = true;
    this.health = 100;
    // this.theBlock.displaWidth=50;
    // this.theBlock.displaHeight=50;

    healthText = this.add.bitmapText(game.config.width / 2, 25, "font", "ccc", 40);
    healthText.setText(this.health);

    this.moving = false;
    //  Make them all input enabled



    this.bar = this.physics.add.image(game.config.width / 2, game.config.height - 5, "bar").setAlpha(.5);
    this.bar.setInteractive();
    this.bar.displayWidth = 380;
    this.bar.displayHeight = 100;

    this.healthBarback = this.makeBar(0, game.config.height - 25, 0x333333);
    this.healthBar = this.makeBar(0, game.config.height - 25, 0x2ecc71);
    this.setValue(this.healthBar, this.health);

    this.input.on('pointermove', this.move, this);
    this.input.on('pointerdown', this.startMove, this);
    this.input.on('pointerup', this.endMove, this);


    /*    var particles = this.add.particles("pixel");

        // trail emitter configuration
        this.emitter = particles.createEmitter({
            // particle speed - particles do not move
           // speed: 1000,
            speed: {
                    min: -1000,
                    max: 1000
                    },
            // particle scale: from 1 to zero
            scale: {
                start: .75,
                end: 0
            },
            // particle alpha: from opaque to transparent
            alpha: {
                start: 1,
                end: 0
            },
            // particle frequency: one particle every 100 milliseconds
            frequency: 50,
            // particle lifespan: 1 second
            lifespan: 1000
        });*/
    //   this.emitter.startFollow(this.theBlock);

    this.input.on('pointerdown', this.fire, this);
    this.varytimer = Math.floor(Math.random() * 3);

    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        this.createEnemy();
      }
    });

    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.createBonus();
      }
    });

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.createAsteroid(1);
      }
    });
    // this.input.on('pointerdown', this.clickHandler, this);
    this.physics.add.collider(laserGroup, enemyGroup, this.laserHitEnemy, null, this);
    this.physics.add.collider(this.theBlock, enemyGroup, this.hitByTie, null, this);
    this.physics.add.collider(this.theBlock, tieLaserGroup, this.hitByTieLaser, null, this);
    this.physics.add.collider(this.theBlock, bonusGroup, this.hitByBonus, null, this);
    this.physics.add.collider(smallAsteroidGroup, smallAsteroidGroup, this.hitByBonus, null, this);
    this.physics.add.collider(smallAsteroidGroup, this.shield);

    this.physics.add.collider(this.shield, tieLaserGroup, this.shieldHitByTieLaser, null, this);
    this.physics.add.overlap(laserGroup, smallAsteroidGroup, this.laserHitAsteroid, null, this);

  },

  update: function () {
    // enemyGroup.incX(-8);
    if (this.isImmune) {
      this.immuneCount++
      if (this.immuneCount == 100) {
        this.isImmune = false;
        this.theBlock.setAlpha(1);
        this.immuneCount = 0;
      }
    }
    if (this.hyperspace) {
      if (this.theBlock.x < 0) {
        this.theBlock.setPosition(360, this.theBlock.y);
      }
      if (this.theBlock.x > 360) {
        this.theBlock.setPosition(0, this.theBlock.y);
      }
    } else {


    }

    if (this.hasShield) {
      this.shield.setPosition(this.theBlock.x, this.theBlock.y);
      if (this.health < 30) {
        this.hasShield = false;
        this.tweens.add({
          targets: this.shield,
          alpha: 0,
          scale: .3,
          ease: "Linear",
          durration: 100,
          repeat: 2,

          callbackScope: this,
          onComplete: function () {
            this.shield.setPosition(-100, -100);
          }
        });
      }
    }
    if (this.health <= 0) {
      this.scene.start('GameScene');
    }

    enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active && enemy.y > game.config.height) {
        enemyGroup.killAndHide(enemy);
      }
    });

    laserGroup.getChildren().forEach(laser => {
      if (laser.active && laser.y < 0) {
        laserGroup.killAndHide(laser);
      }
    });

    tieLaserGroup.getChildren().forEach(laser => {
      if (laser.active && laser.y > 640) {
        tieLaserGroup.killAndHide(laser);
      }
    });

    bonusGroup.getChildren().forEach(bonus => {
      if (bonus.active && bonus.y > 640) {
        bonusGroup.killAndHide(bonus);
      }
    });

    smallAsteroidGroup.getChildren().forEach(ast => {
      if (ast.active && ast.y > 640) {
        smallAsteroidGroup.killAndHide(ast);
      }
    });
  },
  hitByTie: function (falcon, tie) {
    if (!this.isImmune) {
      this.health -= 20;
      healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }
    enemyGroup.killAndHide(tie);
    this.destroyEnemy(tie);

  },
  hitByBonus: function (falcon, bonus) {
    if (bonus.type == 1) {
      this.health = 100;
      healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.hasShield = true;
    } else if (bonus.type == 2) {
      this.hyperspace = true;
      falcon.body.collideWorldBounds = false;
      this.health = 100;
      healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.bar.tint = 0xffbbee;
    }

    this.cameras.main.shake(100, 0.01);

    bonusGroup.killAndHide(bonus);
    this.destroyEnemy(bonus);

  },
  hitByTieLaser: function (falcon, tiel) {
    if (!this.isImmune) {
      this.health -= 10;
      healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }
    tieLaserGroup.killAndHide(tiel);
    this.destroyEnemy(tiel);

  },
  shieldHitByTieLaser: function (shield, tiel) {

    this.cameras.main.shake(400, 0.01);
    tieLaserGroup.killAndHide(tiel);
    this.destroyEnemy(tiel);

  },
  destroyEnemy: function (enemy) {
    enemy.body.enable = false;
    var particles = this.add.particles("pixel");
    var emitter = particles.createEmitter({
      // particle speed - particles do not move
      // speed: 1000,
      speed: {
        min: -1000,
        max: 1000
      },
      // particle scale: from 1 to zero
      scale: {
        start: 1,
        end: 0
      },
      // particle alpha: from opaque to transparent
      alpha: {
        start: 1,
        end: 0
      },
      // particle frequency: one particle every 100 milliseconds
      frequency: 25,
      // particle lifespan: 1 second
      lifespan: 500
    });
    emitter.explode(20, enemy.x, enemy.y);


  },
  falconHit: function (falcon, enemy) {
    if (!this.isImmune) {
      this.health -= 10;
      healthText.setText(this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }





  },
  laserHitEnemy: function (laser, enemy) {
    enemyGroup.killAndHide(enemy);
    laserGroup.killAndHide(laser);
    laser.body.enable = false;
    var particles = this.add.particles("pixel");
    var emitter = particles.createEmitter({
      // particle speed - particles do not move
      // speed: 1000,
      speed: {
        min: -1000,
        max: 1000
      },
      // particle scale: from 1 to zero
      scale: {
        start: 1,
        end: 0
      },
      // particle alpha: from opaque to transparent
      alpha: {
        start: 1,
        end: 0
      },
      // particle frequency: one particle every 100 milliseconds
      frequency: 25,
      // particle lifespan: 1 second
      lifespan: 500
    });
    emitter.explode(20, enemy.x, enemy.y);
  },
  laserHitAsteroid: function (laser, enemy) {
    smallAsteroidGroup.killAndHide(enemy);
    laserGroup.killAndHide(laser);
    laser.body.enable = false;
    var particles = this.add.particles("pixel");
    var emitter = particles.createEmitter({
      // particle speed - particles do not move
      // speed: 1000,
      speed: {
        min: -1000,
        max: 1000
      },
      // particle scale: from 1 to zero
      scale: {
        start: 1,
        end: 0
      },
      // particle alpha: from opaque to transparent
      alpha: {
        start: 1,
        end: 0
      },
      // particle frequency: one particle every 100 milliseconds
      frequency: 25,
      // particle lifespan: 1 second
      lifespan: 500
    });
    emitter.explode(20, enemy.x, enemy.y);
  },
  createEnemy: function () {
    let bitcoinPosition = Math.floor(Math.random() * 5);
    var enemy = enemyGroup.get([50, 100, 190, 250, 300][bitcoinPosition], 0)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    enemy.body.enable = true;
    enemy.body.setVelocityY(100);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      enemy.body.setVelocityX(-20);
    } else {
      enemy.body.setVelocityX(20);
    }

    this.tieFire(enemy.x, enemy.y, 0);

  },
  createAsteroid: function (type) {
    let bitcoinPosition = Math.floor(Math.random() * 5);

    if (type == 1) {
      var enemy = smallAsteroidGroup.get([50, 100, 190, 250, 300][bitcoinPosition], 0)
        .setActive(true)
        .setVisible(true)
        .setScale(1);
      enemy.health = 100;
    }

    enemy.body.enable = true;
    //enemy.body.setVelocityY(Phaser.Math.Between(40, 70));
    enemy.setGravityY(Phaser.Math.Between(20, 40));
    enemy.body.setMaxVelocityY(50);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      enemy.body.setVelocityX(-Phaser.Math.Between(15, 25));
    } else {
      enemy.body.setVelocityX(Phaser.Math.Between(15, 25));
    }



  },
  createBonus: function () {
    if (this.bonusType == 5) {
      this.bonusType = 1;
    }
    let bonusPosition = Math.floor(Math.random() * 5);
    var bonus = bonusGroup.get([50, 100, 190, 250, 300][bonusPosition], 0)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    bonus.body.enable = true;
    bonus.type = this.bonusType;
    bonus.body.setVelocityY(100);
    this.bonusType++;
    console.log(this.bonusType);
  },

  startMove: function () {

    this.moving = true;

  },
  move: function (pointer) {
    if (this.moving) {
      var distX = pointer.x - pointer.downX;
      var distY = pointer.y - pointer.downY;
      //  console.log(distY);
      this.downX = pointer.downX;
      this.downY = pointer.downY;
      // this.ball.setPosition(this.downX, this.downY);

      if (distY > 10 || distX > 10 || distY < 10 || distX > 10) {
        this.canShoot = true;
        if (pointer.downX > pointer.x) {
          this.theBlock.body.setVelocityX(-300);
        } else {
          this.theBlock.body.setVelocityX(300);
        }
        //  this.trajectory.setPosition(pointer.downX, pointer.downY);
        // this.trajectory.visible = true;
        //  this.direction = Phaser.Math.Angle.Between(pointer.x, pointer.y, pointer.downX, pointer.downY);
        //  this.direction = Phaser.Math.Angle.Between(pointer.downX, pointer.downY, pointer.x, pointer.y);

        //  this.trajectory.angle = Phaser.Math.RadToDeg(this.direction) +90;
      }
      //  }else{
      //        this.trajectory.visible = false;
      //         }
    }
    // this.trajectory.setPosition(pointer.x, pointer.y);
    //   this.trajectory.visible = true;
    //  Dispatch a Scene event

  },
  endMove: function (pointer) {
    this.moving = false;
    this.theBlock.body.setVelocityX(0);
    /*
  if(this.canShoot){
  var angleOfFire = Phaser.Math.DegToRad(this.trajectory.angle - 90);
         var pointOfFire = new Phaser.Math.Vector2(pointer.downX, pointer.downY);
    this.ball.visible=true;
       this.ball.setPosition(this.downX, this.downY);


          this.ball.body.setVelocity(gameOptions.ballSpeed * Math.cos(angleOfFire), gameOptions.ballSpeed * Math.sin(angleOfFire));
      this.emitter.startFollow(this.ball);
     
    this.canShoot=false;
   this.shooting = true;
    this.aiming = false;
    //this.trajectory.setPosition(pointer.x, pointer.y);
    this.trajectory.visible = false;
    //  Dispatch a Scene event
  }*/
  },

  fire: function (e) {
    if (e.y < game.config.height - 75) {

      this.oneFire(this.theBlock.x - 10, this.theBlock.y, 0);
      this.oneFire(this.theBlock.x + 10, this.theBlock.y, 0);

      this.health--;
      healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);


    }
  },
  oneFire: function (xpos, ypos, angle) {
    var laser = laserGroup.get(xpos, ypos)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    laser.tint = 0x85dcff;
    laser.body.enable = true;
    laser.body.setVelocityY(-400);


  },
  tieFire: function (xpos, ypos, angle) {
    var lasert = tieLaserGroup.get(xpos, ypos)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    lasert.tint = 0xb3372e
    lasert.body.enable = true;
    lasert.body.setVelocityY(400);


  },
  makeBar: function (x, y, color) {
    //draw the bar
    let bar = this.add.graphics();

    //color the bar
    bar.fillStyle(color, 1);

    //fill the bar with a rectangle
    bar.fillRect(0, 0, 380, 15);

    //position the bar
    bar.x = x;
    bar.y = y;

    //return the bar
    return bar;
  },
  setValue: function (bar, percentage) {
    //scale the bar
    bar.scaleX = percentage / 100;
  },
  clickHandler: function (pointer, block) {


    //  Dispatch a Scene event
    this.events.emit('addScore');
  }

});
/////////////////////////////////////////////
var UIScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function UIScene() {
      Phaser.Scene.call(this, { key: 'UIScene', active: true });

      this.score = 0;
    },

  create: function () {
    //  Our Text object to display the Score
    var info = this.add.text(10, 10, 'Score: 0', { font: '24px Arial', fill: '#ffffff' });

    //  Grab a reference to the Game Scene
    var ourGame = this.scene.get('GameScene');

    //  Listen for events from it
    ourGame.events.on('addScore', function () {

      this.score += 10;

      info.setText('Score: ' + this.score);

    }, this);
  }

});
/*
var config = {
    type: Phaser.AUTO,
    width: 380,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    scene: [ GameScene, UIScene ]
};

game = new Phaser.Game(config);*/
function resize() {

  var canvas = document.querySelector("canvas");

  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = game.config.width / game.config.height;
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = (windowWidth / gameRatio) + "px";
  }
  else {
    canvas.style.width = (windowHeight * gameRatio) + "px";
    canvas.style.height = windowHeight + "px";
  }
}

