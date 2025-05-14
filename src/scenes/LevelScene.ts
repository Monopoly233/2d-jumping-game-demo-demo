import { Player } from '../entities/Player';
import { Portal } from '../entities/Portal';
import { LevelEditor } from '../utils/LevelEditor';
import { LevelLoader, PlatformData, PortalData } from '../utils/LevelLoader';
import { Platform } from '../entities/Platform';

export class LevelScene extends Phaser.Scene {
  // 场景基本元素
  protected player!: Player;
  protected platforms!: Phaser.Physics.Arcade.StaticGroup;
  protected ground!: Phaser.GameObjects.TileSprite;
  protected fpsText!: Phaser.GameObjects.Text;
  protected coordsText!: Phaser.GameObjects.Text;
  protected levelEditor!: LevelEditor;
  
  // 场景属性
  protected sceneWidth: number = 3000;
  protected sceneHeight: number = 500;
  protected sceneName: string = 'LevelScene';
  protected sceneIndex: number = 0;
  protected backgroundColor: number = 0x87CEEB; // 天蓝色
  
  // 场景可编辑数据
  protected playerSpawnX: number = 100;
  protected playerSpawnY: number = 750;
  protected groundHeight: number = 64;
  protected groundTint: number = 0x888888;
  protected helpText: string = '';
  
  // 平台和传送门数据
  protected platformsData: Array<PlatformData> = [];
  protected portalsData: Array<PortalData> = [];
  
  // 传送门
  protected portals: Portal[] = [];
  
  // 场景数据
  protected levelData: any[] = [];
  
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }
  
  preload() {
    console.log(`${this.sceneName} preload开始`);
    
    // 创建所有游戏纹理（包括玩家）
    this.createTextures();
    
    // 加载关卡数据
    LevelLoader.getInstance().preload(this);
    
    console.log(`${this.sceneName} preload完成`);
  }
  
  create() {
    console.log('LevelScene create 方法开始执行');
    
    // 初始化关卡加载器
    LevelLoader.getInstance().init(this);
    
    // 应用关卡数据
    LevelLoader.getInstance().applyToScene(this);
    
    // 先检查是否有编辑过的数据
    this.loadEditedLevelData();
    
    // 设置背景色
    this.cameras.main.setBackgroundColor(this.backgroundColor);
    
    // 创建物理世界的边界
    this.physics.world.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // 创建地面
    this.createGround();
    
    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 创建标准布局
    this.createDefaultLayout();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建UI
    this.createUI();
    
    // 设置碰撞
    this.setupCollisions();
    
    // 设置相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // 初始化关卡编辑器
    this.levelEditor = new LevelEditor(this);
    
    console.log('LevelScene create 方法执行完成');
  }
  
  // 加载编辑过的场景数据（如果有）
  private loadEditedLevelData(): void {
    const editedData = LevelLoader.getInstance().loadEditedLevel(this.sceneName);
    if (editedData) {
      console.log(`找到编辑过的场景数据: ${this.sceneName}`);
      
      // 应用编辑过的平台数据
      if (editedData.platforms) {
        this.platformsData = editedData.platforms;
      }
      
      // 应用编辑过的传送门数据
      if (editedData.portals) {
        this.portalsData = editedData.portals;
      }
      
      // 应用其他属性
      if (editedData.backgroundColor) {
        this.backgroundColor = parseInt(editedData.backgroundColor);
      }
      
      if (editedData.player) {
        this.playerSpawnX = editedData.player.x;
        this.playerSpawnY = editedData.player.y;
      }
      
      if (editedData.ground) {
        this.groundHeight = editedData.ground.height;
        this.groundTint = parseInt(editedData.ground.tint);
      }
      
      if (editedData.helpText) {
        this.helpText = editedData.helpText;
      }
    }
  }
  
  // 保存编辑后的场景数据
  public saveEditedLevelData(): void {
    const data = {
      key: this.sceneName,
      index: this.sceneIndex,
      backgroundColor: "0x" + this.backgroundColor.toString(16),
      width: this.sceneWidth,
      height: this.sceneHeight,
      player: {
        x: this.playerSpawnX,
        y: this.playerSpawnY
      },
      ground: {
        height: this.groundHeight,
        tint: "0x" + this.groundTint.toString(16)
      },
      platforms: this.platformsData,
      portals: this.portalsData,
      helpText: this.helpText
    };
    
    LevelLoader.getInstance().saveEditedLevel(this.sceneName, data);
  }
  
  update() {
    try {
      // 更新玩家
      if (this.player) {
        this.player.update();
      }
      
      // 更新编辑器
      if (this.levelEditor) {
        this.levelEditor.update();
      }
      
      // 更新FPS显示
      if (this.fpsText) {
        this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
      }
      
      // 更新坐标显示
      if (this.coordsText && this.player) {
        this.coordsText.setText(
          `X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}\n` +
          `场景: ${this.sceneName} ${this.sceneIndex}/2`
        );
      }
    } catch (error) {
      console.error('Update方法错误:', error);
    }
  }
  
  // 创建地面
  protected createGround(): void {
    console.log('创建地面');
    
    // 创建地面
    this.ground = this.add.tileSprite(
      this.sceneWidth / 2, 
      this.sceneHeight - this.groundHeight / 2, 
      this.sceneWidth, 
      this.groundHeight, 
      'ground'
    );
    
    // 设置颜色
    this.ground.setTint(this.groundTint);
    
    // 添加地面到物理系统
    this.physics.add.existing(this.ground, true);
    
    // 调整地面碰撞体的大小
    const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody;
    groundBody.setOffset(0, 0);
    
    console.log('地面创建完成');
  }
  
  // 创建玩家
  protected createPlayer(): void {
    console.log('创建玩家在', this.playerSpawnX, this.playerSpawnY);
    
    // 创建玩家在指定位置
    this.player = new Player(this, this.playerSpawnX, this.playerSpawnY);
    
    // 确保玩家不会离开世界边界
    this.player.setCollideWorldBounds(true);
  }
  
  // 创建UI
  protected createUI(): void {
    // 这是一个空的默认实现，将由子类覆盖
    console.log(`${this.sceneName} 未实现createUI方法，需要由子类提供`);
  }
  
  // 设置碰撞
  protected setupCollisions(): void {
    // 设置玩家与地面和平台的碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
    
    // 设置玩家与传送门的重叠检测
    this.portals.forEach(portal => {
      this.physics.add.overlap(
        this.player, 
        portal, 
        () => portal.activate(this.player),
        undefined,
        this
      );
    });
  }
  
  // 创建默认布局（使用JSON数据）
  protected createDefaultLayout(): void {
    console.log(`${this.sceneName} 创建默认布局`);
    
    // 创建平台
    this.platformsData.forEach(platformData => {
      // 检查是否有额外平台属性
      const width = platformData.width || 128;
      const height = platformData.height || 32;
      const hasPhysics = platformData.hasPhysics !== undefined ? platformData.hasPhysics : true;
      
      // 创建平台实体而不是简单的sprite
      const platform = new Platform(
        this,
        platformData.x, 
        platformData.y,
        width,
        height,
        parseInt(platformData.tint || "0x00ff00"),
        hasPhysics
      );
      
      // 将平台添加到静态组
      this.platforms.add(platform);
    });
    
    // 创建传送门
    this.portalsData.forEach(portalData => {
      const portal = new Portal(
        this, 
        portalData.x, 
        portalData.y, 
        portalData.targetScene
      );
      
      this.add.existing(portal);
      this.portals.push(portal);
      
      if (portalData.tint) {
        portal.setTint(parseInt(portalData.tint));
      }
    });
    
    console.log(`${this.sceneName} 默认布局创建完成`);
  }
  
  // Getter 方法
  public getSceneName(): string {
    return this.sceneName;
  }
  
  // 获取玩家对象
  public getPlayer(): Player {
    return this.player;
  }
  
  // Setter 方法
  public setSceneIndex(index: number): void {
    this.sceneIndex = index;
  }
  
  public setSceneSize(width: number, height: number): void {
    this.sceneWidth = width;
    this.sceneHeight = height;
  }
  
  public setBackgroundColor(color: number): void {
    this.backgroundColor = color;
  }
  
  public setPlayerSpawn(x: number, y: number): void {
    this.playerSpawnX = x;
    this.playerSpawnY = y;
  }
  
  public setGroundProperties(height: number, tint: number): void {
    this.groundHeight = height;
    this.groundTint = tint;
  }
  
  public setHelpText(text: string): void {
    this.helpText = text;
  }
  
  public setPlatforms(platformsData: Array<PlatformData>): void {
    this.platformsData = platformsData;
  }
  
  public setPortals(portalsData: Array<PortalData>): void {
    this.portalsData = portalsData;
  }
  
  // 工具方法：获取下一个场景名称
  public getNextSceneName(): string {
    const scenes = LevelLoader.getInstance().getAllSceneKeys();
    const currentIndex = scenes.indexOf(this.sceneName);
    const nextIndex = (currentIndex + 1) % scenes.length;
    return scenes[nextIndex];
  }
  
  // 切换到另一个场景
  goToScene(sceneName: string) {
    this.scene.start(sceneName);
  }
  
  // 创建游戏所需的所有纹理
  private createTextures(): void {
    console.log('创建游戏纹理');
    
    // 创建平台纹理
    const platformGraphics = this.make.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 128, 32);
    platformGraphics.lineStyle(2, 0x000000, 1);
    platformGraphics.strokeRect(0, 0, 128, 32);
    platformGraphics.generateTexture('platform', 128, 32);
    platformGraphics.destroy();
    
    // 创建地面纹理
    const groundGraphics = this.make.graphics();
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.lineStyle(2, 0x000000, 1);
    groundGraphics.strokeRect(0, 0, 64, 64);
    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();
    
    // 创建传送门纹理
    const portalGraphics = this.make.graphics();
    portalGraphics.fillStyle(0x0000ff, 1);
    portalGraphics.fillCircle(32, 32, 30);
    portalGraphics.lineStyle(4, 0x00ffff, 1);
    portalGraphics.strokeCircle(32, 32, 30);
    portalGraphics.generateTexture('portal', 64, 64);
    portalGraphics.destroy();
    
    // 创建粒子纹理
    const particleGraphics = this.make.graphics();
    particleGraphics.fillStyle(0x00ffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('blue', 8, 8);
    particleGraphics.destroy();
    
    // 创建玩家纹理
    const playerGraphics = this.make.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    console.log('纹理创建完成');
  }
} 