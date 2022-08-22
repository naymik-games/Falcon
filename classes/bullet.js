var Bullet = new Phaser.Class({

  Extends: Phaser.GameObjects.Image,

  initialize:

    function Bullet(scene) {
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'laser');
      this.setDepth(2)
      // 
      this.tint = 0x85dcff;
      this.incX = 0;
      this.incY = 0;
      this.lifespan = 0;
      this.power = 0
      this.speed = Phaser.Math.GetSpeed(0, 1);
      this.type = 'projectile'
      this.scene = scene
    },

  fire: function (x, y, angle, power, speed, range) {
    this.setActive(true);
    this.setVisible(true);


    this.range = range


    //addBullet(this.x, this.y, angle, this.power, this.bulletSpeed, this.type);
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y);
    this.speed = Phaser.Math.GetSpeed(speed, 1);

    //console.log(this.speed)
    this.power = power
    //  we don't need to rotate the bullets as they are round
    //    this.setRotation(angle);

    //this.dx = Math.cos(angle);
    //this.dy = Math.sin(angle);

    this.lifespan = 1000 //* this.speed;
    /* console.log(this.x)
    console.log(this.y)
    console.log(this.towerI)
    console.log(this.towerJ)
    console.log(this.range) */
  },

  update: function (time, delta) {
    this.lifespan -= this.speed * delta;

    // this.x += this.dx * (this.speed * delta);
    //this.y += this.dy * (this.speed * delta);
    // this.x += this.dx * (this.speed * delta);
    this.y -= (this.speed * delta);

    /*  if (this.lifespan < 0) {
       this.setActive(false);
       this.setVisible(false);
     } */
    if (Phaser.Math.Distance.Between(this.x, this.y, falcon.x, falcon.y) > this.range) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

});
function addBullet(x, y, angle, power, speed, range) {
  var bullet = bullets.get();
  if (bullet) {
    // console.log(type)
    bullet.fire(x, y, angle, power, speed, range);
  }
}