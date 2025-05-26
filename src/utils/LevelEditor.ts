import { LevelScene } from '../scenes/LevelScene';
import { Portal } from '../entities/Portal';
import { Platform } from '../entities/Platform';
import { PlatformData, PortalData } from './LevelLoader';

/**
 * 平台编辑对话框选项
 */
interface PlatformEditorOptions {
  width: number;
  height: number;
  tint: number;
  hasPhysics: boolean;
}

/**
 * 关卡编辑器
 * 允许在游戏中实时编辑关卡
 */
export class LevelEditor {
  private scene: LevelScene;
  private enabled: boolean = false;
  private editableObjects: Phaser.GameObjects.Sprite[] = [];
  private selectedObject: Phaser.GameObjects.Sprite | null = null;
  private gridSize: number = 32;
  private gridSprite!: Phaser.GameObjects.Graphics;
  private currentObjectType: string = 'platform';
  private ghostObject: Phaser.GameObjects.Sprite | null = null;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;
  private keySave!: Phaser.Input.Keyboard.Key;
  private keyLoad!: Phaser.Input.Keyboard.Key;
  private editorGui: Phaser.GameObjects.Container | null = null;
  private propertiesGui: Phaser.GameObjects.Container | null = null;
  
  // 平台编辑器默认设置
  private platformOptions: PlatformEditorOptions = {
    width: 128,
    height: 32,
    tint: 0x00ff00,
    hasPhysics: true
  };
  
  constructor(scene: LevelScene) {
    this.scene = scene;
    
    // 初始化网格
    this.createGrid();
    
    // 初始化按键，添加类型检查
    if (scene.input && scene.input.keyboard) {
      this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyQ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keySave = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyLoad = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
      
      // 监听按键事件
      this.keyE.on('down', this.toggleEditor, this);
      this.keyQ.on('down', this.cycleObjectType, this);
      this.keyX.on('down', this.deleteSelectedObject, this);
      this.keySave.on('down', () => {
        if (this.enabled) {
          this.scene.saveEditedLevelData();
        }
      });
    }
    
    // 监听鼠标事件
    if (scene.input) {
      scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.enabled) return;
        
        if (pointer.rightButtonDown()) {
          // 右键创建对象
          this.createObjectAtPointer(pointer);
        }
      });
      
      // 监听鼠标移动
      scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!this.enabled) return;
        this.updateGhostObject(pointer);
      });
    }
  }
  
  private createGrid(): void {
    this.gridSprite = this.scene.add.graphics();
    this.gridSprite.lineStyle(1, 0xffffff, 0.2);
    this.gridSprite.setVisible(false);
    this.drawGrid();
  }
  
  private drawGrid(): void {
    this.gridSprite.clear();
    this.gridSprite.lineStyle(1, 0xffffff, 0.2);
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // 水平线
    for (let y = 0; y < height + this.scene.cameras.main.scrollY; y += this.gridSize) {
      this.gridSprite.lineBetween(0, y, width + this.scene.cameras.main.scrollX, y);
    }
    
    // 垂直线
    for (let x = 0; x < width + this.scene.cameras.main.scrollX; x += this.gridSize) {
      this.gridSprite.lineBetween(x, 0, x, height + this.scene.cameras.main.scrollY);
    }
  }
  
  private toggleEditor(): void {
    this.enabled = !this.enabled;
    this.gridSprite.setVisible(this.enabled);
    
    if (this.enabled) {
      console.log('编辑器已启用');
      this.updateEditorGui();
      this.createGhostObject();
      this.loadExistingObjects();
      this.scene.cameras.main.stopFollow();
    } else {
      console.log('编辑器已禁用');
      this.disable();
      
      // 恢复摄像机跟随玩家
      const player = this.scene.getPlayer();
      if (player) {
        this.scene.cameras.main.startFollow(player);
      }
    }
  }
  
  private updateEditorGui(): void {
    if (!this.editorGui) {
      this.editorGui = this.scene.add.container(10, 10);
      const bg = this.scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.7);
      const text = this.scene.add.text(10, 10, '', {
        fontSize: '14px',
        color: '#ffffff'
      });
      this.editorGui.add([bg, text]);
      this.editorGui.setScrollFactor(0);
    }

    const text = this.editorGui.getAt(1) as Phaser.GameObjects.Text;
    text.setText([
      '编辑器模式',
      `当前对象: ${this.currentObjectType}`,
      'Q: 切换对象类型',
      '右键: 创建对象',
      'X: 删除选中对象',
      'S: 保存关卡',
      'E: 退出编辑器'
    ]);
  }
  
  private createGhostObject(): void {
    if (this.ghostObject) {
      this.ghostObject.destroy();
    }
    
    this.ghostObject = this.scene.add.sprite(0, 0, this.currentObjectType === 'portal' ? 'portal' : 'platform');
    this.ghostObject.setAlpha(0.5);
    this.ghostObject.setVisible(this.enabled);
    this.ghostObject.setTint(this.currentObjectType === 'portal' ? 0x00ffff : 0x00ff00);
  }
  
  private updateGhostObject(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.ghostObject) return;
    
    const snappedX = Math.floor(pointer.worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
    const snappedY = Math.floor(pointer.worldY / this.gridSize) * this.gridSize + this.gridSize / 2;
    
    this.ghostObject.setPosition(snappedX, snappedY);
  }
  
  private cycleObjectType(): void {
    if (!this.enabled) return;
    
    const types = ['platform', 'portal', 'player'];
    const currentIndex = types.indexOf(this.currentObjectType);
    this.currentObjectType = types[(currentIndex + 1) % types.length];
    
    this.updateEditorGui();
    this.createGhostObject();
  }
  
  private createObjectAtPointer(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;

    const x = Math.floor(pointer.worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
    const y = Math.floor(pointer.worldY / this.gridSize) * this.gridSize + this.gridSize / 2;

    switch (this.currentObjectType) {
      case 'platform':
        this.createPlatform(x, y);
        break;
      case 'portal':
        this.createPortal(x, y);
        break;
      case 'player':
        this.createPlayer(x, y);
        break;
    }
  }

  private createPlatform(x: number, y: number): void {
    const platform = new Platform(
      this.scene,
      x,
      y,
      this.platformOptions.width,
      this.platformOptions.height,
      this.platformOptions.tint,
      this.platformOptions.hasPhysics
    );
    
    platform.setInteractive();
    platform.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.deleteObject(platform.x, platform.y);
      } else {
        this.selectObject(platform);
      }
    });
    
    this.editableObjects.push(platform);
    this.updatePlatformsData();
  }

  private createPortal(x: number, y: number): void {
    const currentSceneName = this.scene.getSceneName();
    const targetScene = currentSceneName === 'Level1Scene' ? 'Level2Scene' : 'Level1Scene';
    
    const portal = new Portal(this.scene, x, y, targetScene);
    portal.setInteractive();
    portal.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.deleteObject(portal.x, portal.y);
      }
    });
    
    this.editableObjects.push(portal);
    this.updatePortalsData();
  }

  private createPlayer(x: number, y: number): void {
    const player = this.scene.add.sprite(x, y, 'player');
    player.setDisplaySize(32, 32);
    this.editableObjects.push(player);
  }
  
  private deleteObject(x: number, y: number): void {
    const objectToDelete = this.editableObjects.find(obj => 
      obj.x === x && obj.y === y
    );
    
    if (objectToDelete) {
      const index = this.editableObjects.indexOf(objectToDelete);
      if (index > -1) {
        this.editableObjects.splice(index, 1);
        objectToDelete.destroy();
        
        // 更新数据
        if (objectToDelete instanceof Platform) {
          this.updatePlatformsData();
        } else if (objectToDelete instanceof Portal) {
          this.updatePortalsData();
        }
      }
    }
  }
  
  private updatePlatformsData(): void {
    const platformsData: Array<PlatformData> = this.editableObjects
      .filter(obj => obj instanceof Platform)
      .map(platform => ({
        x: platform.x,
        y: platform.y,
        width: platform.getData('width'),
        height: platform.getData('height'),
        tint: "0x" + (platform.getData('tint') || "00ff00"),
        hasPhysics: platform.getData('hasPhysics')
      }));
    
    this.scene.setPlatforms(platformsData);
  }
  
  private updatePortalsData(): void {
    const portalsData: Array<PortalData> = this.editableObjects
      .filter(obj => obj instanceof Portal)
      .map(portal => ({
        x: portal.x,
        y: portal.y,
        targetScene: portal.getData('targetScene'),
        tint: portal.getData('tint') || "0x00ffff"
      }));
    
    this.scene.setPortals(portalsData);
  }
  
  private selectObject(obj: Phaser.GameObjects.GameObject): void {
    if (!this.enabled) return;
    
    if (this.selectedObject) {
      this.selectedObject.clearTint();
    }
    
    this.selectedObject = obj as Phaser.GameObjects.Sprite;
    
    if (obj instanceof Platform) {
      this.showPlatformEditor(obj);
    }
  }
  
  private disable(): void {
    if (this.ghostObject) {
      this.ghostObject.destroy();
      this.ghostObject = null;
    }
    
    if (this.editorGui) {
      this.editorGui.destroy();
      this.editorGui = null;
    }
    
    if (this.propertiesGui) {
      this.propertiesGui.destroy();
      this.propertiesGui = null;
    }
    
    if (this.selectedObject) {
      this.selectedObject.clearTint();
      this.selectedObject = null;
    }
  }
  
  private deleteSelectedObject(): void {
    if (!this.enabled || !this.selectedObject) return;
    this.deleteObject(this.selectedObject.x, this.selectedObject.y);
  }
  
  public update(): void {
    if (!this.enabled) return;
    
    const pointer = this.scene.input.activePointer;
    if (pointer) {
      this.updateGhostObject(pointer);
    }
  }
  
  private loadExistingObjects(): void {
    this.editableObjects.forEach(obj => {
      obj.off('pointerdown');
    });
    this.editableObjects = [];
    
    this.scene.children.list.forEach(obj => {
      if (obj instanceof Platform) {
        obj.setInteractive();
        obj.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.rightButtonDown()) {
            this.deleteObject(obj.x, obj.y);
          } else {
            this.selectObject(obj);
          }
        });
        this.editableObjects.push(obj);
      } else if (obj instanceof Portal) {
        obj.setInteractive();
        obj.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.rightButtonDown()) {
            this.deleteObject(obj.x, obj.y);
          }
        });
        this.editableObjects.push(obj);
      }
    });
  }
  
  private showPlatformEditor(platform: Platform): void {
    if (this.propertiesGui) {
      this.propertiesGui.destroy();
    }
    
    this.propertiesGui = this.scene.add.container(250, 150);
    
    const bg = this.scene.add.rectangle(0, 0, 200, 240, 0x000000, 0.7);
    bg.setOrigin(0, 0);
    this.propertiesGui.add(bg);
    
    const title = this.scene.add.text(10, 10, '平台属性', { 
      fontSize: '18px', 
      color: '#ffffff',
      fontStyle: 'bold' 
    });
    this.propertiesGui.add(title);
    
    const width = platform.getData('width') || 128;
    const height = platform.getData('height') || 32;
    const tint = parseInt(platform.getData('tint') || "00ff00", 16);
    const hasPhysics = platform.getData('hasPhysics') !== undefined ? platform.getData('hasPhysics') : true;
    
    const sizeLabel = this.scene.add.text(10, 50, '尺寸:', { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    
    const widthMinusBtn = this.scene.add.text(70, 50, '-', { 
      fontSize: '14px', 
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    }).setInteractive();
    
    const widthText = this.scene.add.text(100, 50, width.toString(), { 
      fontSize: '14px', 
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });
    
    const widthPlusBtn = this.scene.add.text(160, 50, '+', { 
      fontSize: '14px', 
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    }).setInteractive();
    
    const heightMinusBtn = this.scene.add.text(70, 80, '-', { 
      fontSize: '14px', 
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    }).setInteractive();
    
    const heightText = this.scene.add.text(100, 80, height.toString(), { 
      fontSize: '14px', 
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });
    
    const heightPlusBtn = this.scene.add.text(160, 80, '+', { 
      fontSize: '14px', 
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    }).setInteractive();
    
    const colorLabel = this.scene.add.text(10, 120, '颜色:', { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    
    const colorOptions = [
      { color: 0x00ff00, label: '绿色' },
      { color: 0x0088ff, label: '蓝色' },
      { color: 0xff5500, label: '橙色' },
      { color: 0xff0000, label: '红色' },
      { color: 0xffff00, label: '黄色' }
    ];
    
    let colorY = 120;
    const colorButtons: Phaser.GameObjects.Text[] = [];
    
    colorOptions.forEach((option, index) => {
      colorY += 25;
      const colorBtn = this.scene.add.text(70, colorY, option.label, { 
        fontSize: '14px', 
        color: '#ffffff',
        backgroundColor: `#${option.color.toString(16).padStart(6, '0')}`,
        padding: { x: 8, y: 4 }
      }).setInteractive();
      
      colorBtn.on('pointerdown', () => {
        platform.setColor(option.color);
        this.updatePlatformsData();
        
        colorButtons.forEach(btn => {
          btn.setStyle({ 
            fontSize: '14px', 
            color: '#ffffff',
            backgroundColor: `#${colorOptions[colorButtons.indexOf(btn)].color.toString(16).padStart(6, '0')}`,
            padding: { x: 8, y: 4 }
          });
        });
        
        colorBtn.setStyle({ 
          fontSize: '14px', 
          color: '#ffffff',
          backgroundColor: `#${option.color.toString(16).padStart(6, '0')}`,
          padding: { x: 8, y: 4 },
          stroke: '#ffffff',
          strokeThickness: 2
        });
      });
      
      if (option.color === tint) {
        colorBtn.setStyle({ 
          fontSize: '14px', 
          color: '#ffffff',
          backgroundColor: `#${option.color.toString(16).padStart(6, '0')}`,
          padding: { x: 8, y: 4 },
          stroke: '#ffffff',
          strokeThickness: 2
        });
      }
      
      colorButtons.push(colorBtn);
      if (this.propertiesGui) {
        this.propertiesGui.add(colorBtn);
      }
    });
    
    const physicsLabel = this.scene.add.text(10, colorY + 35, '物理:', { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    
    const physicsToggle = this.scene.add.text(70, colorY + 35, hasPhysics ? '启用' : '禁用', { 
      fontSize: '14px', 
      color: hasPhysics ? '#00ff00' : '#ff0000',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    }).setInteractive();
    
    physicsToggle.on('pointerdown', () => {
      const newState = !hasPhysics;
      platform.togglePhysics(newState);
      physicsToggle.setText(newState ? '启用' : '禁用');
      physicsToggle.setStyle({ 
        fontSize: '14px', 
        color: newState ? '#00ff00' : '#ff0000',
        backgroundColor: '#333333',
        padding: { x: 8, y: 4 }
      });
      this.updatePlatformsData();
    });
    
    widthMinusBtn.on('pointerdown', () => {
      const newWidth = Math.max(32, width - 32);
      platform.resize(newWidth, height);
      widthText.setText(newWidth.toString());
      this.updatePlatformsData();
    });
    
    widthPlusBtn.on('pointerdown', () => {
      const newWidth = Math.min(512, width + 32);
      platform.resize(newWidth, height);
      widthText.setText(newWidth.toString());
      this.updatePlatformsData();
    });
    
    heightMinusBtn.on('pointerdown', () => {
      const newHeight = Math.max(16, height - 16);
      platform.resize(width, newHeight);
      heightText.setText(newHeight.toString());
      this.updatePlatformsData();
    });
    
    heightPlusBtn.on('pointerdown', () => {
      const newHeight = Math.min(256, height + 16);
      platform.resize(width, newHeight);
      heightText.setText(newHeight.toString());
      this.updatePlatformsData();
    });
    
    this.propertiesGui.add([
      sizeLabel, 
      widthMinusBtn, widthText, widthPlusBtn,
      heightMinusBtn, heightText, heightPlusBtn,
      colorLabel,
      physicsLabel, physicsToggle
    ]);
    
    this.propertiesGui.setScrollFactor(0);
  }
} 