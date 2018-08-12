import 'phaser';

import { TitleScene } from './scenes/title-scene';
import { GameScene } from './scenes/game-scene';
import { GameOverScene } from './scenes/gameover-scene';

const gameConfig = {
  width: 480,
  height: 480,
  scene: [TitleScene, GameScene, GameOverScene],
  physics: {
      default: 'arcade',
      arcade: {
          debug: false,
          gravity: {y:0}
      }
  },
};

new Phaser.Game(gameConfig);
