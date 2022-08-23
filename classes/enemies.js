var Enemy = new Phaser.Class({

  Extends: Phaser.GameObjects.Image,

  initialize:

    function Enemy(scene) {

      Phaser.GameObjects.Image.call(this, scene, 450, 0, 'enemy', 0);
      this.setScale(2)
      this.setAlpha(1)
      //this.spawn = spawnPoints[spawnAlt]

      this.scene = scene
      this.scene.physics.world.enableBody(this, 0);
      this.body.setImmovable(true);
      // let bitcoinPosition = Math.floor(Math.random() * 5);
      //  var enemy = enemyGroup.get([100, 250, 450, 700, 850][bitcoinPosition], 0)
      //console.log(this.spawn)
      this.nextTic = 0
      this.name = ''
      this.hp = 0
      this.reward = 0
      this.speed = 0
      this.frame = 0
      this.health = 0
      this.stunned = false
      this.spawn = 0
      this.healthbar = scene.add.text(0, 0, "22", { fontSize: '30px', fill: '#fff', fontStyle: 'bold' });
      this.healthbar.setOrigin(0, 0);
      /* this.emitter = scene.add.particles('particle').createEmitter({

        speed: { min: -800, max: 800 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        blendMode: 'SCREEN',
        //active: false,
        lifespan: 300,
        gravityY: 800
      }); */

    },
  setType: function (template, wave) {
    //template = typeof template === 'undefined' ? {} : template;

    /* var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      this[key] = template[key];
    } */
    this.nextTic = 0
    this.name = template.name
    if (this.name == 'Boss') {
      var extra = wave * (50 + (wave * 2))
    } else {
      var extra = wave * (5 + wave)
    }
    this.hp = template.hp + extra
    this.reward = template.reward
    this.speed = template.speed
    this.frame = template.frame
    this.canShoot = template.canShoot
    this.health = this.hp
    this.setFrame(this.frame)

    // if (template.cost) this.totalCost += template.cost;
  },
  launch: function () {
    let bitcoinPosition = Math.floor(Math.random() * 5);
    this.setPosition([100, 250, 450, 700, 850][bitcoinPosition], 0)
    this.body.enable = true;
    this.body.setVelocityY(this.speed);
    var side = Phaser.Math.Between(1, 2);
    if (side == 1) {
      this.body.setVelocityX(-15);
    } else {
      this.body.setVelocityX(15);
    }
  },
  remove: function () {
    this.healthbar.setText('')
    this.body.setVelocityY(0);
    this.healthbar.destroy()
    this.destroy()
    /* this.setPosition(450, -50)
    this.setActive(false);
    this.setVisible(false); */
  },
  receiveDamage: function () {

    this.health -= 20;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      yoyo: true,
      duration: 75
    })


    //this.setAlpha(.5)
    // if hp drops below 0 we deactivate this enemy
    if (this.health <= 0) {

      var emitter = this.scene.add.particles('particle_color').createEmitter({

        speed: { min: -300, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 4, end: .25 },
        alpha: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        lifespan: 400,
        frame: [0, 1, 2, 3]
      });
      emitter.explode(20, this.x, this.y);





      this.scene.scoreBuffer += this.reward
      // scene.UI.moneyText.setText(money.amount)
      this.remove()
    }
  },
  getTower: function (x, y, distance, notthisone) {
    var turretsTargets = turrets.getChildren();

    if (turretsTargets.length > 0) {
      var done = false
      while (!done) {
        var rand = Phaser.Math.Between(0, turretsTargets.length - 1)
        if (turretsTargets[rand].active) {
          done = true
          return turretsTargets[rand]
        }
      }
    }




    /*   for (var i = 0; i < turretsTargets.length; i++) {
        if (turretsTargets[i].active) { //&& Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance && enemyUnits[i] != notthisone
  
          return turretsTargets[i];
  
  
        }
      }*/
    return false;
  },
  fire: function () {
    var tower = this.getTower()
    var rand = Phaser.Math.Between(1, 10)
    if (tower && rand > 7) {

      addEnemyBullet(this.x, this.y, tower.x, tower.y)
    }
  },
  update: function (time, delta) {
    this.healthbar.setText(this.health)
    this.healthbar.x = this.x - this.healthbar.width / 2;
    this.healthbar.y = this.y - (this.height + 5);
    if (this.canShoot) {
      if (time > this.nextTic) {
        // this.fire();
        this.nextTic = time + 5500;
      }
    }
  }


});

function getEnemy(x, y, distance) {
  var enemyUnits = enemies.getChildren();
  for (var i = 0; i < enemyUnits.length; i++) {
    if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance)
      return enemyUnits[i];
  }
  return false;
}

let enemyTypes = [
  {
    name: 'Tie',
    hp: 20,
    reward: 50,
    speed: 250,
    frame: 0,
    canShoot: true
  },
  {
    name: 'Muscle',
    hp: 100,
    reward: 2,
    speed: 1000,
    frame: 1,
    canShoot: false
  },
  {
    name: 'Speedy',
    hp: 75,
    reward: 3,
    speed: 700,
    frame: 2,
    canShoot: false
  },
  {
    name: 'Strong and Fast',
    hp: 135,
    reward: 4,
    speed: 600,
    frame: 3,
    canShoot: false
  },
  {
    name: 'Speedy 2',
    hp: 170,
    reward: 4,
    speed: 400,
    frame: 4,
    canShoot: false
  },
  {
    name: 'Stronger 2',
    hp: 375,
    reward: 4,
    speed: 900,
    frame: 5,
    canShoot: false
  },
  {
    name: 'Tank',
    hp: 650,
    reward: 5,
    speed: 1100,
    frame: 6,
    canShoot: true
  },
  {
    name: 'Boss',
    hp: 250,
    reward: 10,
    speed: 1100,
    frame: 7,
    canShoot: true
  }
]

