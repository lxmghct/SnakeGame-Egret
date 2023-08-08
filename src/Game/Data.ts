/**
 * Data.ts
 * 用于存放游戏中的数据
 */

class ResourceCache {
    public static cache: Object = {};

    public static getExistingRes(key: string): any {
        return ResourceCache.cache[key];
    }

    public static setRes(key: string, value: any): void {
        ResourceCache.cache[key] = value;
    }

    public static getRes(key: string): any {
        if (ResourceCache.cache[key] == undefined) {
            ResourceCache.cache[key] = RES.getRes(key);
        }
        return ResourceCache.cache[key];
    }

    public static clear(): void {
        ResourceCache.cache = {};
    }
}
