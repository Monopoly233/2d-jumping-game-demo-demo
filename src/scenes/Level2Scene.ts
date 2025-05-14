import { LevelScene } from './LevelScene';

export class Level2Scene extends LevelScene {
  constructor() {
    super({ key: "Level2Scene" });
    this.sceneName = "Level2Scene";
    console.log('Level2Scene构造完成');
  }
  
  preload() {
    console.log('Level2Scene preload开始');
    super.preload();
    console.log('Level2Scene preload完成');
  }
  
  create() {
    console.log('Level2Scene create开始');
    super.create();
    console.log('Level2Scene create完成');
  }
  
  createUI() {
    console.log('Level2Scene创建UI');
    
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
      this.helpText || '关卡 2: 更具挑战性的布局，找到传送门返回关卡1\n按 E 键开启编辑器', 
      { 
        fontSize: '18px',
        color: '#fff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
      }
    );
    helpText.setScrollFactor(0);
    
    console.log('Level2Scene UI创建完成');
  }
} 