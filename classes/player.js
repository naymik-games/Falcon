
class Falcon extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y) {
    super(scene, x, y);
    this.setTexture('block');
    this.setPosition(x, y);

    this.scene = scene;
    this.scene.physics.world.enableBody(this, 0);

    this.setScale(1.5)
    this.body.setSize(50, 114, true)
    this.body.setImmovable(true);
    this.speed = 400
    this.sheildStrengthMax = 100
    this.sheildStrength = 100
    this.hasHyperspace = true
    this.isImmune = false;
    this.healthMax = 100
    this.health = 100;
    this.deltaX = 5;
    this.deltaY = 5;
    this.lasers = new Array();
    this.lastShot = new Date().getTime();
    this.shotFrequency = 300;//higher is less frequent
  }

  moveLeft() {
    if (this.x > 0) {
      // this.x -= this.deltaX;
      this.body.velocity.x = -this.speed;
    }
  }

  moveRight() {
    if (this.x < game.config.width) {
      //this.x += this.deltaX;
      this.body.velocity.x = this.speed;
    }
  }

  moveUp() {
    if (this.y > 0) {
      // this.y -= this.deltaY;
      this.body.velocity.y = -this.speed;
    }
  }
  stop() {
    this.body.velocity.x = 0
    this.body.velocity.y = 0
  }
  moveDown() {

    if (this.y < game.config.height) {
      //this.y += this.deltaY;
      this.body.velocity.y = + this.speed;
    }
  }

  fire() {
    var currentTime = new Date().getTime();
    if (currentTime - this.lastShot > this.shotFrequency) {
      var shipLaser = new ShipLaser(this.scene, this.x, this.y);
      this.scene.add.existing(shipLaser);
      this.lasers.push(shipLaser);
      this.lastShot = currentTime;
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    var i = 0;
    var j = 0;
    var lasersToRemove = new Array();

    for (i = 0; i < this.lasers.length; i++) {
      this.lasers[i].update();

      if (this.lasers[i].y <= 0) {
        lasersToRemove.push(this.lasers[i]);
      }
    }

    for (j = 0; j < lasersToRemove.length; j++) {
      var laserIndex = this.lasers.indexOf(lasersToRemove[j]);
      this.lasers.splice(laserIndex, 1);
      lasersToRemove[j].destroy();
    }

    if (this.hasHyperspace) {
      this.body.collideWorldBounds = false;
      if (this.x < 0) {
        this.setPosition(game.config.width, this.y);
      }
      if (this.x > game.config.width) {
        this.setPosition(0, this.y);
      }
      if (this.y < 0) {
        this.setPosition(this.x, game.config.height);
      }
      if (this.y > game.config.height) {
        this.setPosition(this.x, 0);
      }
    } else {
      this.body.collideWorldBounds = true;
    }
    if (this.isImmune) {
      if (time > this.nextTic) {
        this.isImmune = false;
        this.setAlpha(1);

      }
    }
  }
  hitByTie() {

    if (this.hasShield) {
      this.health -= 5;
      this.sheildStrength -= 10
      this.scene.setValue(this.scene.sheildBar, this.sheildStrength, this.sheildStrengthMax)
      if (this.sheildStrength <= 0) {
        this.dropShield()
      }
    } else {
      this.health -= 20;
      falcon.scene.time.addEvent({
        delay: 4000,                // ms
        callback: function () {
          this.isImmune = false
          falcon.setAlpha(1);
        },
        //args: [],
        callbackScope: this,
        loop: false
      });
    }
    this.scene.healthText.setText(this.health);
    this.scene.setValue(this.scene.healthBar, this.health, this.healthMax);
    this.isImmune = true;
    falcon.setAlpha(.3);
    this.scene.cameras.main.shake(400, 0.01);



  }
}


class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);
    //  this.setData("type", type);
    this.setData("isDead", false);
    this.setScale(1.5)
    this.body.setImmovable(true);
    this.body.collideWorldBounds = true;
    this.body.setSize(50, 114, true)
    this.hasShield = false;
    this.sheildStrengthMax = 100
    this.sheildStrength = 100
    this.isImmune = false;
    this.healthMax = 100
    this.health = 100;
    this.speed = 400
    this.bulletPower = 10
    this.bulletType = 'laser'
    this.nextTic = 0;
    this.setData("isShooting", false);
    //this.setData("timerShootDelay", 10);
    // this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
  }
  update(time, delta) {
    if (this.isImmune) {
      if (time > this.nextTic) {
        this.isImmune = false;
        this.setAlpha(1);

      }
    }
  }
  //this.falcon.body.setVelocityX(-400);this.falcon.body.setVelocityX(400);
  moveLeft() {
    this.body.velocity.x = -this.speed;
  }
  moveRight() {
    this.body.velocity.x = this.speed;
  }
  moveUp() {
    this.body.velocity.y = -this.speed;
  }
  moveDown() {
    this.body.velocity.y = + this.speed;
  }
  moveRight() {
    this.body.velocity.x = this.speed;
  }
  stop() {
    this.body.velocity.x = 0
    this.body.velocity.y = 0
  }
  fire() {
    addBullet(this.x + 10, this.y, -90, 10, 1000, 750)
    addBullet(this.x - 10, this.y, -90, 10, 1000, 750)
  }
  hitByBonus(falcon, bonus) {

    if (bonus.type == 1) {
      this.health = 100;
      this.healthText.setText(this.health);
      this.setValue(this.healthBar, this.health);
      this.hasShield = true;
      this.sheildStrength = 100;
      this.sheildBarback.setAlpha(1)
      this.sheildBar.setAlpha(1)
    } else if (bonus.type == 2) {
      this.scene.hyperspace = true;
      falcon.body.collideWorldBounds = false;
      this.scene.health = 100;
      this.scene.healthText.setText(this.scene.health);
      this.scene.setValue(this.scene.healthBar, this.scene.health);
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
  hitByTie() {

    if (this.hasShield) {
      this.health -= 5;
      this.sheildStrength -= 10
      this.scene.setValue(this.scene.sheildBar, this.sheildStrength, this.sheildStrengthMax)
      if (this.sheildStrength <= 0) {
        this.dropShield()
      }
    } else {
      this.health -= 20;
      falcon.scene.time.addEvent({
        delay: 4000,                // ms
        callback: function () {
          this.isImmune = false
          falcon.setAlpha(1);
        },
        //args: [],
        callbackScope: this,
        loop: false
      });
    }
    this.scene.healthText.setText(this.health);
    this.scene.setValue(this.scene.healthBar, this.health, this.healthMax);
    this.isImmune = true;
    falcon.setAlpha(.3);
    this.scene.cameras.main.shake(400, 0.01);



  }
}

