let game;

var enemyGroup, laserGroup, smallAsteroidGroup, tieLaserGroup, bonusGroup
const PLAY = 0
const REST = 1
let gameMode = REST
window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      // width: 340,
      // height: 680
      width: 900,
      height: 1640
    },
    physics: {
      debug: true,
      default: "arcade"
    },
    scene: [preloadGame, startGame, playGame, UI],


  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////
class playGame extends Phaser.Scene {
  constructor() {
    super("playGame");
  }
  preload() {


  }
  create() {


    this.cameras.main.setBackgroundColor(0x000000);

    /* this.backgrounds = [];
    for (var i = 0; i < 5; i++) {
      var bg = new ScrollingBackground(this, "sprBg0", i * 10);
      this.backgrounds.push(bg);
    } */



    this.tileSprite = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'sprBg0').setAlpha(.6)
    this.tileSprite2 = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'back2').setAlpha(.8)

    this.input.addPointer(9);

    enemyGroup = this.physics.add.group({
      defaultKey: "enemy",
      maxSize: 15,
      visible: false,
      active: false
    });

    laserGroup = this.physics.add.group({
      defaultKey: "laser",
      maxSize: 16,
      visible: false,
      active: false
    });

    tieLaserGroup = this.physics.add.group({
      defaultKey: "laser",
      maxSize: 16,
      visible: false,
      active: false
    });

    bonusGroup = this.physics.add.group({
      defaultKey: "bonus",
      maxSize: 5,
      visible: false,
      active: false
    });

    smallAsteroidGroup = this.physics.add.group({
      defaultKey: "asteroid_small",
      maxSize: 20,
      visible: false,
      active: false
    });

    this.anims.create({
      key: "sprExplosion",
      frames: this.anims.generateFrameNumbers("sprExplosion"),
      frameRate: 20,
      repeat: 0
    });

    this.hyperspace = false;
    this.hasShield = false;
    this.sheildStrengthMax = 100
    this.sheildStrength = 100
    this.isImmune = false;
    this.bonusType = 1;
    this.immuneCount = 0;
    this.moving = false;
    this.healthMax = 100
    this.health = 100;
    this.score = 0
    this.scoreBuffer = 0
    this.falconSpeed = 400
    this.tieSpeed = 400
    this.bgSpeed = 0
    this.bgSpeedArray = [[3, 4.5], [5, 6.5]]
    this.shield = this.physics.add.image(-100, - 100, "shield").setScale(1).setAlpha(.4);
    this.shield.body.setImmovable(true);

    //this.falcon = this.physics.add.image(game.config.width / 2, game.config.height - 100, "block").setScale(1.5);
    this.falcon = new Player(
      this,
      game.config.width / 2,
      game.config.height - 200,
      "block"
    );


    // this.falcon.displaWidth=50;
    // this.falcon.displaHeight=50;

    this.makeUI()



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
    //   this.emitter.startFollow(this.falcon);

    this.input.on('pointerup', this.fire, this);
    this.varytimer = Math.floor(Math.random() * 3);
    this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: () => {
        gameMode = PLAY
      }
    });
    /* this.time.addEvent({
      delay: 1700,
      loop: true,
      callback: () => {
        this.createEnemy();
      }
    }); */

    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.createBonus();
      }
    });

    /* this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        this.createAsteroid(1);
      }
    }); */
    // this.input.on('pointerdown', this.clickHandler, this);


    /* this.input.on("pointerdown", this.gemSelect, this);
     this.input.on("pointermove", this.drawPath, this);
     this.input.on("pointerup", this.removeGems, this);
    */
    //this.check = this.add.image(725, 1000, 'check').setScale(.7);
  }
  update() {

    if (gameMode == PLAY) {
      this.physics.add.collider(laserGroup, enemyGroup, this.laserHitEnemy, null, this);
      this.physics.add.collider(this.falcon, enemyGroup, this.falcon.hitByTie, null, this);
      this.physics.add.collider(this.falcon, tieLaserGroup, this.falcon.hitByTieLaser, null, this);
      this.physics.add.collider(this.falcon, bonusGroup, this.falcon.hitByBonus, null, this);
      this.physics.add.collider(smallAsteroidGroup, smallAsteroidGroup, this.hitByBonus, null, this);
      this.physics.add.collider(smallAsteroidGroup, this.shield);

      this.physics.add.collider(this.shield, tieLaserGroup, this.shieldHitByTieLaser, null, this);
      this.physics.add.overlap(laserGroup, smallAsteroidGroup, this.laserHitAsteroid, null, this);
    }



    if (this.scoreBuffer > 0) {
      this.incrementScore()
    }
    /*  for (var i = 0; i < this.backgrounds.length; i++) {
       this.backgrounds[i].update();
     } */
    if (this.score > 2000) {
      this.falconSpeed = 600
      this.tieSpeed = 600
      this.bgSpeed = 1
    }
    this.tileSprite.tilePositionY -= this.bgSpeedArray[this.bgSpeed][0];
    this.tileSprite2.tilePositionY -= this.bgSpeedArray[this.bgSpeed][1];

    if (this.hyperspace) {
      if (this.falcon.x < 0) {
        this.falcon.setPosition(game.config.width, this.falcon.y);
      }
      if (this.falcon.x > game.config.width) {
        this.falcon.setPosition(0, this.falcon.y);
      }
    } else {


    }

    if (this.hasShield) {
      this.shield.setPosition(this.falcon.x, this.falcon.y);

    }
    if (this.health <= 0) {
      this.scene.start('playGame');
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
      if (laser.active && laser.y > game.config.height) {
        tieLaserGroup.killAndHide(laser);
      }
    });

    bonusGroup.getChildren().forEach(bonus => {
      if (bonus.active && bonus.y > game.config.height) {
        bonusGroup.killAndHide(bonus);
      }
    });

    smallAsteroidGroup.getChildren().forEach(ast => {
      if (ast.active && ast.y > game.config.height) {
        smallAsteroidGroup.killAndHide(ast);
      }
    });
  }
  incrementScore() {
    this.score += 1
    this.scoreText.setText(this.score)
    this.scoreBuffer -= 1
  }



  shieldHitByTieLaser(shield, tiel) {

    this.cameras.main.shake(400, 0.01);
    tieLaserGroup.killAndHide(tiel);
    this.sheildStrength -= 10
    this.setValue(this.sheildBar, this.sheildStrength, this.sheildStrengthMax)
    if (this.sheildStrength <= 0) {
      this.dropShield()
    }
    this.destroyEnemy(tiel);

  }
  dropShield() {
    this.hasShield = false;
    this.sheildBarback.setAlpha(0)
    this.sheildBar.setAlpha(0)
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
  destroyEnemy(enemy) {
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


  }
  falconHit(falcon, enemy) {
    if (!this.isImmune) {
      this.health -= 10;
      this.healthText.setText(this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }





  }
  laserHitEnemy(laser, enemy) {
    /*  enemy.setTexture("sprExplosion");  // this refers to the same animation key we used when we added this.anims.create previously
     enemy.play("sprExplosion");
     enemy.body.setVelocity(0, 0);
     enemy.on('animationcomplete', function () {
       
 
     }, this); */
    enemyGroup.killAndHide(enemy);
    laserGroup.killAndHide(laser);
    laser.body.enable = false;
    this.scoreBuffer += 50
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
  }
  laserHitAsteroid(laser, enemy) {
    console.log(enemy.health)
    laserGroup.killAndHide(laser);
    laser.body.enable = false;
    if (enemy.health > 0) {
      enemy.health -= 35;
    } else {
      smallAsteroidGroup.killAndHide(enemy);

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
    }
  }
  createEnemy() {
    let bitcoinPosition = Math.floor(Math.random() * 5);
    var enemy = enemyGroup.get([100, 250, 450, 700, 850][bitcoinPosition], 0)
      .setActive(true)
      .setVisible(true)
      .setScale(2);
    enemy.body.enable = true;
    enemy.body.setVelocityY(this.tieSpeed);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      enemy.body.setVelocityX(-20);
    } else {
      enemy.body.setVelocityX(20);
    }

    this.tieFire(enemy.x, enemy.y, 0);

  }
  createAsteroid(type) {
    let bitcoinPositionx = Math.floor(Math.random() * 5);
    let bitcoinPositiony = Math.floor(Math.random() * 5);

    if (type == 1) {
      var enemy = smallAsteroidGroup.get([100, 250, 450, 700, 850][bitcoinPositionx], 0)
        .setActive(true)
        .setVisible(true)
        .setScale(Phaser.Math.Between(2, 5));
      enemy.health = 100;
      enemy.body.enable = true;
      //enemy.body.setVelocityY(Phaser.Math.Between(40, 70));
      enemy.body.setVelocityY(Phaser.Math.Between(100, 250));
      var side = Phaser.Math.Between(1, 2);
      if (side == 1) {
        enemy.body.setVelocityX(-Phaser.Math.Between(15, 25));
      } else {
        enemy.body.setVelocityX(Phaser.Math.Between(15, 25));
      }
    } else if (type == 2) {

    }





  }
  createBonus() {
    if (this.bonusType == 5) {
      this.bonusType = 1;
    }
    let bonusPosition = Math.floor(Math.random() * 5);
    var bonus = bonusGroup.get([100, 250, 450, 700, 850][bonusPosition], 0)
      .setActive(true)
      .setVisible(true)
      .setScale(2);
    bonus.body.enable = true;
    bonus.type = 1;
    bonus.body.setVelocityY(200);
    //this.bonusType++;
    console.log(this.bonusType);
  }

  startMove() {

    this.moving = true;
    this.shooting = true
  }
  move(pointer) {
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
          this.falcon.moveLeft()

        } else {

          this.falcon.moveRight()
        }

      } else {
        this.moving = false


      }

    }


  }
  endMove(pointer) {
    if (this.moving) {
      this.moving = false;
      this.falcon.stop();
    }


  }

  fire(e) {
    if (e.y < game.config.height - 75) {

      this.oneFire(this.falcon.x - 10, this.falcon.y, 0);
      this.oneFire(this.falcon.x + 10, this.falcon.y, 0);

      this.health--;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);


    }
  }
  oneFire(xpos, ypos, angle) {
    var laser = laserGroup.get(xpos, ypos)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    laser.tint = 0x85dcff;
    laser.body.enable = true;
    laser.body.setVelocityY(-900);


  }
  tieFire(xpos, ypos, angle) {
    var lasert = tieLaserGroup.get(xpos, ypos)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    lasert.tint = 0xb3372e
    lasert.body.enable = true;
    lasert.body.setVelocityY(900);


  }

  //////////////////////////////////////////////////////
  //top
  makeUI() {
    this.healthText = this.add.bitmapText(550 - 25, 25, "font", this.health, 100).setOrigin(1, 0).setTint(0x00ff33);

    this.scoreText = this.add.bitmapText(75, 25, "font", this.score, 100).setOrigin(0).setTint(0x00ff33);

    this.healthBarback = this.makeBar(550, 40, 0x282828);
    this.healthBar = this.makeBar(550, 40, 0x2ecc71);
    this.setValue(this.healthBar, this.health, this.healthMax);

    this.sheildBarback = this.makeBar(550, 75, 0x282828);
    this.sheildBar = this.makeBar(550, 75, 0xfafafa);
    this.sheildBarback.setAlpha(0)
    this.sheildBar.setAlpha(0)
    this.setValue(this.sheildBar, this.sheildStrength, this.sheildStrengthMax);
  }


  makeBar(x, y, color) {
    //draw the bar
    let bar = this.add.graphics();

    //color the bar
    bar.fillStyle(color, 1);

    //fill the bar with a rectangle
    bar.fillRect(0, 0, 380, 25);

    //position the bar
    bar.x = x;
    bar.y = y;

    //return the bar
    return bar;
  }
  setValue(bar, percentage, max) {
    //scale the bar
    bar.scaleX = percentage / max;
  }
  clickHandler(pointer, block) {


    //  Dispatch a Scene event
    this.events.emit('addScore');
  }
  addScore() {
    this.events.emit('score');
  }
}
