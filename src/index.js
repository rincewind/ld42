import 'phaser';

import { TitleScene } from './scenes/title-scene';
import { GameScene } from './scenes/game-scene';

const gameConfig = {
  width: 680,
  height: 480,
  scene: [TitleScene, GameScene],
  physics: {
      default: 'arcade',
      arcade: {
          debug: false
      }
  },
};

new Phaser.Game(gameConfig);
