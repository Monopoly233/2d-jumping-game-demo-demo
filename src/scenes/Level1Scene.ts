import { LevelScene } from './LevelScene';
import { Player } from '../entities/Player';
import { Portal } from '../entities/Portal';

export class Level1Scene extends LevelScene {
  constructor() {
    super({ key: "Level1Scene" });
    this.sceneName = "Level1Scene";
    this.sceneIndex = 1;
    this.backgroundColor = 0x87CEEB; // 天蓝色
    console.log('Level1Scene构造完成');
  }
  
  preload() {
    console.log('Level1Scene preload开始');
    super.preload();
    console.log('Level1Scene preload完成');
  }
  
  create() {
    console.log('Level1Scene create开始');
    super.create();
    console.log('Level1Scene create完成');
  }
  
  createPlayer() {
    console.log('Level1Scene创建玩家');
    
    // 创建玩家在左侧位置
    this.player = new Player(this, 100, this.sceneHeight / 2);
    
    // 确保玩家不会离开世界边界
    this.player.setCollideWorldBounds(true);
    
    console.log('玩家创建在:', 100, this.sceneHeight / 2);
    console.log('Level1Scene玩家创建完成');
  }
  
  createDefaultLayout() {
    console.log('Level1Scene创建默认布局');
    
    // 创建一系列平台
    const platformPositions = [
      { x: 400, y: 450 },
      { x: 600, y: 350 },
      { x: 800, y: 250 },
      { x: 1000, y: 550 },
      { x: 1200, y: 450 },
      { x: 1400, y: 350 },
      { x: 1600, y: 250 },
      { x: 1800, y: 350 },
      { x: 2000, y: 450 },
    ];
    
    // 创建平台
    platformPositions.forEach(pos => {
      const platform = this.platforms.create(pos.x, pos.y, 'platform');
      // 使用蓝色色调
      platform.setTint(0x0088FF);
    });
    
    // 创建通往Level2的传送门
    const portal = new Portal(this, 2200, this.sceneHeight - 100, 'Level2Scene');
    this.add.existing(portal);
    this.portals.push(portal);
    
    console.log('Level1Scene默认布局创建完成');
  }
  
  createUI() {
    console.log('Level1Scene创建UI');
    
    // 创建基础UI元素 (FPS和坐标显示)
    this.fpsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.fpsText.setScrollFactor(0);
    
    this.coordsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.coordsText.setScrollFactor(0);
    
    // 添加帮助文本
    const helpText = this.add.text(
      10, 
      80, 
      this.helpText || '关卡 1: 使用方向键或WASD移动，到达右侧传送门\n按 E 键开启编辑器', 
      { 
        fontSize: '18px',
        color: '#fff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
      }
    );
    helpText.setScrollFactor(0);
    
    console.log('Level1Scene UI创建完成');
  }
} 