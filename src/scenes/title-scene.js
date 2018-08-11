export class TitleScene extends Phaser.Scene {
  constructor () {
    super({ key: 'Title' });
  }

  preload() {
    this.load.image('star', 'assets/star.png');
    
  }

  create() {
    
    this.add.particles('star', {active: true, 
        frequency: 50,
        quantity: 4,
        speed: 150,
        lifespan: 4000,
        x:640/2, y: 480/2,
        //x:{min: 0, max: 640},
        //y:{min: 0, max: 480},
        scale: { start: 0.1, end: 2.0 },
        accelerationX: 0, accelerationY: 0, gravityX: 0, gravityY: 0
    //,emitZone: new Phaser.Geom.Circle(320, 240, 20)
    });
    //this.add.image(100, 200, 'cokecan');
    
    this.add.text(100, 100, '#ld42 running out of space', { fill: '#0f0' });
    this.add.text(150, 200, 'peter creates games', { fill: '#00f' });
    this.add.text(200, 300, 'Spaceshootingpilingup', { fill: '#f00' });


    this.input.keyboard.once('keydown', (/*event*/) => {
        this.scene.start('Game');
    });

  }
}