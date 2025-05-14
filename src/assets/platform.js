/**
 * 生成平台和地面图像的脚本
 * 用法: 可以在场景的preload方法中加载
 */
class PlatformGenerator {
  /**
   * 生成平台图像
   * @param {Phaser.Scene} scene - Phaser场景
   */
  static generate(scene) {
    // 创建平台纹理
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制平台
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 128, 32);
    
    // 添加一些纹理细节
    graphics.lineStyle(2, 0x888888, 0.5);
    graphics.beginPath();
    for (let i = 0; i < 128; i += 16) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, 32);
    }
    graphics.moveTo(0, 16);
    graphics.lineTo(128, 16);
    graphics.closePath();
    graphics.strokePath();
    
    // 绘制边框
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.strokeRect(0, 0, 128, 32);
    
    // 生成纹理
    graphics.generateTexture('platform', 128, 32);
    graphics.destroy();
    
    // 创建地面纹理
    const groundGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 填充背景
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 64, 64);
    
    // 添加一些岩石纹理
    groundGraphics.fillStyle(0x666666, 1);
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(5, 55);
      const y = Phaser.Math.Between(5, 55);
      const size = Phaser.Math.Between(5, 15);
      groundGraphics.fillCircle(x, y, size);
    }
    
    // 绘制顶部边缘
    groundGraphics.fillStyle(0x999999, 1);
    groundGraphics.fillRect(0, 0, 64, 10);
    
    // 绘制边框
    groundGraphics.lineStyle(2, 0x000000, 0.5);
    groundGraphics.strokeRect(0, 0, 64, 64);
    
    // 生成纹理
    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();
  }
} 