import {
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  type Material,
} from "three";
import {
  previewFragmentShader,
  previewVertexShader,
  visualsFragmentShader,
  visualsVertexShader,
} from "./visualsShader.ts";
import type { EntityInteraction } from "../briefing.ts";

export type EntityUpdateParams = {
  progress: number;
  interaction: EntityInteraction;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
};

export class VisualsEntity {
  readonly group: Group;
  private readonly geometries: BufferGeometry[] = [];
  private readonly materials: Material[] = [];
  private readonly textures: Texture[] = [];

  private topShellGroup = new Group();
  private bottomShellGroup = new Group();
  private innerAtmosphereMesh!: Mesh;
  private previewPlanesGroup = new Group();

  private shellMaterial!: ShaderMaterial;
  private previewMaterials: ShaderMaterial[] = [];
  private hoverCurrent = 0;

  constructor(onInvalidate?: () => void) {
    this.group = new Group();
    this.group.name = "VisualsEntity";
    this.init(onInvalidate);
  }

  private ownGeometry<T extends BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry);
    return geometry;
  }

  private ownMaterial<T extends Material>(material: T): T {
    this.materials.push(material);
    return material;
  }

  private init(onInvalidate?: () => void) {
    // 1. DUAL-SHELL OPENING WORLDFORM GEOMETRY
    const topGeo = this.ownGeometry(
      new SphereGeometry(2.2, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
    );
    const bottomGeo = this.ownGeometry(
      new SphereGeometry(2.2, 40, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    );

    this.shellMaterial = this.ownMaterial(
      new ShaderMaterial({
        vertexShader: visualsVertexShader,
        fragmentShader: visualsFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uSelected: { value: 0 },
          uProgress: { value: 0 },
        },
        side: DoubleSide,
      }),
    );

    const topMesh = new Mesh(topGeo, this.shellMaterial);
    this.topShellGroup.add(topMesh);
    this.group.add(this.topShellGroup);

    const bottomMesh = new Mesh(bottomGeo, this.shellMaterial);
    this.bottomShellGroup.add(bottomMesh);
    this.group.add(this.bottomShellGroup);

    // 2. INNER ATMOSPHERIC NEBULA GLOW SPHERE
    const coreGeo = this.ownGeometry(new SphereGeometry(1.35, 24, 24));
    const coreMat = this.ownMaterial(
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPos.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uHover;
          uniform float uSelected;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(vViewPosition);
            float NdotV = max(dot(N, V), 0.0);
            float authority = max(uHover * 0.72, uSelected);
            float glow = pow(1.0 - NdotV, 2.0) * (0.28 + authority * 0.48);
            vec3 color = mix(vec3(0.85, 0.80, 0.96), vec3(0.98, 0.78, 0.70), sin(uTime * 0.5) * 0.5 + 0.5);
            gl_FragColor = vec4(color, glow * (0.08 + authority * 0.72));
          }
        `,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uSelected: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    this.innerAtmosphereMesh = new Mesh(coreGeo, coreMat);
    this.group.add(this.innerAtmosphereMesh);

    // 3. INNER PREVIEW FRAGMENTS (Real BM Visuals Project Crops)
    this.initPreviewFragments(onInvalidate);
    this.group.add(this.previewPlanesGroup);

    // Coordinate in final selection scene (Left coordinate, in front of camera at Z = -18)
    this.group.position.set(-3.6, 0.6, -26.0);
  }

  private initPreviewFragments(onInvalidate?: () => void) {
    const loader = new TextureLoader();

    const projectData = [
      {
        path: "/projects/fabriclism/builder.webp",
        tint: new Vector3(0.96, 0.92, 0.88),
        pos: [-0.2, 0.25, 0.45],
        rot: [0.08, -0.18, 0.04],
        size: [2.1, 1.4],
      },
      {
        path: "/projects/aurelia/desktop-01.webp",
        tint: new Vector3(0.90, 0.85, 0.98),
        pos: [0.4, -0.15, 0.15],
        rot: [-0.1, 0.22, -0.06],
        size: [2.0, 1.3],
      },
      {
        path: "/projects/haven/commerce.webp",
        tint: new Vector3(0.86, 0.94, 0.96),
        pos: [-0.1, -0.4, 0.25],
        rot: [0.15, 0.1, 0.08],
        size: [1.9, 1.25],
      },
    ];

    projectData.forEach((item) => {
      const geo = this.ownGeometry(
        new PlaneGeometry(item.size[0], item.size[1], 16, 16),
      );

      const texture = loader.load(
        item.path,
        (tex) => {
          tex.colorSpace = SRGBColorSpace;
          onInvalidate?.();
        },
        undefined,
        () => {},
      );
      this.textures.push(texture);

      const mat = this.ownMaterial(
        new ShaderMaterial({
          vertexShader: previewVertexShader,
          fragmentShader: previewFragmentShader,
          uniforms: {
            uTexture: { value: texture },
            uHover: { value: 0 },
            uPreviewVisibility: { value: 0.08 },
            uTime: { value: 0 },
            uTint: { value: item.tint },
          },
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      this.previewMaterials.push(mat);

      const mesh = new Mesh(geo, mat);
      mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);
      mesh.rotation.set(item.rot[0], item.rot[1], item.rot[2]);
      this.previewPlanesGroup.add(mesh);
    });
  }

  tick(deltaSeconds: number, params: EntityUpdateParams, totalTime: number) {
    const interaction = params.interaction;
    const authorityTarget = Math.max(
      interaction.hoverWeight * 0.72,
      interaction.selectedWeight,
    );
    const recede = interaction.recedeWeight;

    // Smooth hover damping
    const hoverDamp = params.reducedMotion ? 12 : 4.5;
    this.hoverCurrent +=
      (authorityTarget - this.hoverCurrent) *
      Math.min(1, deltaSeconds * hoverDamp);

    // Update shell shader uniforms
    const u = this.shellMaterial.uniforms;
    u.uTime.value = totalTime;
    u.uHover.value = this.hoverCurrent;
    u.uSelected.value = interaction.selectedWeight;
    u.uProgress.value = params.progress;

    // Update core atmosphere shader uniforms
    (this.innerAtmosphereMesh.material as ShaderMaterial).uniforms.uTime.value = totalTime;
    (this.innerAtmosphereMesh.material as ShaderMaterial).uniforms.uHover.value = this.hoverCurrent;
    (this.innerAtmosphereMesh.material as ShaderMaterial).uniforms.uSelected.value = interaction.selectedWeight;

    // Update preview fragments uniforms
    this.previewMaterials.forEach((mat) => {
      mat.uniforms.uTime.value = totalTime;
      mat.uniforms.uHover.value = this.hoverCurrent;
      mat.uniforms.uPreviewVisibility.value = Math.min(
        1,
        0.08 + interaction.hoverWeight * 0.74 + interaction.selectedWeight * 0.92,
      );
    });

    if (params.reducedMotion) {
      this.group.scale.setScalar(params.progress > 0.85 ? 1.0 : 0.0001);
      return;
    }

    // Emergence scale from travel progress
    const emergence = Math.min(
      1.0,
      Math.max(0.0, (params.progress - 0.72) / 0.23),
    );
    const smoothEmergence = emergence * emergence * (3 - 2 * emergence);

    const targetScale =
      smoothEmergence * (1.0 + this.hoverCurrent * 0.1 - recede * 0.12);
    this.group.scale.setScalar(Math.max(0.0001, targetScale));

    // SHELL FRACTURE / SEPARATION KINEMATICS
    // Top shell separates upwards and tilts backwards
    this.topShellGroup.position.y = this.hoverCurrent * 0.82;
    this.topShellGroup.position.x = -this.hoverCurrent * 0.22;
    this.topShellGroup.rotation.x = -this.hoverCurrent * 0.35;
    this.topShellGroup.rotation.z = this.hoverCurrent * 0.15;

    // Bottom shell separates downwards and tilts forwards
    this.bottomShellGroup.position.y = -this.hoverCurrent * 0.82;
    this.bottomShellGroup.position.x = this.hoverCurrent * 0.22;
    this.bottomShellGroup.rotation.x = this.hoverCurrent * 0.35;
    this.bottomShellGroup.rotation.z = -this.hoverCurrent * 0.15;

    // Organic floating rotation for the whole worldform
    this.group.rotation.y = totalTime * 0.16 + this.hoverCurrent * 0.25;
    this.group.rotation.x = Math.sin(totalTime * 0.20) * 0.05;

    // Floating preview parallax inside the core
    this.previewPlanesGroup.rotation.y = totalTime * 0.06 + params.pointerX * 0.12;
    this.previewPlanesGroup.rotation.x = Math.sin(totalTime * 0.12) * 0.03 - params.pointerY * 0.10;

    // Subtle position lift when hovered
    this.group.position.y = 0.6 + Math.sin(totalTime * 0.65) * 0.08 + this.hoverCurrent * 0.35;
    this.group.position.x = -3.6 - this.hoverCurrent * 0.35;
  }

  dispose() {
    for (const geo of this.geometries) geo.dispose();
    for (const mat of this.materials) mat.dispose();
    for (const tex of this.textures) tex.dispose();
  }
}
