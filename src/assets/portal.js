/**
 * 生成传送门图像的脚本
 * 用法: 可以在场景的preload方法中加载
 */
class PortalGenerator {
  /**
   * 生成传送门图像
   * @param {Phaser.Scene} scene - Phaser场景
   */
  static generate(scene) {
    // 创建一个圆形的传送门纹理
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 外圈
    graphics.lineStyle(4, 0x00ffff, 1);
    graphics.strokeCircle(32, 32, 30);
    
    // 内圈
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(32, 32, 20);
    
    // 中心
    graphics.fillStyle(0x0088ff, 0.6);
    graphics.fillCircle(32, 32, 15);
    
    // 添加一些细节
    graphics.lineStyle(2, 0xffff00, 0.7);
    graphics.beginPath();
    graphics.moveTo(32 - 15, 32);
    graphics.lineTo(32 + 15, 32);
    graphics.moveTo(32, 32 - 15);
    graphics.lineTo(32, 32 + 15);
    graphics.closePath();
    graphics.strokePath();
    
    // 生成纹理
    graphics.generateTexture('portal', 64, 64);
    graphics.destroy();
    
    // 生成粒子
    const particles = scene.make.graphics({ x: 0, y: 0, add: false });
    particles.fillStyle(0x00ffff, 1);
    particles.fillCircle(4, 4, 4);
    particles.generateTexture('blue', 8, 8);
    particles.destroy();
  }
} 