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
  private editableObjects: Phaser.GameObjects.GameObject[] = [];
  private selectedObject: Phaser.GameObjects.GameObject | null = null;
  private gridSize: number = 32;
  private gridSprite!: Phaser.GameObjects.Graphics;
  private objects: any[] = [];
  private currentObjectType: string = 'platform';
  private ghostObject: Phaser.GameObjects.Sprite | null = null;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySave!: Phaser.Input.Keyboard.Key;
  private keyLoad!: Phaser.Input.Keyboard.Key;
  private keyTab!: Phaser.Input.Keyboard.Key;
  private keyPlus!: Phaser.Input.Keyboard.Key;
  private keyMinus!: Phaser.Input.Keyboard.Key;
  private mousePlaceKey!: Phaser.Input.Keyboard.Key;
  private mouseDeleteKey!: Phaser.Input.Keyboard.Key;
  private editorGui: Phaser.GameObjects.Container | null = null;
  private propertiesGui: Phaser.GameObjects.Container | null = null;
  
  // 平台编辑器默认设置
  private platformOptions: PlatformEditorOptions = {
    width: 128,
    height: 32,
    tint: 0x00ff00,
    hasPhysics: true
  };
  
  // 摄像机移动控制
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private cameraSpeed: number = 20;
  
  constructor(scene: LevelScene) {
    this.scene = scene;
    this.gridSprite = this.scene.add.graphics();
    this.gridSprite.depth = -1;
    
    // 创建空白纹理作为Ghost对象
    this.scene.textures.createCanvas('ghostPlatform', 128, 32);
    
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown-E', this.toggleEditor, this);
      this.scene.input.keyboard.on('keydown-TAB', this.togglePlacementType, this);
      this.scene.input.keyboard.on('keydown-S', this.saveLevel, this);
      this.scene.input.keyboard.on('keydown-L', this.loadLevel, this);
    }
    
    if (this.scene.input) {
      this.scene.input.on('pointerdown', this.handleMouseClick, this);
      this.scene.input.on('pointermove', this.updateGhostObject, this);
    }

    // 初始化方向键控制
    if (this.scene.input && this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }
    
    this.createGrid();
  }
  
  private createGrid(): void {
    // 创建网格
    this.gridSprite = this.scene.add.graphics();
    this.gridSprite.lineStyle(1, 0xffffff, 0.2);
    
    // 默认不显示
    this.gridSprite.setVisible(false);
    this.drawGrid();
  }
  
  private drawGrid(): void {
    // 清除之前的网格
    this.gridSprite.clear();
    this.gridSprite.lineStyle(1, 0xffffff, 0.2);
    
    // 绘制新网格
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
      this.createEditorGUI();
      
      // 创建幽灵对象
      this.createGhostObject();
      
      // 加载现有对象以便编辑
      this.loadExistingObjects();
      
      // 停止摄像机跟随
      this.scene.cameras.main.stopFollow();
    } else {
      console.log('编辑器已禁用');
      
      // 销毁幽灵对象
      if (this.ghostObject) {
        this.ghostObject.destroy();
        this.ghostObject = null;
      }
      
      // 销毁编辑器GUI
      if (this.editorGui) {
        this.editorGui.destroy();
        this.editorGui = null;
      }
      
      // 销毁属性编辑器
      if (this.propertiesGui) {
        this.propertiesGui.destroy();
        this.propertiesGui = null;
      }
      
      // 清除选中对象
      if (this.selectedObject) {
        // clearTint方法只存在于Sprite对象上
        if (this.selectedObject instanceof Phaser.GameObjects.Sprite) {
          this.selectedObject.clearTint();
        }
        this.selectedObject = null;
      }
      
      // 恢复摄像机跟随玩家
      const player = this.scene.getPlayer();
      if (player) {
        this.scene.cameras.main.startFollow(player);
      }
    }
  }
  
  private createEditorGUI(): void {
    // 销毁之前的GUI
    if (this.editorGui) {
      this.editorGui.destroy();
    }
    
    // 创建新的GUI容器
    this.editorGui = this.scene.add.container(10, 150);
    
    // 背景
    const bg = this.scene.add.rectangle(0, 0, 200, 200, 0x000000, 0.7);
    bg.setOrigin(0, 0);
    this.editorGui.add(bg);
    
    // 标题
    const title = this.scene.add.text(10, 10, '编辑器工具', { 
      fontSize: '16px', 
      color: '#ffffff',
      fontStyle: 'bold' 
    });
    this.editorGui.add(title);
    
    // 当前对象类型
    const objectTypeText = this.scene.add.text(10, 40, `对象类型: ${this.currentObjectType}`, { 
      fontSize: '14px', 
      color: '#ffff00' 
    });
    this.editorGui.add(objectTypeText);
    
    // 网格大小
    const gridSizeText = this.scene.add.text(10, 70, `网格大小: ${this.gridSize}`, { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    this.editorGui.add(gridSizeText);
    
    // 控制提示
    const controls = this.scene.add.text(10, 100, 
      'E: 开关编辑器\n' +
      'Tab: 切换对象\n' +
      '+/-: 调整网格\n' +
      'S: 保存\n' +
      'L: 加载\n' +
      '空格/左键: 放置\n' +
      'Del/右键: 删除', 
      { fontSize: '12px', color: '#aaaaff' }
    );
    this.editorGui.add(controls);
    
    // 固定到屏幕
    this.editorGui.setScrollFactor(0);
  }
  
  private createGhostObject(): void {
    if (this.ghostObject) {
      this.ghostObject.destroy();
    }
    
    // 根据当前选择的对象类型创建幽灵对象
    this.ghostObject = this.scene.add.sprite(0, 0, this.currentObjectType === 'portal' ? 'portal' : 'platform');
    this.ghostObject.setAlpha(0.5);
    this.ghostObject.setVisible(this.enabled);
    
    if (this.currentObjectType === 'portal') {
      this.ghostObject.setTint(0x00ffff);
    } else {
      this.ghostObject.setTint(0x00ff00);
    }
  }
  
  private updateGhostObject(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.ghostObject) return;
    
    // 获取世界坐标
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    
    // 吸附到网格
    const snappedX = Math.floor(worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
    const snappedY = Math.floor(worldY / this.gridSize) * this.gridSize + this.gridSize / 2;
    
    // 更新幽灵对象位置
    this.ghostObject.setPosition(snappedX, snappedY);
  }
  
  private handleMouseClick(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;
    
    // 获取网格吸附的位置
    const snappedX = Math.floor(pointer.worldX / this.gridSize) * this.gridSize + this.gridSize / 2;
    const snappedY = Math.floor(pointer.worldY / this.gridSize) * this.gridSize + this.gridSize / 2;
    
    // 左键添加对象
    if (pointer.leftButtonDown() || (this.mousePlaceKey && this.mousePlaceKey.isDown)) {
      this.placeObject(snappedX, snappedY);
    }
    
    // 右键删除对象
    if (pointer.rightButtonDown() || (this.mouseDeleteKey && this.mouseDeleteKey.isDown)) {
      this.deleteObject(snappedX, snappedY);
    }
  }
  
  private placeObject(x: number, y: number): void {
    // 根据当前选择的对象类型创建实际对象
    if (this.currentObjectType === 'platform') {
      // 使用Platform类创建平台
      const platform = new Platform(
        this.scene, 
        x, 
        y, 
        this.platformOptions.width,
        this.platformOptions.height,
        this.platformOptions.tint,
        this.platformOptions.hasPhysics
      );
      
      // 添加到静态组
      this.scene.physics.add.existing(platform, true);
      
      // 添加到可编辑对象列表
      this.editableObjects.push(platform);
      
      // 添加点击事件用于选中
      platform.setInteractive();
      platform.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // 右键删除，左键选中
        if (pointer.rightButtonDown()) {
          this.deleteObject(platform.x, platform.y);
        } else if (pointer.leftButtonDown()) {
          this.selectObject(platform);
        }
      });
      
      // 更新平台数据
      this.updatePlatformsData();
    } else if (this.currentObjectType === 'portal') {
      // 创建传送门
      const sceneNames = ['Level1Scene', 'Level2Scene'];
      const currentSceneName = this.scene.getSceneName();
      const targetScene = currentSceneName === 'Level1Scene' ? 'Level2Scene' : 'Level1Scene';
      
      const portal = new Portal(this.scene, x, y, targetScene);
      this.scene.add.existing(portal);
      portal.setData('type', 'portal');
      portal.setData('x', x);
      portal.setData('y', y);
      portal.setData('targetScene', targetScene);
      portal.setData('tint', "0x00ffff");
      
      // 添加到可编辑对象列表
      this.editableObjects.push(portal);
      
      // 添加点击事件用于选中
      portal.setInteractive();
      portal.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // 右键删除，左键选中
        if (pointer.rightButtonDown()) {
          this.deleteObject(portal.x, portal.y);
        } else {
          // 传送门暂时没有编辑属性，所以左键也是删除
          this.deleteObject(portal.x, portal.y);
        }
      });
      
      // 更新传送门数据
      this.updatePortalsData();
    }
  }
  
  private deleteObject(x: number, y: number): void {
    // 查找要删除的对象（在指定位置附近）
    const tolerance = this.gridSize / 2;
    
    for (let i = this.editableObjects.length - 1; i >= 0; i--) {
      const obj = this.editableObjects[i];
      const objX = obj.getData('x') || (obj as any).x;
      const objY = obj.getData('y') || (obj as any).y;
      
      // 检查对象是否在指定位置附近
      if (Math.abs(objX - x) <= tolerance && Math.abs(objY - y) <= tolerance) {
        // 移除对象
        obj.destroy();
        this.editableObjects.splice(i, 1);
        
        // 更新数据
        this.updatePlatformsData();
        this.updatePortalsData();
        
        break;
      }
    }
  }
  
  private updatePlatformsData(): void {
    // 更新平台数据
    const platformsData: Array<PlatformData> = [];
    
    this.editableObjects.forEach(obj => {
      if (obj.getData('type') === 'platform') {
        const platform = obj as Platform;
        platformsData.push({
          x: platform.x,
          y: platform.y,
          width: platform.getData('width'),
          height: platform.getData('height'),
          tint: "0x" + (platform.getData('tint') || "00ff00"),
          hasPhysics: platform.getData('hasPhysics')
        });
      }
    });
    
    // 更新LevelScene中的平台数据
    this.scene.setPlatforms(platformsData);
  }
  
  private updatePortalsData(): void {
    // 更新传送门数据
    const portalsData: Array<PortalData> = [];
    
    this.editableObjects.forEach(obj => {
      if (obj.getData('type') === 'portal') {
        // 由于getNextSceneName是protected方法，使用存储的targetScene数据
        const targetScene = obj.getData('targetScene') || 
          (this.scene.getSceneName() === 'Level1Scene' ? 'Level2Scene' : 'Level1Scene');
        
        portalsData.push({
          x: obj.getData('x') || (obj as any).x,
          y: obj.getData('y') || (obj as any).y,
          targetScene: targetScene,
          tint: obj.getData('tint') || "0x00ffff"
        });
      }
    });
    
    // 更新LevelScene中的传送门数据
    this.scene.setPortals(portalsData);
  }
  
  private changeGridSize(newSize: number): void {
    // 限制网格大小在合理范围内
    this.gridSize = Math.max(16, Math.min(128, newSize));
    console.log(`网格大小: ${this.gridSize}`);
    
    // 重绘网格
    this.drawGrid();
    
    // 更新UI
    if (this.editorGui) {
      // 找到网格大小文本
      const gridSizeText = this.editorGui.getAt(3) as Phaser.GameObjects.Text;
      if (gridSizeText) {
        gridSizeText.setText(`网格大小: ${this.gridSize}`);
      }
    }
  }
  
  private cycleObjectType(): void {
    // 切换对象类型
    this.currentObjectType = this.currentObjectType === 'platform' ? 'portal' : 'platform';
    console.log(`当前对象类型: ${this.currentObjectType}`);
    
    // 更新幽灵对象
    this.createGhostObject();
    
    // 更新UI
    if (this.editorGui) {
      // 找到对象类型文本
      const objectTypeText = this.editorGui.getAt(2) as Phaser.GameObjects.Text;
      if (objectTypeText) {
        objectTypeText.setText(`对象类型: ${this.currentObjectType}`);
      }
    }
  }
  
  private saveLevel(): void {
    if (!this.enabled) return;
    
    // 保存编辑后的关卡数据
    this.scene.saveEditedLevelData();
    
    console.log('关卡数据已保存');
    
    // 显示保存提示
    const saveText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 50,
      '关卡数据已保存!',
      { fontSize: '24px', color: '#ffff00', backgroundColor: '#000000', padding: { x: 10, y: 5 } }
    );
    saveText.setOrigin(0.5);
    saveText.setScrollFactor(0);
    
    // 2秒后移除提示
    this.scene.time.delayedCall(2000, () => {
      saveText.destroy();
    });
  }
  
  private loadLevel(): void {
    if (!this.enabled) return;
    
    // 重新加载场景
    this.scene.scene.restart();
    
    console.log('重新加载关卡数据');
  }
  
  public update(): void {
    if (this.enabled) {
      // 更新网格位置
      this.drawGrid();
      
      // 摄像机控制逻辑
      if (this.cursors) {
        const camera = this.scene.cameras.main;
        
        if (this.cursors.left?.isDown) {
          camera.scrollX -= this.cameraSpeed;
        }
        if (this.cursors.right?.isDown) {
          camera.scrollX += this.cameraSpeed;
        }
        if (this.cursors.up?.isDown) {
          camera.scrollY -= this.cameraSpeed;
        }
        if (this.cursors.down?.isDown) {
          camera.scrollY += this.cameraSpeed;
        }
      }
    }
  }
  
  // 选中对象以编辑其属性
  private selectObject(obj: Phaser.GameObjects.GameObject): void {
    if (!this.enabled) return;
    
    // 清除之前的选择
    if (this.selectedObject) {
      // clearTint方法只存在于Sprite对象上
      if (this.selectedObject instanceof Phaser.GameObjects.Sprite) {
        this.selectedObject.clearTint();
      }
    }
    
    // 设置新的选择
    this.selectedObject = obj;
    
    // 显示属性编辑器
    if (obj.getData('type') === 'platform') {
      this.showPlatformEditor(obj as Platform);
    }
  }
  
  // 显示平台属性编辑器
  private showPlatformEditor(platform: Platform): void {
    // 销毁之前的属性编辑器
    if (this.propertiesGui) {
      this.propertiesGui.destroy();
    }
    
    // 创建新的属性编辑器容器
    this.propertiesGui = this.scene.add.container(250, 150);
    
    // 背景
    const bg = this.scene.add.rectangle(0, 0, 200, 240, 0x000000, 0.7);
    bg.setOrigin(0, 0);
    this.propertiesGui.add(bg);
    
    // 标题
    const title = this.scene.add.text(10, 10, '平台属性', { 
      fontSize: '18px', 
      color: '#ffffff',
      fontStyle: 'bold' 
    });
    this.propertiesGui.add(title);
    
    // 获取当前平台属性
    const width = platform.getData('width') || 128;
    const height = platform.getData('height') || 32;
    const tint = parseInt(platform.getData('tint') || "00ff00", 16);
    const hasPhysics = platform.getData('hasPhysics') !== undefined ? platform.getData('hasPhysics') : true;
    
    // 尺寸标签
    const sizeLabel = this.scene.add.text(10, 50, '尺寸:', { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    this.propertiesGui.add(sizeLabel);
    
    // 宽度按钮
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
    
    // 高度按钮
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
    
    // 颜色标签
    const colorLabel = this.scene.add.text(10, 120, '颜色:', { 
      fontSize: '14px', 
      color: '#ffffff' 
    });
    
    // 颜色按钮
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
        // 设置平台颜色
        platform.setColor(option.color);
        this.updatePlatformsData();
        
        // 更新所有按钮样式
        colorButtons.forEach(btn => {
          btn.setStyle({ 
            fontSize: '14px', 
            color: '#ffffff',
            backgroundColor: `#${colorOptions[colorButtons.indexOf(btn)].color.toString(16).padStart(6, '0')}`,
            padding: { x: 8, y: 4 }
          });
        });
        
        // 高亮选中的按钮
        colorBtn.setStyle({ 
          fontSize: '14px', 
          color: '#ffffff',
          backgroundColor: `#${option.color.toString(16).padStart(6, '0')}`,
          padding: { x: 8, y: 4 },
          stroke: '#ffffff',
          strokeThickness: 2
        });
      });
      
      // 如果是当前颜色，高亮显示
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
    
    // 物理特性
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
    
    // 按钮事件
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
    
    // 添加所有控件到容器
    this.propertiesGui.add([
      sizeLabel, 
      widthMinusBtn, widthText, widthPlusBtn,
      heightMinusBtn, heightText, heightPlusBtn,
      colorLabel,
      physicsLabel, physicsToggle
    ]);
    
    // 固定到屏幕
    this.propertiesGui.setScrollFactor(0);
  }
  
  // 加载场景中已有的对象，使其可编辑
  private loadExistingObjects(): void {
    // 清除之前的编辑对象列表
    this.editableObjects.forEach(obj => {
      obj.off('pointerdown'); // 移除之前添加的事件
    });
    this.editableObjects = [];
    
    // 处理平台数据
    this.scene.children.list.forEach(obj => {
      if (obj instanceof Platform) {
        // 使平台可交互
        obj.setInteractive();
        obj.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // 右键删除，左键选中
          if (pointer.rightButtonDown()) {
            this.deleteObject(obj.x, obj.y);
          } else if (pointer.leftButtonDown()) {
            this.selectObject(obj);
          }
        });
        this.editableObjects.push(obj);
      } else if (obj instanceof Portal) {
        // 使传送门可交互
        obj.setInteractive();
        obj.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // 右键删除
          if (pointer.rightButtonDown()) {
            this.deleteObject(obj.x, obj.y);
          }
        });
        this.editableObjects.push(obj);
      }
    });
  }
  
  // 禁用编辑器
  private disable(): void {
    this.enabled = false;
    this.gridSprite.setVisible(false);
    
    // 清除可编辑对象
    if (this.ghostObject) {
      this.ghostObject.destroy();
      this.ghostObject = null;
    }
  }
  
  // 切换对象类型
  private togglePlacementType(): void {
    this.currentObjectType = this.currentObjectType === 'platform' ? 'portal' : 'platform';
    
    if (this.ghostObject) {
      this.createGhostObject();
    }
    
    console.log(`对象类型切换为: ${this.currentObjectType}`);
  }
} 