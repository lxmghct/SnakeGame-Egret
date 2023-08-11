/**
 * 操控杆
 */

class JoyStick extends egret.DisplayObjectContainer {
    private joyStickArea: egret.Shape;
    private joystick: egret.Shape;
    private size: number;
    private callback: Function;

    private isDragging: boolean = false;

    constructor(size: number = 200, callback: Function = null) {
        super();
        this.size = size;
        this.callback = callback;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        this.createJoystick();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
    }

    private createJoystick(): void {
        this.joyStickArea = new egret.Shape();
        this.addChild(this.joyStickArea);
        this.joystick = new egret.Shape();
        this.addChild(this.joystick);
        this.changeSize(this.size);
    }

    public changeSize(size: number) {
        this.size = size;
        this.joyStickArea.graphics.clear();
        this.joyStickArea.graphics.beginFill(0xff0000, 0.5);
        this.joyStickArea.graphics.drawCircle(0, 0, this.size / 2);
        this.joyStickArea.graphics.endFill();
        this.joystick.graphics.clear();
        this.joystick.graphics.beginFill(0xFFFFFF);
        this.joystick.graphics.drawCircle(0, 0, this.size / 4);
        this.joystick.graphics.endFill();
    }

    private moveJoystick(x: number, y: number, duration: number = 150, callFunc: boolean = true): void {
        egret.Tween.removeTweens(this.joystick);
        if (duration > 0) {
            egret.Tween.get(this.joystick).to({ x: x, y: y }, duration, egret.Ease.backOut);
        } else {
            this.joystick.x = x;
            this.joystick.y = y;
        }
        if (this.callback && callFunc) {
            this.callback(x, y, this.size / 2);
        }
    }

    private onTouchBegin(event: egret.TouchEvent): void {
        if (this.joyStickArea.hitTestPoint(event.stageX, event.stageY)) {
            this.isDragging = true;
            this.moveJoystick(event.stageX -this.x, event.stageY - this.y);
        }
    }

    private onTouchMove(event: egret.TouchEvent): void {
        if (!this.isDragging) {
            return;
        }
        let distance = egret.Point.distance(new egret.Point(this.joyStickArea.x, this.joyStickArea.y), new egret.Point(event.stageX - this.x, event.stageY - this.y));
        if (distance > this.size / 2) {
            let angle = Math.atan2(event.stageY - this.y - this.joyStickArea.y, event.stageX - this.x - this.joyStickArea.x);
            this.moveJoystick(this.joyStickArea.x + Math.cos(angle) * this.size / 2, this.joyStickArea.y + Math.sin(angle) * this.size / 2, 0);
        } else {
            this.moveJoystick(event.stageX - this.x, event.stageY - this.y, 0);
        }
    }

    private onTouchEnd(event: egret.TouchEvent): void {
        this.isDragging = false;
        this.moveJoystick(this.joyStickArea.x, this.joyStickArea.y, 150, false);
    }
}