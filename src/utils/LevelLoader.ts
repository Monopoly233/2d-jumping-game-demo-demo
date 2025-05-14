import { LevelScene } from '../scenes/LevelScene';
import { Portal } from '../entities/Portal';

// 平台数据接口
export interface PlatformData {
  x: number;
  y: number;
  tint: string;
  width?: number;
  height?: number;
  hasPhysics?: boolean;
}

// 传送门数据接口
export interface PortalData {
  x: number;
  y: number;
  targetScene: string;
  tint: string;
}

// 场景数据接口
export interface LevelData {
  key: string;
  name: string;
  index: number;
  backgroundColor: string;
  width: number;
  height: number;
  player: {
    x: number;
    y: number;
  };
  ground: {
    height: number;
    tint: string;
  };
  platforms: Array<PlatformData>;
  portals: Array<PortalData>;
  helpText: string;
}

export class LevelLoader {
  private static instance: LevelLoader;
  private sceneData: Map<string, LevelData> = new Map();
  private jsonData: any = null;

  // 单例模式
  private constructor() {}

  public static getInstance(): LevelLoader {
    if (!LevelLoader.instance) {
      LevelLoader.instance = new LevelLoader();
    }
    return LevelLoader.instance;
  }

  // 预加载JSON文件
  public preload(scene: Phaser.Scene): void {
    scene.load.json('levelsData', './data/levels.json');
  }

  // 初始化 - 从已加载的JSON中提取数据
  public init(scene: Phaser.Scene): void {
    try {
      // 获取JSON数据
      this.jsonData = scene.cache.json.get('levelsData');
      
      if (!this.jsonData || !this.jsonData.scenes) {
        console.error('levels.json数据无效或不包含scenes数组');
        return;
      }

      // 清除当前数据
      this.sceneData.clear();

      // 缓存所有场景数据到Map
      this.jsonData.scenes.forEach((scene: LevelData) => {
        this.sceneData.set(scene.key, scene);
      });

      console.log(`成功加载${this.sceneData.size}个场景数据`);
    } catch (error) {
      console.error('初始化场景数据失败:', error);
    }
  }

  // 获取特定场景的数据
  public getLevelData(sceneKey: string): LevelData | undefined {
    return this.sceneData.get(sceneKey);
  }

  // 应用场景数据到LevelScene实例
  public applyToScene(levelScene: LevelScene): void {
    const sceneKey = levelScene.getSceneName();
    const data = this.getLevelData(sceneKey);
    
    if (!data) {
      console.warn(`未找到场景 ${sceneKey} 的数据`);
      return;
    }

    // 应用基本属性
    levelScene.setSceneIndex(data.index);
    levelScene.setSceneSize(data.width, data.height);
    levelScene.setBackgroundColor(parseInt(data.backgroundColor));
    levelScene.setPlayerSpawn(data.player.x, data.player.y);
    levelScene.setGroundProperties(data.ground.height, parseInt(data.ground.tint));
    levelScene.setHelpText(data.helpText);
    
    // 传递平台和传送门数据以便创建
    levelScene.setPlatforms(data.platforms);
    levelScene.setPortals(data.portals);
  }

  // 保存编辑过的场景数据到本地存储
  public saveEditedLevel(sceneKey: string, editedData: any): void {
    const key = `editedLevel_${sceneKey}`;
    localStorage.setItem(key, JSON.stringify(editedData));
    console.log(`保存编辑的场景数据 ${sceneKey}`);
  }

  // 加载编辑过的场景数据
  public loadEditedLevel(sceneKey: string): any {
    const key = `editedLevel_${sceneKey}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('解析编辑的场景数据失败:', error);
      }
    }
    return null;
  }

  // 获取所有场景键值
  public getAllSceneKeys(): string[] {
    return Array.from(this.sceneData.keys());
  }

  // 清除编辑的场景数据
  public clearEditedLevel(sceneKey: string): void {
    const key = `editedLevel_${sceneKey}`;
    localStorage.removeItem(key);
    console.log(`已清除场景 ${sceneKey} 的编辑数据`);
  }
} 