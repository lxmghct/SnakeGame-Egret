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

    public static getRes(key: string, type: string = "image"): any {
        if (ResourceCache.cache[key] == undefined) {
            if (type == "dragonBoneFactory") {
                const dragonbonesData = RES.getRes(key + "_dbbin");
                const textureData = RES.getRes(key + "_json");
                const texture = RES.getRes(key + "_png");
                const egretFactory: dragonBones.EgretFactory = new dragonBones.EgretFactory();
                egretFactory.parseDragonBonesData(dragonbonesData);
                egretFactory.parseTextureAtlasData(textureData, texture);
                ResourceCache.cache[key] = egretFactory;
            } else {
                ResourceCache.cache[key] = RES.getRes(key);
            }
        }
        return ResourceCache.cache[key];
    }

    public static clear(): void {
        ResourceCache.cache = {};
    }
}

class DisplayObjectFactory {

    protected static adaptSize(displayObject: egret.DisplayObject, size: number): void {
        if (size > 0) {
            displayObject.width = size;
            displayObject.height = size;
        }
    }

    public static createBitmap(name: string, size: number = 0): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        result.texture = ResourceCache.getRes(name);
        DisplayObjectFactory.adaptSize(result, size);
        return result;
    }

    public static createAnimation(resourceName: string, armatureName: string = "", animationName: string = "", size: number = 0): dragonBones.EgretArmatureDisplay {
        const factory: dragonBones.EgretFactory = ResourceCache.getRes(resourceName, "dragonBoneFactory")
        const allDragonBonesData = factory.getAllDragonBonesData();
        console.log(allDragonBonesData);
        const keys = Object.keys(allDragonBonesData);
        if (!keys || keys.length == 0) {
            console.error("dragonBonesData is empty");
            return null;
        }
        const dragonBonesData = keys.indexOf(armatureName) >= 0 ? allDragonBonesData[armatureName] : allDragonBonesData[keys[0]];
        const armatureNames = dragonBonesData.armatureNames;
        if (!armatureNames || armatureNames.length == 0) {
            console.error("armatureNames is empty");
            return null;
        }
        armatureName = armatureNames.indexOf(armatureName) >= 0 ? armatureName : armatureNames[0];
        const armatureDisplay: dragonBones.EgretArmatureDisplay = factory.buildArmatureDisplay(armatureName);
        const animationNames = armatureDisplay.animation.animationNames;
        if (animationNames && animationNames.length > 0) {
            animationName = animationNames.indexOf(animationName) >= 0 ? animationName : animationNames[0];
            armatureDisplay.animation.play(animationName);
        }
        DisplayObjectFactory.adaptSize(armatureDisplay, size);
        return armatureDisplay;
    }

    public static createShape(color: number, size: number = 0): egret.Shape {
        const shape: egret.Shape = new egret.Shape();
        shape.graphics.beginFill(color);
        shape.graphics.drawRect(0, 0, size, size);
        shape.graphics.endFill();
        DisplayObjectFactory.adaptSize(shape, size);
        return shape;
    }

    public static createObject(objectData: object): egret.DisplayObject {
        if (!objectData) {
            return null;
        }
        const type = objectData["type"];
        const size = objectData["size"];
        if (type == "bitmap") {
            return DisplayObjectFactory.createBitmap(objectData["name"], size);
        } else if (type == "animation") {
            return DisplayObjectFactory.createAnimation(objectData["name"], size, objectData["armatureName"], objectData["animationName"]);
        } else if (type == "shape") {
            return DisplayObjectFactory.createShape(objectData["color"], size);
        }
    }

}

class CircleDisplayObjectFactory extends DisplayObjectFactory {

    private static createCircleMask(displayObject: egret.DisplayObject, size: number): egret.Shape {
        const mask: egret.Shape = new egret.Shape();
        mask.graphics.beginFill(0x000000);
        mask.graphics.drawCircle(size / 2, size / 2, size / 2);
        mask.graphics.endFill();
        displayObject.mask = mask;
        return mask;
    }
    
    public static createBitmap(name: string, size: number = 0): egret.Bitmap {
        const bitmap: egret.Bitmap = super.createBitmap(name, size);
        CircleDisplayObjectFactory.createCircleMask(bitmap, size);
        return bitmap;
    }

    public static createAnimation(resourceName: string, armatureName: string = "", animationName: string = "", size: number = 0): dragonBones.EgretArmatureDisplay {
        const animation: dragonBones.EgretArmatureDisplay = super.createAnimation(resourceName, armatureName, animationName, size);
        CircleDisplayObjectFactory.createCircleMask(animation, size);
        return animation;
    }

    public static createShape(color: number, size: number = 0): egret.Shape {
        const shape: egret.Shape = super.createShape(color, size);
        CircleDisplayObjectFactory.createCircleMask(shape, size);
        return shape;
    }

    public static createObject(objectData: object) {
        const object: egret.DisplayObject = super.createObject(objectData);
        if (object) {
            CircleDisplayObjectFactory.createCircleMask(object, objectData["size"]);
        }
        return object;
    }

}
