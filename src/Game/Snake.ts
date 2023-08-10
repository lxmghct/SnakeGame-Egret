/**
 * Snake.ts
 */


/**
 * SnakeNode
 */
class SnakeNode extends egret.DisplayObjectContainer {
    private size: number;
    private type: string;
    private nodeData: object;
    private node: egret.DisplayObject;
    public constructor(size: number, type: string, nodeData: object) {
        super();
        this.size = size;
        this.type = type;
        this.nodeData = nodeData;
        this.nodeData["size"] = size;
        this.nodeData["type"] = type;
        this.init();
    }

    private init() {
        const node: egret.DisplayObject = CircleDisplayObjectFactory.createObject(this.nodeData);
        this.addChild(node);
        if (node.mask) {
            this.addChild(node.mask as egret.DisplayObject);
        }
        this.node = node;
        this.changeSize(this.size);
    }

    public changeSize(size: number) {
        const changeObjectSize = (object: egret.DisplayObject, size: number) => {
            object.width = size;
            object.height = size;
        }
        this.size = size;
        this.nodeData["size"] = size;
        this.anchorOffsetX = size / 2;
        this.anchorOffsetY = size / 2;
        changeObjectSize(this.node, size);
        changeObjectSize(this, size)
        const mask = this.node.mask as egret.Shape;
        if (mask) {
            mask.graphics.clear();
            mask.graphics.beginFill(0x000000);
            mask.graphics.drawCircle(size / 2, size / 2, size / 2);
            mask.graphics.endFill();
        }
        if (this.type == "animation") {
            this.node.x = size / 2;
            this.node.y = size / 2;
            const armatureDisplay = this.node as dragonBones.EgretArmatureDisplay;
            armatureDisplay.scaleX = size / armatureDisplay.measuredWidth;
            armatureDisplay.scaleY = size / armatureDisplay.measuredHeight;
        }
    }

    public changeAnimation(animationName: string) {
        if (this.type != "animation" || !(this.node instanceof dragonBones.EgretArmatureDisplay)) {
            return;
        }
        const armatureDisplay: dragonBones.EgretArmatureDisplay = this.node as dragonBones.EgretArmatureDisplay;
        if (armatureDisplay.animation.hasAnimation(animationName)) {
            armatureDisplay.animation.play(animationName);
        }
    }

    public static createNodeData(type: string, size: number, nameOrColor: string|number): object {
        let nodeData: object = {
            "type": type,
            "size": size
        };
        if (type == "shape") {
            nodeData["color"] = nameOrColor;
        } else {
            nodeData["name"] = nameOrColor;
        }
        return nodeData;
    }
    
}

/**
 * Snake类，由多个SnakeNode组成
 */
class Snake {
    private parent: egret.DisplayObjectContainer;
    private speed: number;
    private vx: number;
    private vy: number;
    private snakeNodes: Array<SnakeNode>;
    private snakeDatas: Array<object>;
    private path: Array<Array<number>>;
    private nodeSize: number;
    private posCountOfNode: number;

    public constructor(parent: egret.DisplayObjectContainer, size: number, snakeDatas?: Array<object>) {
        this.parent = parent;
        this.nodeSize = size;
        if (snakeDatas) {
            this.snakeDatas = snakeDatas;
        } else {
            this.snakeDatas = [
                SnakeNode.createNodeData("animation", size, "liruolingxiao"),
                SnakeNode.createNodeData("shape", size, 0x00ff00)
            ]
        }
        this.init();
    }

    private init() {
        this.speed = 3;
        let headNode: SnakeNode = new SnakeNode(this.nodeSize, this.snakeDatas[0]["type"], this.snakeDatas[0]);
        this.snakeNodes = [headNode];
        this.parent.addChild(headNode);
        this.path = new Array<Array<number>>();
    }

    private updatePath() {
        this.posCountOfNode = Math.floor(this.nodeSize / this.speed);
        // 线性插值重新计算路径
        const newPoints = [];
        const originalPoints = this.path;
        const numNewPoints = this.posCountOfNode * (this.snakeNodes.length - 1);
        for (let i = 0; i < numNewPoints; i++) {
            const index = i / (numNewPoints - 1) * (originalPoints.length - 1);
            const index1 = Math.floor(index);
            const index2 = Math.min(index + 1, originalPoints.length - 1);
            const t = index - index1;
            const x = originalPoints[index1][0] * (1 - t) + originalPoints[index2][0] * t;
            const y = originalPoints[index1][1] * (1 - t) + originalPoints[index2][1] * t;
            newPoints.push([x, y]);
        }
        this.path = newPoints;
    }

    public setPositon(x: number, y: number) {
        for (const node of this.snakeNodes) {
            node.x = x;
            node.y = y;
        }
        this.path = [];
        for (let i = 0; i < this.posCountOfNode * (this.snakeNodes.length - 1); i++) {
            this.path.push([x, y]);
        }
        this.updatePath();
    }

    public setSpeed(speed: number) {
        this.speed = speed;
        if (speed > 0) {
            this.updatePath();
        }
    }

    public move() {
        this.snakeNodes[0].x += this.vx;
        this.snakeNodes[0].y += this.vy;
        this.path.unshift([this.snakeNodes[0].x, this.snakeNodes[0].y]);
        for (let i = 1; i < this.snakeNodes.length; i++) {
            const node = this.snakeNodes[i];
            const pos = this.path[i * this.posCountOfNode];
            node.x = pos[0];
            node.y = pos[1];
        }
        this.path.pop();
    }

    public changeDirection(vx: number, vy: number) {
        const temp = Math.sqrt(vx * vx + vy * vy);
        this.vx = vx / temp * this.speed;
        this.vy = vy / temp * this.speed;
    }

    public addNode() {
        const lastNode = this.snakeNodes[this.snakeNodes.length - 1];
        const nodeData = this.snakeDatas[1];
        const newNode = new SnakeNode(this.nodeSize, nodeData["type"], nodeData);
        newNode.x = lastNode.x;
        newNode.y = lastNode.y;
        this.snakeNodes.push(newNode);
        this.parent.addChildAt(newNode, 0);
        for (let i = 0; i < this.posCountOfNode; i++) {
            this.path.push([newNode.x, newNode.y]);
        }
    }

    public popNode() {
        const lastNode = this.snakeNodes.pop();
        this.parent.removeChild(lastNode);
        for (let i = 0; i < this.posCountOfNode; i++) {
            this.path.pop();
        }
    }

    public setLength(length: number) {
        if (length < 0) {
            return;
        }
        while (this.snakeNodes.length < length) {
            this.addNode();
        }
        while (this.snakeNodes.length > length) {
            this.popNode();
        }
    }

}
