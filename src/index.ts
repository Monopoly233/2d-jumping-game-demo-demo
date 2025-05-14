import 'phaser';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: true,
      bounce: 0
    }
  },
  scene: GameScene,
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};

new Phaser.Game(config); 