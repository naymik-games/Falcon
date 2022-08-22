


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
  stop() {
    this.body.velocity.x = 0
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

