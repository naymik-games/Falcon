let game;


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

    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);

  }
  create() {


    this.cameras.main.setBackgroundColor(0x000000);

    /* this.backgrounds = [];
    for (var i = 0; i < 5; i++) {
      var bg = new ScrollingBackground(this, "sprBg0", i * 10);
      this.backgrounds.push(bg);
    } */



    //this.tileSprite = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'sprBg0').setAlpha(.4)
    //  this.tileSprite2 = this.add.tileSprite(0, 0, game.config.width * 2, game.config.height * 2, 'back2').setAlpha(.6)


    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: 700,
      y: 1500,
      radius: 100,
      //base: baseGameObject,
      //thumb: thumbGameObject,
      dir: '4dir',
      // forceMin: 16,
      // fixed: true,
      // enable: true
    }).on('update', this.updateJoystickState, this);
    this.cursorKeys = this.joyStick.createCursorKeys();;

    this.lastTime = 0
    this.input.addPointer(9);

    enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    // enemyBullets = this.physics.add.group({ classType: EnemyBullet, runChildUpdate: true });

    this.anims.create({
      key: "sprExplosion",
      frames: this.anims.generateFrameNumbers("sprExplosion"),
      frameRate: 20,
      repeat: 0
    });

    this.hyperspace = false;

    this.bonusType = 1;
    this.immuneCount = 0;
    this.moving = false;

    this.score = 0
    this.scoreBuffer = 0

    this.tieSpeed = 400
    this.bgSpeed = 0
    this.bgSpeedArray = [[3, 4.5], [5, 6.5]]
    this.shield = this.physics.add.image(-100, - 100, "shield").setScale(1).setAlpha(.4);
    this.shield.body.setImmovable(true);

    //falcon = this.physics.add.image(game.config.width / 2, game.config.height - 100, "block").setScale(1.5);
    falcon = new Falcon(this, game.config.width / 2, game.config.height - 200);
    this.add.existing(falcon);


    // falcon.displaWidth=50;
    // falcon.displaHeight=50;

    this.makeUI()



    //  this.input.on('pointermove', this.move, this);
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
    //   this.emitter.startFollow(falcon);

    //  this.input.on('pointerup', this.fire, this);
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

    /*  this.time.addEvent({
       delay: 10000,
       loop: true,
       callback: () => {
         this.createBonus();
       }
     }); */

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
    // this.startWave()
  }
  update() {
    this.updateJoystickState();
    if (gameMode == PLAY) {
      this.physics.add.collider(bullets, enemies, this.laserHitEnemy, null, this);
      this.physics.add.collider(falcon, enemies, this.hitByTie, null, this);
      // this.physics.add.collider(falcon, tieLaserGroup, falcon.hitByTieLaser, null, this);
      // this.physics.add.collider(falcon, bonusGroup, falcon.hitByBonus, null, this);
      // this.physics.add.collider(smallAsteroidGroup, smallAsteroidGroup, this.hitByBonus, null, this);
      // this.physics.add.collider(smallAsteroidGroup, this.shield);

      // this.physics.add.collider(this.shield, tieLaserGroup, this.shieldHitByTieLaser, null, this);
      // this.physics.add.overlap(laserGroup, smallAsteroidGroup, this.laserHitAsteroid, null, this);
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
    //this.tileSprite.tilePositionY -= this.bgSpeedArray[this.bgSpeed][0];
    //  this.tileSprite2.tilePositionY -= this.bgSpeedArray[this.bgSpeed][1];

    if (this.hyperspace) {
      if (falcon.x < 0) {
        falcon.setPosition(game.config.width, falcon.y);
      }
      if (falcon.x > game.config.width) {
        falcon.setPosition(0, falcon.y);
      }
    } else {


    }

    if (this.hasShield) {
      this.shield.setPosition(falcon.x, falcon.y);

    }
    if (this.health <= 0) {
      this.scene.start('playGame');
    }
    var enemyUnits = enemies.getChildren();
    for (var i = 0; i < enemyUnits.length; i++) {
      if (enemyUnits[i].active && enemyUnits[i].y > game.config.height) {
        enemyUnits[i].remove()
      }
    }
    /*  enemies.getChildren().forEach(enemy => {
       if (enemy.active && enemy.y > game.config.height) {
         // enemy.healthBar.setText('')
         //  enemies.killAndHide(enemy);
         tieLaserGroup
 
       }
     }); */

    /*  laserGroup.getChildren().forEach(laser => {
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
     });*/
  }


  updateJoystickState() {
    let direction = '';
    for (let key in this.cursorKeys) {
      if (this.cursorKeys[key].isDown) {
        direction += key;
      }
    }

    // If no direction if provided then stop 
    // the player animations and exit the method
    if (direction.length === 0) {
      //  this.stopPlayerAnimations();
      return;
    }

    // If last cursor direction is different
    //  the stop all player animations
    if (this.lastCursorDirection !== direction) {
      //this.stopPlayerAnimations();
    }

    // Set the new cursor direction
    this.lastCursorDirection = direction;
    // console.log(this.lastCursorDirection)
    // Handle the player moving
    this.movePlayer();

    // Set debug info about the cursor
    //this.setCursorDebugInfo();
  }


  incrementScore() {
    this.score += 1
    this.scoreText.setText(this.score)
    this.scoreBuffer -= 1
  }


  startWave() {
    // console.log(Date.now())


    var timer = this.time.addEvent({
      // delay: this.level.waves[this.onWave].spawnRate,                // ms
      delay: 2000,
      callback: function () {
        var enemy = enemies.get();
        if (enemy) {
          enemy.setType(enemyTypes[0], 0)

          enemy.setActive(true);
          enemy.setVisible(true);
          enemy.launch(this);

        }
        this.launchNum++
      },
      //args: [],
      callbackScope: this,
      repeat: 10
      // repeat: this.level.waves[this.onWave].waveEnemies.length - 1
    });
  }

  hitByTie(player, tie) {
    if (!player.isImmune) {
      player.hitByTie()
    }
    tie.remove()
  }
  laserHitEnemy(bullet, enemy) {
    console.log(enemy)
    enemy.receiveDamage(10, this)
    bullet.remove()
  }
  startMove() {
    let clickDelay = this.time.now - this.lastTime;
    this.lastTime = this.time.now;
    if (clickDelay < 350) {
      falcon.fire()
      console.log("We're double clicked!");
    }
    this.moving = true;
    this.shooting = true
  }



  movePlayer() {
    if (this.lastCursorDirection === "up") {
      //this.player.y -= this.playerSpeed;
      falcon.moveUp()
    } else if (this.lastCursorDirection === "down") {
      //this.player.y += this.playerSpeed;
      falcon.moveDown()

    } else if (this.lastCursorDirection === "right") {
      //this.player.x += this.playerSpeed;
      falcon.moveRight()

    } else if (this.lastCursorDirection === "left") {
      //this.player.x -= this.playerSpeed;
      falcon.moveLeft()

    } else if (this.lastCursorDirection === "upright") {
      // this.player.x += this.playerSpeed;
      // this.player.y -= this.playerSpeed;
      falcon.moveUp()
      falcon.moveRight()
    } else if (this.lastCursorDirection === "downright") {
      // this.player.x += this.playerSpeed;
      // this.player.y += this.playerSpeed;
      falcon.moveDown()
      falcon.moveRight()
    } else if (this.lastCursorDirection === "downleft") {
      // this.player.x -= this.playerSpeed;
      //  this.player.y += this.playerSpeed;
      falcon.moveDown()
      falcon.moveLeft()
    } else if (this.lastCursorDirection === "upleft") {
      //  this.player.x -= this.playerSpeed;
      // this.player.y -= this.playerSpeed;
      falcon.moveUp()
      falcon.moveLeft()
    } else {
      //  this.player.x = 0;
      //  this.player.y = 0;
    }
  }


  move(pointer) {
    if (this.moving) {
      var distX = pointer.x - pointer.downX;
      var distY = pointer.y - pointer.downY;
      //  console.log(distY);
      this.downX = pointer.downX;
      this.downY = pointer.downY;
      // this.ball.setPosition(this.downX, this.downY);

      if (distY > 20 || distX > 20 || distY < 20 || distX > 20) {
        this.canShoot = true;

        if (pointer.downX > pointer.x) {
          falcon.moveLeft()

        } else {

          falcon.moveRight()
        }

      } else {
        this.moving = false


      }

    }


  }
  endMove(pointer) {
    if (this.moving) {
      this.moving = false;
      falcon.stop();
    }


  }
  fire() {
    falcon.fire()
  }

  //////////////////////////////////////////////////////
  //top
  makeUI() {
    this.healthText = this.add.bitmapText(550 - 25, 25, "font", falcon.health, 100).setOrigin(1, 0).setTint(0x00ff33);

    this.scoreText = this.add.bitmapText(75, 25, "font", this.score, 100).setOrigin(0).setTint(0x00ff33);

    this.healthBarback = this.makeBar(550, 40, 0x282828);
    this.healthBar = this.makeBar(550, 40, 0x2ecc71);
    this.setValue(this.healthBar, falcon.health, falcon.healthMax);

    this.sheildBarback = this.makeBar(550, 75, 0x282828);
    this.sheildBar = this.makeBar(550, 75, 0xfafafa);
    this.sheildBarback.setAlpha(0)
    this.sheildBar.setAlpha(0)
    this.setValue(this.sheildBar, falcon.sheildStrength, falcon.sheildStrengthMax);
    this.fireButton = this.add.image(50, 1590, 'bar').setScale(2).setInteractive()
    this.fireButton.on('pointerdown', this.fire, this)
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
