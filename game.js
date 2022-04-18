let game;

var enemyGroup, laserGroup, smallAsteroidGroup, tieLaserGroup, bonusGroup

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
      default: "arcade"
    },
    scene: [preloadGame, startGame, playGame, UI]
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
    this.tileSprite = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'back').setAlpha(.6)
    this.tileSprite2 = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'back2').setAlpha(.8)

    //this.tileSprite.autoScroll(0, 100)
    this.input.addPointer(9);
    this.hyperspace = false;
    this.hasShield = false;
    this.isImmune = false;
    this.bonusType = 1;
    this.immuneCount = 0;
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

    this.shield = this.physics.add.image(-100, - 100, "shield").setScale(1).setAlpha(.4);
    this.shield.body.setImmovable(true);

    this.falcon = this.physics.add.image(game.config.width / 2, game.config.height - 100, "block").setScale(1.5);
    this.falcon.body.setImmovable(true);
    this.falcon.body.collideWorldBounds = true;
    this.health = 100;
    // this.falcon.displaWidth=50;
    // this.falcon.displaHeight=50;

    this.healthText = this.add.bitmapText(game.config.width / 2, 25, "font", "ccc", 80);
    this.healthText.setText(this.health);

    this.moving = false;
    //  Make them all input enabled



    /*  this.bar = this.physics.add.image(game.config.width / 2, game.config.height - 5, "bar").setAlpha(.5);
     this.bar.setInteractive();
     this.bar.displayWidth = 380;
     this.bar.displayHeight = 100; */

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
    //   this.emitter.startFollow(this.falcon);

    this.input.on('pointerup', this.fire, this);
    this.varytimer = Math.floor(Math.random() * 3);

    this.time.addEvent({
      delay: 1700,
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
    this.physics.add.collider(this.falcon, enemyGroup, this.hitByTie, null, this);
    this.physics.add.collider(this.falcon, tieLaserGroup, this.hitByTieLaser, null, this);
    this.physics.add.collider(this.falcon, bonusGroup, this.hitByBonus, null, this);
    this.physics.add.collider(smallAsteroidGroup, smallAsteroidGroup, this.hitByBonus, null, this);
    this.physics.add.collider(smallAsteroidGroup, this.shield);

    this.physics.add.collider(this.shield, tieLaserGroup, this.shieldHitByTieLaser, null, this);
    this.physics.add.overlap(laserGroup, smallAsteroidGroup, this.laserHitAsteroid, null, this);

    /* this.input.on("pointerdown", this.gemSelect, this);
     this.input.on("pointermove", this.drawPath, this);
     this.input.on("pointerup", this.removeGems, this);
    */
    //this.check = this.add.image(725, 1000, 'check').setScale(.7);
  }
  update() {
    this.tileSprite.tilePositionY -= 5;
    this.tileSprite2.tilePositionY -= 6.5;
    if (this.isImmune) {
      this.immuneCount++
      if (this.immuneCount == 100) {
        this.isImmune = false;
        this.falcon.setAlpha(1);
        this.immuneCount = 0;
      }
    }
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
  hitByTie(falcon, tie) {
    if (!this.isImmune) {
      this.health -= 20;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }
    enemyGroup.killAndHide(tie);
    this.destroyEnemy(tie);

  }
  hitByBonus(falcon, bonus) {
    if (bonus.type == 1) {
      this.health = 100;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.hasShield = true;
    } else if (bonus.type == 2) {
      this.hyperspace = true;
      falcon.body.collideWorldBounds = false;
      this.health = 100;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      //this.bar.tint = 0xffbbee;
    }

    this.cameras.main.shake(100, 0.01);

    bonusGroup.killAndHide(bonus);
    this.destroyEnemy(bonus);

  }
  hitByTieLaser(falcon, tiel) {
    if (!this.isImmune) {
      this.health -= 10;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.isImmune = true;
      falcon.setAlpha(.3);
      this.cameras.main.shake(400, 0.01);
    }
    tieLaserGroup.killAndHide(tiel);
    this.destroyEnemy(tiel);

  }
  shieldHitByTieLaser(shield, tiel) {

    this.cameras.main.shake(400, 0.01);
    tieLaserGroup.killAndHide(tiel);
    this.destroyEnemy(tiel);

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
    enemy.body.setVelocityY(400);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      enemy.body.setVelocityX(-20);
    } else {
      enemy.body.setVelocityX(20);
    }

    this.tieFire(enemy.x, enemy.y, 0);

  }
  createAsteroid(type) {
    let bitcoinPosition = Math.floor(Math.random() * 5);

    if (type == 1) {
      var enemy = smallAsteroidGroup.get([100, 250, 450, 700, 850][bitcoinPosition], 0)
        .setActive(true)
        .setVisible(true)
        .setScale(Phaser.Math.Between(2, 5));
      enemy.health = 100;
    }

    enemy.body.enable = true;
    //enemy.body.setVelocityY(Phaser.Math.Between(40, 70));
    enemy.setGravityY(Phaser.Math.Between(30, 100));
    enemy.body.setMaxVelocityY(100);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      enemy.body.setVelocityX(-Phaser.Math.Between(15, 25));
    } else {
      enemy.body.setVelocityX(Phaser.Math.Between(15, 25));
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
    bonus.type = this.bonusType;
    bonus.body.setVelocityY(100);
    this.bonusType++;
    console.log(this.bonusType);
  }

  startMove() {

    this.moving = true;

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
          this.falcon.body.setVelocityX(-400);
        } else {
          this.falcon.body.setVelocityX(400);
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

  }
  endMove(pointer) {
    this.moving = false;
    this.falcon.body.setVelocityX(0);
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
    laser.body.setVelocityY(-600);


  }
  tieFire(xpos, ypos, angle) {
    var lasert = tieLaserGroup.get(xpos, ypos)
      .setActive(true)
      .setVisible(true)
      .setScale(1);
    lasert.tint = 0xb3372e
    lasert.body.enable = true;
    lasert.body.setVelocityY(800);


  }
  makeBar(x, y, color) {
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
  }
  setValue(bar, percentage) {
    //scale the bar
    bar.scaleX = percentage / 100;
  }
  clickHandler(pointer, block) {


    //  Dispatch a Scene event
    this.events.emit('addScore');
  }
  addScore() {
    this.events.emit('score');
  }
}
