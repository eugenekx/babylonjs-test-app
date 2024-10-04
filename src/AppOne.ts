import * as BABYLON from "babylonjs";
import { CharacterController } from "babylonjs-charactercontroller";

export class App {
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this._engine = new BABYLON.Engine(canvas);
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
        this._scene = createScene(this._engine, this.canvas);
    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this._scene.debugLayer.show({ overlay: true });
        } else {
            this._scene.debugLayer.hide();
        }
    }

    run() {
        this.debug(true);
    }
}

function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.75, 0.75, 0.75, 1);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);

    scene.createDefaultEnvironment();
    scene.createDefaultLight();

    createGround(scene);

    loadPlayer(scene, engine, canvas);

    return scene;
}

function loadPlayer(
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
) {
    BABYLON.SceneLoader.ImportMesh(
        "",
        "assets/player/",
        "Vincent.babylon",
        scene,
        (meshes, particleSystems, skeletons) => {
            const player = meshes[0];
            const skeleton = skeletons[0];
            player.skeleton = skeleton;

            skeleton.enableBlending(0.1);

            const sm = <BABYLON.StandardMaterial>player.material;
            if (sm.diffuseTexture != null) {
                sm.backFaceCulling = true;
                sm.ambientColor = new BABYLON.Color3(1, 1, 1);
            }

            player.position = new BABYLON.Vector3(0, 12, 0);
            player.checkCollisions = true;
            player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
            player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

            //rotate the camera behind the player
            const alpha = -player.rotation.y - 4.69;
            const beta = Math.PI / 2.5;
            const target = new BABYLON.Vector3(
                player.position.x,
                player.position.y + 1.5,
                player.position.z
            );

            const camera = new BABYLON.ArcRotateCamera(
                "ArcRotateCamera",
                alpha,
                beta,
                5,
                target,
                scene
            );

            camera.wheelPrecision = 15;
            camera.checkCollisions = false;

            camera.keysLeft = [];
            camera.keysRight = [];
            camera.keysUp = [];
            camera.keysDown = [];

            camera.lowerRadiusLimit = 2;

            camera.upperRadiusLimit = 20;
            camera.attachControl(canvas, false);

            const cc = new CharacterController(
                <BABYLON.Mesh>player,
                camera,
                scene
            );

            cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

            cc.setNoFirstPerson(false);
            cc.setStepOffset(0.4);
            cc.setSlopeLimit(30, 60);

            cc.setIdleAnim("idle", 1, true);
            cc.setTurnLeftAnim("turnLeft", 0.5, true);
            cc.setTurnRightAnim("turnRight", 0.5, true);
            cc.setWalkBackAnim("walkBack", 0.5, true);
            cc.setIdleJumpAnim("idleJump", 0.5, false);
            cc.setRunJumpAnim("runJump", 0.6, false);
            cc.setFallAnim(null, 2, false);
            cc.setSlideBackAnim("slideBack", 1, false);

            cc.start();

            engine.runRenderLoop(function () {
                scene.render();
            });
        }
    );
}

function createGround(scene: BABYLON.Scene) {
    const grnd = BABYLON.CreateGround(
        "ground",
        { width: 128, height: 128 },
        scene
    );
    grnd.checkCollisions = true;

    const gMat = new BABYLON.StandardMaterial("groundMat", scene);
    gMat.alpha = 0.0;

    grnd.material = gMat;
}
