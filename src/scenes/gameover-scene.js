export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameOver'});
    }

    init(data) {
        this.number_of_kills = data.kills;
    }

    preload() {
        this.load.image('alien', 'assets/alien.png');
        this.load.image('ship', 'assets/ship.png');
    }

    create() {
        let number = this.add.text(40, 100, '' + this.number_of_kills, { fill: '#fff', fontSize: 60});
        let aword = 'aliens';
        if (this.number_of_kills == 1) {
            aword = 'alien named bob';
        }
        this.add.text(40, 160, ['cute red ' + aword + ' had to die,', 'before your ship finally exploded.'], { fill: '#ff0', fontSize: 20 });

        this.add.text(100, 260, ['thank you for playing'], { fill: '#fc4', fontSize: 20 });


        let any_key_text = this.add.text(180, 420, ['press any key'], { align: 'center', fill: '#ff00ff', fontSize: 20 });

        this.tweens.add({
            targets: number,
            fontSize: 1.2,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: -1,
            loop: -1
        });

        this.tweens.add({
            targets: any_key_text,
            x: 150,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: -1,
            loop: -1
        });


        this.input.keyboard.once('keydown', (/*event*/) => {
            this.scene.start('Title');
        });


    }

}