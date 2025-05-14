import 'phaser';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { ClearCache } from './utils/ClearCache';

console.log('初始化游戏...');

// 清除本地缓存的关卡数据，确保使用JSON中的数据
console.log('清除缓存的关卡数据...');
ClearCache.clearLevelData();

// 创建全局游戏配置
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#4488aa',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 2000 },
      debug: true
    }
  },
  scene: [Level1Scene, Level2Scene],
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  pixelArt: true,
  roundPixels: true,
  render: {
    antialias: false,
    pixelArt: true,
    transparent: false
  }
};

// 处理加载关卡数据JSON文件
// 复制levels.json到dist目录
function copyLevelsJson() {
  try {
    // 在浏览器环境中无法直接操作文件系统
    // 这只是一个提示，实际复制在构建时处理
    console.log('需要确保levels.json被复制到dist目录');
  } catch (error) {
    console.error('无法复制levels.json文件:', error);
  }
}

copyLevelsJson();

// 创建游戏实例
window.onload = () => {
  console.log('DOM加载完成，创建游戏实例');
  new Phaser.Game(config);
}; 