export class Portal extends Phaser.Physics.Arcade.Sprite {
  private targetScene: string;
  private activationDelay: number = 500; // 毫秒
  private canActivate: boolean = true;
  private activationEffect?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    targetScene: string
  ) {
    super(scene, x, y, 'portal');
    
    // 基本设置
    this.targetScene = targetScene;
    
    // 启用物理
    scene.physics.add.existing(this);
    
    // 设置物理属性
    this.setImmovable(true);
    
    // 禁用重力 - 防止传送门下落
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    
    // 碰撞体积调整 (使用圆形碰撞体)
    body.setCircle(32);
    
    // 设置缩放和旋转动画
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 添加旋转动画
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 6000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * 激活传送门
   * @param entity 接触传送门的实体（通常是玩家）
   */
  activate(entity: Phaser.GameObjects.GameObject): void {
    if (!this.canActivate) return;
    
    // 设置冷却时间，防止多次激活
    this.canActivate = false;
    
    // 创建简单的粒子爆发效果
    const particles = this.scene.add.particles(this.x, this.y, 'blue', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      quantity: 30
    });
    
    // 闪烁效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 4
    });
    
    // 延迟后切换场景
    this.scene.time.delayedCall(this.activationDelay, () => {
      // 销毁粒子系统
      particles.destroy();
      this.scene.scene.start(this.targetScene);
    });
  }

  /**
   * 设置目标场景
   */
  setTargetScene(sceneName: string): void {
    this.targetScene = sceneName;
  }
} 