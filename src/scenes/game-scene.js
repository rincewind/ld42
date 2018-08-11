
class Egg extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene, 0, 0, 'egg');
    }
    spawn(subspawn) {
        this.setActive(true);
        this.setVisible(true);
        this.setScale(2,2);
        this.setPosition(Phaser.Math.Between(100,500), Phaser.Math.Between(50,400), );
        this.tintFill = true;
        this.tween = this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 375*2,
            yoyo: true,
            repeat: 4,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                var new_tint = Phaser.Display.Color.Interpolate.RGBWithRGB(255, 255, 255, 0, 0, 255, 100, this.tween.getValue() );
                new_tint = Phaser.Display.Color.ObjectToColor(new_tint);

                this.setTint(new_tint.color);
            },
            onComplete: () => {
                this.destroy();
                subspawn();
            }
        });
    }
}

class Shootable extends Phaser.Physics.Arcade.Image {
    constructor(scene) {
        super(scene, 0, 0, 'alien');
        this.setBlendMode(1);
        this.setDepth(1);
        this.speed = 100;
    }
    spawn(x, y) {
        this.setActive(true);
        this.setVisible(true);

        this.setVelocity(Phaser.Math.Between(-100,100), Phaser.Math.Between(-100,100));
        this.setBounce(1,1);
        this.setCollideWorldBounds(true);
        this.setPosition(x, y);
        this.setMass(100);
        this.body.allowRotation = true;
        this.body.setAngularDrag(30);
        //this.body.useDamping = true;

        this.alive = true;
        //this.body.reset(this.x, this.y);

        //this.scene.physics.velocityFromRotation(this.angle, this.speed, this.body.velocity);

        // slowly turn towards ship:
        // Accelerate at 60 px/s/s, maximum velocity 300 px/s
        // this.physics.accelerateToObject(clown, block, 60, 300, 300);
    }

    die () {
        this.alive = false;
        this.setDrag(200);
        this.setMass(this.body.mass * 2);
        this.setTint(0xa0a0a0);
        this.tintFill = true;
    }


    update(/*time, delta*/) {
        //this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        this.body.angle *= Phaser.Math.Between(0.75, 1.25);
    }
}

class Projectile extends Phaser.Physics.Arcade.Image {
    constructor(scene) {
        super(scene, 0, 0, 'projectile');
        this.setBlendMode(1);
        this.setDepth(1);

        this.speed = 1000;
        this.lifespan = 1000;
    }


    fire(srcobj) {
        this.lifespan = 1000;
        this.setMass(0.01);

        this.setActive(true);
        this.setVisible(true);
        this.setAngle(srcobj.body.rotation);
        this.setPosition(srcobj.x, srcobj.y);
        this.body.reset(srcobj.x, srcobj.y);

        var angle = Phaser.Math.DegToRad(srcobj.body.rotation);
        angle *= Phaser.Math.Between(0.95, 1.05);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

    }

    update(time, delta) {
        this.lifespan -= delta;

        if (this.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
        }
    }
}


export class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'Game'});
    }

    preload() {
        this.load.image('ship', 'assets/ship.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('alien', 'assets/alien.png');
        this.load.image('egg', 'assets/egg.png');
        this.load.image('projectile', 'assets/projectile.png');

        this.load.spritesheet('splosion', 'assets/explosion.png', { frameWidth: 16, frameHeight: 16, endFrame: 8 });

        this.load.audio('shoot', 'assets/shoot.wav');
        this.load.audio('hit', 'assets/hit.wav');
        this.load.audio('absorb', 'assets/pfft.wav');
        this.load.audio('big_explosion', 'assets/big_splosion.wav');
        this.load.audio('eggspawn', 'assets/eggspawn.wav');

    }


    create() {
        this.shoot_sound = this.sound.add('shoot');
        this.hit_sound = this.sound.add('hit');
        this.absorb_sound = this.sound.add('absorb');
        this.ship_splosion_sound = this.sound.add('big_explosion');
        this.eggspawn_sound = this.sound.add('eggspawn');
        this.ship = this.add.image(150, 150, 'ship');
        this.physics.world.enable([this.ship]);


        this.anims.create({key: 'explode', hideOnComplete: true,
            frames: this.anims.generateFrameNumbers('splosion', {start: 0, end: 8}),
            frameRate:15});

        this.splosion = this.add.sprite(100,100,'splosion');
        this.splosion.setVisible(false);

        this.ship.body.setBounce(1,1);
        this.ship.body.setCollideWorldBounds(true);

        this.ship.body.setMass(200);


        this.ship.angle = 90;
        this.ship.body.setDrag(100);
        this.ship.body.setAngularDrag(200);
        this.ship.body.setMaxVelocity(600);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fire_btn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.ship.last_shot = 0;

        let the_ship = this.ship;
        var particles = this.add.particles('star');

        this.next_shooty = 0;

        var engine = particles.createEmitter({
            speed: 10,
            lifespan: {
                onEmit: function (particle, key, t, value) {
                    return Phaser.Math.Percent(the_ship.body.speed, 0, 300) * 1000;
                }
            },
            alpha: {
                onEmit: function (particle, key, t, value) {
                    return Phaser.Math.Percent(the_ship.body.speed, 0, 300);
                }
            },
            angle: {
                onEmit: function (particle, key, t, value) {
                    var v = Phaser.Math.Between(-10, 10);
                    return (the_ship.angle - 180) + v;
                }
            },
            scale: {start: 0.6, end: 0}
            //blendMode: 'ADD'
        });
        engine.startFollow(this.ship);

        this.eggs = this.add.group({
            classType: Egg,
            maxSize: 50,
            runChildUpdate: false
        });

        this.projectiles = this.physics.add.group({
            classType: Projectile,
            maxSize: 50,
            runChildUpdate: true
        });

        this.shootables = this.physics.add.group({
            classType: Shootable,
            maxSize: 1000,
            runChildUpdate: true
        });

        this.physics.add.collider(this.projectiles, this.shootables, (projectile, shooty) => {
            if (shooty.alive) {
                shooty.die()
                this.splosion.setPosition(projectile.x, projectile.y);
                this.splosion.setVisible(true);
                this.splosion.setScale(2, 2);
                this.splosion.play('explode');
                this.hit_sound.play();
            } else {
                this.absorb_sound.play();
            }

            projectile.destroy();

        });

        this.physics.add.collider(this.shootables, this.shootables, (lhs, rhs) => {
            [lhs, rhs].forEach((shooty) => {
                if (shooty.alive && shooty.body.newVelocity.lengthSq() < 400) {
                    console.log('setting velocity')
                    shooty.setVelocity(Phaser.Math.Between(-150,150), Phaser.Math.Between(-150,150));
                }
            });
        });

        this.physics.add.collider(this.ship, this.shootables, (ship, shooty) => {
            if (shooty.alive) {
                this.splosion.setPosition(ship.x, ship.y);
                this.splosion.setVisible(true);
                this.splosion.setScale(2.5, 2.5);
                this.splosion.on('animationcomplete', (animation,frame) => {
                    this.scene.start('Title');
                });
                this.splosion.play('explode');
                ship.setVisible(false);
                this.ship_splosion_sound.play();
                this.physics.world.isPaused = true;

            }
        });


    }

    update(time, delta) {

        if (time > this.next_shooty){// spawn something to shoot

            this.next_shooty = time + 3000;
            var egg = this.eggs.get();
            if (egg) {
                egg.spawn(() => {
                    this.eggspawn_sound.play();
                    var shooty = this.shootables.get();
                    if (shooty) {
                        shooty.spawn(egg.x, egg.y);
                    }
                });
            }
        }

        if (this.cursors.left.isDown) {
            this.ship.body.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.ship.body.setAngularVelocity(150);
        } else {
            this.ship.body.setAngularVelocity(0);
        }

        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.ship.rotation, 600, this.ship.body.acceleration);
        } else {
            this.ship.body.setAcceleration(0);
        }
        if (this.fire_btn.isDown && time > this.ship.last_shot) {
            var projectile = this.projectiles.get();

            if (projectile) {
                projectile.fire(this.ship);
                this.ship.last_shot = time + 100;
                this.shoot_sound.play();
            }
        }
        //console.log(this.ship.x, this.ship.y);
    }
}