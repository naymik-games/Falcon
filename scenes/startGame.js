class startGame extends Phaser.Scene {
  constructor() {
    super("startGame");
  }
  preload() {
    //this.load.bitmapFont('atari', 'assets/fonts/atari-smooth.png', 'assets/fonts/atari-smooth.xml');
    // this.load.bitmapFont('atari', 'assets/fonts/Lato_0.png', 'assets/fonts/lato.xml');

  }
  create() {
    /*
      gameSettings = JSON.parse(localStorage.getItem('SDsave'));
      if (gameSettings === null || gameSettings.length <= 0) {
        localStorage.setItem('SDsave', JSON.stringify(defaultValues));
        gameSettings = defaultValues;
      }
    */
    this.cameras.main.setBackgroundColor(0x000000);

    this.points = [];
    this.stars = this.add.group();

    this.maxDepth = 32;

    for (var i = 0; i < 512; i++) {
      this.points.push({
        x: Phaser.Math.Between(-25, 25),
        y: Phaser.Math.Between(-25, 25),
        z: Phaser.Math.Between(1, this.maxDepth)
      });
    }






    var title = this.add.bitmapText(game.config.width / 2, 100, 'font', 'FALCON', 150).setOrigin(.5).setTint(0x00ff33);

    var startTime = this.add.bitmapText(game.config.width / 2 - 50, 275, 'font', 'Play', 50).setOrigin(0, .5).setTint(0xffffff);
    startTime.setInteractive();
    startTime.on('pointerdown', this.clickHandler, this);



  }
  update() {
    this.stars.clear(true, true);
    for (var i = 0; i < this.points.length; i++) {
      var point = this.points[i];

      point.z -= 0.2;

      if (point.z <= 0) {
        point.x = Phaser.Math.Between(-25, 25);
        point.y = Phaser.Math.Between(-25, 25);
        point.z = this.maxDepth;
      }

      var px = point.x * (128 / point.z) + (this.game.config.width * 0.5);
      var py = point.y * (128 / point.z) + (this.game.config.height * 0.5);

      var circle = new Phaser.Geom.Circle(
        px,
        py,
        (1 - point.z / 32) * 2
      );

      var graphics = this.add.graphics({ fillStyle: { color: 0xffffff } });
      graphics.setAlpha((1 - point.z / 32));
      graphics.fillCircleShape(circle);
      this.stars.add(graphics);
    }
  }
  clickHandler() {

    this.scene.start('playGame');
    //this.scene.launch('UI');
  }

}