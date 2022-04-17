class preloadGame extends Phaser.Scene {
  constructor() {
    super("PreloadGame");
  }
  preload() {


    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    var loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    var percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.image('pixel', 'assets/pixel.png');
    for (var i = 0; i < 125; i++) {
      this.load.image('pixel', 'assets/pixel.png');
    }




    //this.load.image("particle", "assets/sprites/particle.png");
    this.load.image('block', 'assets/falcon3.png');
    this.load.image('shield', 'assets/blurred-circle.png');
    this.load.image('bonus', 'assets/bonus3.png');
    this.load.image('back', 'assets/back.png');
    this.load.image('back2', 'assets/back2.png');
    this.load.image('asteroid_small', 'assets/asteroid_small.png');

    this.load.image('bar', 'assets/block.png');
    this.load.image('enemy', 'assets/tiefighter3.png');
    this.load.image('laser', 'assets/fire2.png');

    this.load.bitmapFont("font", "assets/fonts/arcade.png", "assets/fonts/arcade.xml");

  }
  create() {
    this.scene.start("startGame");
    //this.scene.start("PlayGame");

  }
}








