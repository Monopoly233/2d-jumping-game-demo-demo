/**
 * 清除本地缓存数据的工具
 */
export class ClearCache {
  static clearAllLocalStorage(): void {
    // 清除所有localStorage数据
    localStorage.clear();
    console.log('已清除所有localStorage数据');
  }
  
  static clearLevelData(): void {
    // 查找并清除所有关卡相关的localStorage数据
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('editedLevel_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`已删除缓存数据: ${key}`);
    });
    
    console.log(`共清除了 ${keysToRemove.length} 个关卡缓存`);
  }
} 