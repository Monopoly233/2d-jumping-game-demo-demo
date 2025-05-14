/**
 * 可定制的平台实体
 * 支持自定义尺寸、颜色和物理特性
 */
export class Platform extends Phaser.Physics.Arcade.Sprite {
  // 平台配置
  private platformWidth: number;
  private platformHeight: number;
  private platformTint: number;
  private hasPhysics: boolean;

  /**
   * 创建一个平台实体
   * @param scene 当前场景
   * @param x X坐标位置
   * @param y Y坐标位置
   * @param width 平台宽度 (默认128)
   * @param height 平台高度 (默认32)
   * @param tint 平台颜色 (默认绿色)
   * @param hasPhysics 是否有物理特性 (默认true)
   */
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    width: number = 128, 
    height: number = 32, 
    tint: number = 0x00ff00,
    hasPhysics: boolean = true
  ) {
    super(scene, x, y, 'platform');
    
    // 保存属性
    this.platformWidth = width;
    this.platformHeight = height;
    this.platformTint = tint;
    this.hasPhysics = hasPhysics;
    
    // 添加到场景
    scene.add.existing(this);
    
    // 根据提供的尺寸调整平台大小
    this.displayWidth = width;
    this.displayHeight = height;
    
    // 设置颜色
    this.setTint(tint);
    
    // 如果需要物理特性
    if (hasPhysics) {
      scene.physics.add.existing(this, true); // true表示是静态物体
      this.refreshBody();
    }
    
    // 存储数据，方便编辑器使用
    this.setData('type', 'platform');
    this.setData('width', width);
    this.setData('height', height);
    this.setData('tint', tint.toString(16));
    this.setData('hasPhysics', hasPhysics);
  }
  
  /**
   * 修改平台尺寸
   * @param width 新宽度
   * @param height 新高度
   */
  public resize(width: number, height: number): void {
    this.platformWidth = width;
    this.platformHeight = height;
    this.displayWidth = width;
    this.displayHeight = height;
    
    // 更新数据
    this.setData('width', width);
    this.setData('height', height);
    
    // 如果有物理特性，更新碰撞体
    if (this.hasPhysics) {
      this.refreshBody();
    }
  }
  
  /**
   * 改变平台颜色
   * @param tint 新颜色值
   */
  public setColor(tint: number): void {
    this.platformTint = tint;
    this.setTint(tint);
    this.setData('tint', tint.toString(16));
  }
  
  /**
   * 切换物理特性
   * @param hasPhysics 是否启用物理
   */
  public togglePhysics(hasPhysics: boolean): void {
    // 如果状态没变，不做任何事
    if (this.hasPhysics === hasPhysics) return;
    
    this.hasPhysics = hasPhysics;
    this.setData('hasPhysics', hasPhysics);
    
    // 重新创建物理体
    if (hasPhysics) {
      this.scene.physics.add.existing(this, true);
      this.refreshBody();
    } else {
      // Phaser没有直接的方法移除物理体，这里我们可以禁用它
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      }
    }
  }
  
  /**
   * 生成JSON表示
   */
  public toJSON(): any {
    return {
      type: 'platform',
      x: this.x,
      y: this.y,
      width: this.platformWidth,
      height: this.platformHeight,
      tint: "0x" + this.platformTint.toString(16),
      hasPhysics: this.hasPhysics
    };
  }
  
  /**
   * 创建平台的静态方法
   */
  public static fromJSON(scene: Phaser.Scene, data: any): Platform {
    return new Platform(
      scene,
      data.x,
      data.y,
      data.width || 128,
      data.height || 32,
      parseInt(data.tint || "0x00ff00"),
      data.hasPhysics !== undefined ? data.hasPhysics : true
    );
  }
} 