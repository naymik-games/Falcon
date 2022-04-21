class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key, type) {
    super(scene, x, y, key);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);
    this.setData("type", type);
    this.setData("isDead", false);
  }
}

class Player extends Entity {
  constructor(scene, x, y, key) {
    super(scene, x, y, key, "Player");

    this.setScale(1.5)
    this.body.setImmovable(true);
    this.body.collideWorldBounds = true;
    this.setData("speed", 400);

    this.setData("isShooting", false);
    //this.setData("timerShootDelay", 10);
    // this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
  }
  //this.falcon.body.setVelocityX(-400);this.falcon.body.setVelocityX(400);
  moveLeft() {
    this.body.velocity.x = -this.getData("speed");
  }
  moveRight() {
    this.body.velocity.x = this.getData("speed");
  }
  stop() {
    this.body.velocity.x = 0
  }
  /*  moveUp() {
     this.body.velocity.y = -this.getData("speed");
   }
   moveDown() {
     this.body.velocity.y = this.getData("speed");
   }
  
 
   onDestroy() {
     this.scene.time.addEvent({ // go to game over scene
       delay: 1000,
       callback: function() {
         this.scene.scene.start("SceneGameOver");
       },
       callbackScope: this,
       loop: false
     });
   } */

  update() {

  }

}

class ScrollingBackground {
  constructor(scene, key, velocityY) {
    this.scene = scene;
    this.key = key;
    this.velocityY = velocityY;

    this.layers = this.scene.add.group();

    this.createLayers();
  }

  createLayers() {
    for (var i = 0; i < 2; i++) {
      // creating two backgrounds will allow a continuous flow giving the illusion that they are moving.
      var layer = this.scene.add.sprite(0, 0, this.key);
      //layer.displayWidth = 900;
      // layer.displayHeight = 1640;
      layer.y = (layer.displayHeight * i);
      var flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
      var flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
      layer.setScale(flipX * 2, flipY * 2);
      layer.setDepth(-5 - (i - 1));
      this.scene.physics.world.enableBody(layer, 0);
      layer.body.velocity.y = this.velocityY;

      this.layers.add(layer);
    }
  }

  update() {
    if (this.layers.getChildren()[0].y > 0) {
      for (var i = 0; i < this.layers.getChildren().length; i++) {
        var layer = this.layers.getChildren()[i];
        layer.y = (-layer.displayHeight) + (layer.displayHeight * i);
      }
    }
  }
}