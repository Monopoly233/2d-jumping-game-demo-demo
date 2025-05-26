import { LevelScene } from './LevelScene';
import { Player } from '../entities/Player';
import { Portal } from '../entities/Portal';
import { Enemy } from '../entities/Enemy';

export class Level1Scene extends LevelScene {
  private performanceStats!: Phaser.GameObjects.Text;
  private lastSecond: number = 0;
  private frameCount: number = 0;
  private currentFPS: number = 0;

  constructor() {
    super({ key: "Level1Scene" });
    this.sceneName = "Level1Scene";
    this.sceneIndex = 1;
    this.backgroundColor = 0x000000; // 天蓝色
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
    
    // 添加性能统计显示
    this.performanceStats = this.add.text(16, 90, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.performanceStats.setScrollFactor(0);
    
    // 添加坐标显示
    this.coordsText = this.add.text(16, 200, '', {
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

    // 更新性能统计
    this.updatePerformanceStats();
  }

  private updatePerformanceStats(): void {
    // 计算FPS
    const currentSecond = Math.floor(this.game.loop.time / 1000);
    if (currentSecond !== this.lastSecond) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastSecond = currentSecond;
    }
    this.frameCount++;

    // 获取性能统计
    const memory = (window.performance as any).memory;
    
    let stats = [
      `FPS: ${this.currentFPS}`,
      `Active Objects: ${this.children.length}`,
      `Game Objects: ${this.children.list.length}`,
      `Physics Bodies: ${this.physics.world.bodies.size}`
    ];

    // 如果浏览器支持内存统计
    if (memory) {
      stats.push(
        `Memory Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100} MB`,
        `Memory Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100} MB`
      );
    }

    this.performanceStats.setText(stats.join('\n'));
  }
} 