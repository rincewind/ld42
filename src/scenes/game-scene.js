
class Egg extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene, 0, 0, 'egg');
    }
    spawn(x, y, subspawn) {
        this.setActive(true);
        this.setVisible(true);
        this.setScale(2,2);
        this.setPosition(x, y);
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

        this.setVelocity(Phaser.Math.Between(-300,300), Phaser.Math.Between(-300,300));
        this.setBounce(1,1);
        this.setCollideWorldBounds(true);
        this.setPosition(x, y);
        this.setMass(100);
        this.body.allowRotation = true;
        this.body.setAngularDrag(30);
        this.body.useDamping = true;

        this.alive = true;
        //this.body.reset(this.x, this.y);

        //this.scene.physics.velocityFromRotation(this.angle, this.speed, this.body.velocity);

        // slowly turn towards ship:
        // Accelerate at 60 px/s/s, maximum velocity 300 px/s
        // this.physics.accelerateToObject(clown, block, 60, 300, 300);
    }

    die () {
        this.alive = false;
        this.setDrag(0.2);
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
        this.kills = 0;

        this.world_width = 480;
        this.world_height = 480;

        this.shoot_sound = this.sound.add('shoot');
        this.hit_sound = this.sound.add('hit');
        this.absorb_sound = this.sound.add('absorb');
        this.ship_splosion_sound = this.sound.add('big_explosion');
        this.eggspawn_sound = this.sound.add('eggspawn');
        this.ship = this.physics.add.image(150, 150, 'ship');
        this.ship.setScale(2,2);
        //this.physics.world.enable([this.ship]);


        this.anims.create({key: 'explode', hideOnComplete: true,
            frames: this.anims.generateFrameNumbers('splosion', {start: 0, end: 8}),
            frameRate:15});

        this.splosion = this.add.sprite(100,100,'splosion');
        this.splosion.setVisible(false);

        this.ship.setBounce(1,1);
        this.ship.setCollideWorldBounds(true);

        this.ship.setMass(200);
        this.ship.useDamping = true;


        this.ship.angle = 90;
        this.ship.setDrag(250);
        this.ship.setAngularDrag(200);
        this.ship.setMaxVelocity(600);


        //  this.input.gamepad.on('down', function (pad, button, index) {


        this.cursors = this.input.keyboard.createCursorKeys();


        let wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        let power = 500;

        this.input.keyboard.on('keydown_W', (event) => {
            this.ship.setAccelerationY(-power);
        });
        this.input.keyboard.on('keydown_S', (event) => {
            this.ship.setAccelerationY(power);
        });
        this.input.keyboard.on('keydown_A', (event) => {
            this.ship.setAccelerationX(-power);
        });
        this.input.keyboard.on('keydown_D', (event) => {
            this.ship.setAccelerationX(power);
        });
        // stopping
        this.input.keyboard.on('keyup_W', (event) => {
            if (wasd['down'].isUp)
                this.ship.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_S', (event) => {
            if (wasd['up'].isUp)
                this.ship.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_A', (event) => {
            if (wasd['right'].isUp)
                this.ship.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_D', (event) => {
            if (wasd['left'].isUp)
                this.ship.setAccelerationX(0);
        });

        this.should_fire = false;
        this.input.on('pointerdown', () => {
            this.should_fire = true;
        });

        this.input.on('pointerup', () => {
            this.should_fire = false;
        });


        this.input.keyboard.on('keydown_Q', (event) => {
            if (this.input.mouse.locked) {
                this.input.mouse.releasePointerLock();
            }
            this.scene.start('GameOver', {kills: this.kills});
        }, 0);

        this.input.on('pointermove', (pointer) => {
            this.ship.setRotation(Phaser.Math.Angle.Between(this.ship.x, this.ship.y, pointer.worldX, pointer.worldY));
        });

        //this.fire_btn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


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
                shooty.die();
                this.kills += 1;
                this.splosion.setPosition(projectile.x, projectile.y);
                this.splosion.setVisible(true);
                this.splosion.setScale(2, 2);
                this.splosion.play('explode');
                this.hit_sound.play();
                if (this.dead_alien_help) {
                    this.create_tutorial_text(shooty, this.dead_alien_help);
                    this.dead_alien_help = undefined;
                }
            } else {
                this.absorb_sound.play();
            }

            projectile.destroy();

        });

        this.physics.add.collider(this.shootables, this.shootables, (lhs, rhs) => {
            [lhs, rhs].forEach((shooty) => {
                if (shooty.alive && shooty.body.newVelocity.lengthSq() < 400) {
                    console.log('setting velocity')
                    shooty.setVelocity(Phaser.Math.Between(-250,250), Phaser.Math.Between(-250,250));
                }
            });
        });

        this.physics.add.collider(this.ship, this.shootables, (ship, shooty) => {
            if (shooty.alive) {
                this.splosion.setPosition(ship.x, ship.y);
                this.splosion.setVisible(true);
                this.splosion.setScale(2.5, 2.5);
                this.splosion.on('animationcomplete', (animation,frame) => {
                    this.scene.start('GameOver', {kills:this.kills});
                });
                this.splosion.play('explode');
                ship.setVisible(false);
                this.ship_splosion_sound.play();
                this.physics.world.isPaused = true;

            }
        });


        this.attachments = [];

        let first_egg = this.spawn_egg(this.world_width/2, this.world_height/2);

        this.create_tutorial_text(first_egg, ["interdimensional egg",  "mostly harmless"]);
        this.create_tutorial_text(this.ship, ["that's your ship",
            "WASD to move",
            "mouse to shoot"]);


        this.dead_alien_help = ["dead alien",  "annoyingly persistent"];


        this.alien_help =  ["ALIEN! SHOOT IT!",  "DON'T LET IT GET YOU!"];


        this.egg_spawn_event = this.time.addEvent({ delay: 3000, callback: () => { this.spawn_egg(); }, loop: true });
    }

    create_tutorial_text(obj, text, color) {
        let text_config = {fontSize: 12, fill: color || '#ccc',  align: 'center'};
        let text_obj = this.add.text(-100, -100, text, text_config).setOrigin(0.5, 0);
        this.attachments.push({master: obj, slave: text_obj, x:0, y:25})
        this.time.addEvent({ delay: 4000, callback: () =>  { text_obj.setActive(false).setVisible(false); } });
    }

    update_attachments() {
        this.attachments.forEach((o) => {
            if (o.master.active && o.slave.active) {
                o.slave.setPosition(o.master.x + o.x, o.master.y + o.y);
            }
        });
        this.attachments.filter(o => o.master.active && o.slave.active);
    }


    maybe_spawn_random_egg(event) {
        console.log(event);
    }


    spawn_alien_egg(shooty) {
        if (shooty.alive) {
            this.spawn_egg(shooty.x, shooty.y);
        } else {
            shooty.egg_spawn_event.remove(false);
        }
    }

    spawn_alien_from_egg(egg) {
        this.eggspawn_sound.play();
        var shooty = this.shootables.get();
        if (shooty) {
            shooty.egg_spawn_event = this.time.addEvent({ delay: 2000, callback: () =>  this.spawn_alien_egg(shooty), loop: true });
            shooty.spawn(egg.x, egg.y);
            if (this.alien_help) {
                this.create_tutorial_text(shooty, this.alien_help, '#d3a0a0');
                this.alien_help = undefined;
            }
        }
    }

    spawn_egg(_x, _y) {
        let x = _x;
        let y = _y;

        if (typeof x === 'undefined') {
            x = Phaser.Math.Between(40, this.world_width - 40);
            y = Phaser.Math.Between(40, this.world_height - 40);
        }

        var egg = this.eggs.get();
        if (egg) {
            egg.spawn(x, y, () => { this.spawn_alien_from_egg(egg); });
            return egg;
        }
    }


    update(time, delta) {

        this.update_attachments();
       /* if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.ship.body.setAccelerationX(-1 * delta);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.ship.body.setAccelerationX(1 * delta);
        } else {
            this.ship.body.setAccelerationX(0);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.ship.body.setAccelerationY(-1 * delta);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.ship.body.setAccelerationY(1 * delta);
        } else {
            this.ship.body.setAccelerationY(0);
        }*/

        if (this.should_fire && time > this.ship.last_shot) {
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