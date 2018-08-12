export class TitleScene extends Phaser.Scene {
  constructor () {
    super({ key: 'Title' });
  }

  preload() {
    this.load.image('star', 'assets/star.png');
    this.load.image('alien', 'assets/alien.png');
    this.load.image('ship', 'assets/ship.png');
  }

  create() {
    
    this.add.particles('star', {active: true, 
        frequency: 50,
        quantity: 4,
        speed: 150,
        lifespan: 4000,
        x:480/2, y: 480/2,
        //x:{min: 0, max: 640},
        //y:{min: 0, max: 480},
        scale: { start: 0.1, end: 2.0 },
        accelerationX: 0, accelerationY: 0, gravityX: 0, gravityY: 0
    //,emitZone: new Phaser.Geom.Circle(320, 240, 20)
    });
    //this.add.image(100, 200, 'cokecan');


    this.add.text(10, 50, ['basically,', 'just a shitty shooter'], { fill: '#00f', fontSize: 31});
    this.add.text(30, 350, ['Made in a few hours', 'during #ld42 "running out of space"','by peter quade'], { align: 'center', fill: '#0f0', fontSize: 20 });

    let any_key_text = this.add.text(180, 420, ['press any key'], { align: 'center', fill: '#ff00ff', fontSize: 20 });


      this.tweens.add({
          targets: any_key_text,
          x: 150,
          duration: 800,
          ease: 'Sine.easeInOut',
          yoyo: -1,
          loop: -1
      });

    let ship = this.add.image(110,250, 'ship');
    let alien = this.add.image(350,250, 'alien');

  this.tweens.add({
      targets: ship,
      y: 240,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: -1,
      loop: -1
  });

  this.tweens.add({
      targets: alien,
      y: 245,
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: -1,
      loop: -1
  });

    ship.setScale(2,2);

    this.input.keyboard.once('keydown', (/*event*/) => {
        this.scene.start('Game');
    });

  }
}