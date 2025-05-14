import { LevelScene } from './LevelScene';
import { Player } from '../entities/Player';
import { Portal } from '../entities/Portal';
import { Enemy } from '../entities/Enemy';

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
    
    // 创建一些敌人
    this.createEnemies();
    
    // 设置敌人的碰撞
    this.setupEnemyCollisions();
    
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
  
  protected createUI(): void {
    super.createUI();
    
    // 添加帮助文本
    const helpText = this.add.text(16, 16, '使用方向键或WASD移动\nK键跳跃\nJ键射击', {
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    helpText.setScrollFactor(0);
    
    // 添加FPS显示
    this.fpsText = this.add.text(16, 90, '', { 
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.fpsText.setScrollFactor(0);
    
    // 添加坐标显示
    this.coordsText = this.add.text(16, 130, '', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.coordsText.setScrollFactor(0);
    
    console.log('Level1Scene UI创建完成');
  }

  private setupEnemyCollisions(): void {
    // 敌人与平台的碰撞
    this.enemies.forEach(enemy => {
      // 与地面的碰撞
      this.physics.add.collider(enemy, this.ground);
      
      // 与平台的碰撞
      this.physics.add.collider(enemy, this.platforms);
    });
  }

  private createEnemies(): void {
    // 在一些平台上创建敌人
    const enemyPositions = [
      { x: 400, y: 100 },  // 调整位置，让敌人从高处掉落
      { x: 600, y: 100 },
      { x: 800, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y);
      this.enemies.push(enemy);
    });
  }

  update() {
    super.update();
    
    // 更新所有敌人
    this.enemies.forEach(enemy => enemy.update());
  }
} 