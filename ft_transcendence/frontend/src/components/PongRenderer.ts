// Modular Babylon.js Pong Renderer
// Separa la creació de l'escena, càmera, materials i llums


export class PongRenderer {
  private BABYLON: any;
  public engine: any;
  public scene: any;
  public camera: any;
  public ball: any;
  public paddleLeft: any;
  public paddleRight: any;
  public ground: any;
  public centerLine: any;
  public light: any;

  private constructor() {}

  public static async create(canvas: HTMLCanvasElement): Promise<PongRenderer> {
    const instance = new PongRenderer();
    await instance.init(canvas);
    return instance;
  }

  private async init(canvas: HTMLCanvasElement) {
    this.BABYLON = await import('@babylonjs/core');
    const B = this.BABYLON;
    this.engine = new B.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new B.Scene(this.engine);
    this.scene.clearColor = new B.Color4(0.03, 0.03, 0.09, 1);

    // Càmera top-down amb FOV suau
    this.camera = new B.FreeCamera('camera', new B.Vector3(0, 22, 0), this.scene);
    this.camera.setTarget(new B.Vector3(0, 0, 0));
    this.camera.rotation.x = Math.PI / 2;
    this.camera.fov = 0.7;
    this.camera.inputs.clear();

    // Llum ambiental i direccional per ombres suaus
    this.light = new B.HemisphericLight('light', new B.Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.95;
    const dirLight = new B.DirectionalLight('dirLight', new B.Vector3(0, -1, 0), this.scene);
    dirLight.intensity = 0.3;
    dirLight.position = new B.Vector3(0, 20, 10);

    // Terra amb gradient
    this.ground = B.MeshBuilder.CreateGround('ground', { width: 16, height: 24 }, this.scene);
    const groundMat = new B.StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new B.Color3(0.08, 0.18, 0.22);
    groundMat.specularColor = new B.Color3(0.1, 0.3, 0.4);
    groundMat.emissiveColor = new B.Color3(0.01, 0.05, 0.08);
    this.ground.material = groundMat;

    // Línia central amb emissive
    this.centerLine = B.MeshBuilder.CreateBox('centerLine', { width: 0.12, height: 0.1, depth: 24 }, this.scene);
    const centerMat = new B.StandardMaterial('centerMat', this.scene);
    centerMat.diffuseColor = new B.Color3(1, 1, 1);
    centerMat.emissiveColor = new B.Color3(0.5, 0.5, 1);
    this.centerLine.material = centerMat;

    // Pilota amb emissive i specular
    this.ball = B.MeshBuilder.CreateSphere('ball', { diameter: 0.5 }, this.scene);
    const ballMat = new B.StandardMaterial('ballMat', this.scene);
    ballMat.diffuseColor = new B.Color3(1, 1, 1);
    ballMat.emissiveColor = new B.Color3(0.3, 0.3, 0.5);
    ballMat.specularPower = 128;
    this.ball.material = ballMat;
    this.ball.position.y = 0.5;

    // Pales amb colors vius i emissive
    this.paddleLeft = B.MeshBuilder.CreateBox('paddleL', { width: 0.3, height: 0.5, depth: 2 }, this.scene);
    this.paddleRight = B.MeshBuilder.CreateBox('paddleR', { width: 0.3, height: 0.5, depth: 2 }, this.scene);
    const paddleMat = new B.StandardMaterial('paddleMat', this.scene);
    paddleMat.diffuseColor = new B.Color3(0.2, 0.8, 0.4);
    paddleMat.emissiveColor = new B.Color3(0.1, 0.4, 0.2);
    paddleMat.specularColor = new B.Color3(0.2, 0.8, 0.4);
    this.paddleLeft.material = paddleMat;
    this.paddleRight.material = paddleMat;
    this.paddleLeft.position.x = -7.5;
    this.paddleLeft.position.y = 0.5;
    this.paddleRight.position.x = 7.5;
    this.paddleRight.position.y = 0.5;

    // Render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    window.addEventListener('resize', () => this.engine.resize());
  }

  public dispose() {
    if (this.engine) this.engine.dispose();
  }
}
