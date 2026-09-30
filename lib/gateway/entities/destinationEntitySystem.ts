import {
  DirectionalLight,
  Group,
  PointLight,
  Vector2,
} from "three";

import type { DestinationInteraction } from "../briefing.ts";
import type { EntityInteraction } from "../briefing.ts";
import type { GatewayDivision } from "../state.ts";
import { CreatorEntity } from "./creatorEntity.ts";
import { TechnicalEntity } from "./technicalEntity.ts";
import { VisualsEntity, type EntityUpdateParams } from "./visualsEntity.ts";

export type DestinationEntitySystemParams = {
  progress: number;
  interactions: DestinationInteraction;
  reducedMotion: boolean;
  eventDarkness: number;
};

const ENTITY_BASE = {
  visuals: { x: -3.6, z: -26 },
  creator: { x: 0, z: -27.1 },
  technical: { x: 3.6, z: -26 },
} satisfies Record<GatewayDivision, { x: number; z: number }>;

const RECEDE_X = {
  visuals: -6,
  creator: 9.5,
  technical: 7,
} satisfies Record<GatewayDivision, number>;

export function deriveDestinationComposition(
  division: GatewayDivision,
  interaction: EntityInteraction,
) {
  const base = ENTITY_BASE[division];
  return {
    x:
      base.x +
      (-2.7 - base.x) * interaction.focusWeight +
      RECEDE_X[division] * interaction.recedeWeight,
    zOffset:
      interaction.selectedWeight * 0.8 - interaction.recedeWeight * 12,
    scale:
      1 + interaction.selectedWeight * 0.12 - interaction.recedeWeight * 0.66,
  };
}

export class DestinationEntitySystem {
  readonly group = new Group();
  readonly visuals: VisualsEntity;
  readonly technical = new TechnicalEntity();
  readonly creator = new CreatorEntity();

  private readonly keyLight = new DirectionalLight(0xfffefc, 1.5);
  private readonly fillLight = new PointLight(0xefeae1, 1.2, 22, 1.5);
  private readonly creatorLight = new PointLight(0xdde6ff, 0.75, 18, 1.7);
  private readonly pointerTarget = new Vector2();
  private readonly pointerCurrent = new Vector2();

  constructor(onInvalidate?: () => void) {
    this.visuals = new VisualsEntity(onInvalidate);
    this.group.name = "DestinationEntitySystem";
    this.group.add(
      this.visuals.group,
      this.creator.group,
      this.technical.group,
    );

    this.keyLight.position.set(-3, 6, -20);
    this.fillLight.position.set(3, 2, -22);
    this.creatorLight.position.set(0, 1.5, -23);
    this.group.add(this.keyLight, this.fillLight, this.creatorLight);
  }

  setPointer(x: number, y: number) {
    this.pointerTarget.set(x, y);
  }

  tick(
    deltaSeconds: number,
    params: DestinationEntitySystemParams,
    totalTime: number,
  ) {
    const pointerDamp = params.reducedMotion ? 12 : 3;
    this.pointerCurrent.x +=
      (this.pointerTarget.x - this.pointerCurrent.x) *
      Math.min(1, deltaSeconds * pointerDamp);
    this.pointerCurrent.y +=
      (this.pointerTarget.y - this.pointerCurrent.y) *
      Math.min(1, deltaSeconds * pointerDamp);

    const entityParams = (interaction: EntityInteraction): EntityUpdateParams => ({
      progress: params.progress,
      interaction,
      pointerX: this.pointerCurrent.x,
      pointerY: this.pointerCurrent.y,
      reducedMotion: params.reducedMotion,
    });

    this.visuals.tick(
      deltaSeconds,
      entityParams(params.interactions.visuals),
      totalTime,
    );
    this.technical.tick(
      deltaSeconds,
      entityParams(params.interactions.technical),
      totalTime,
    );
    this.creator.tick(
      deltaSeconds,
      {
        progress: params.progress,
        interaction: params.interactions.creator,
        pointerX: this.pointerCurrent.x,
        pointerY: this.pointerCurrent.y,
        reducedMotion: params.reducedMotion,
      },
      totalTime,
    );

    const entities = {
      visuals: this.visuals.group,
      creator: this.creator.group,
      technical: this.technical.group,
    } satisfies Record<GatewayDivision, Group>;
    for (const division of Object.keys(entities) as GatewayDivision[]) {
      const composition = deriveDestinationComposition(
        division,
        params.interactions[division],
      );
      entities[division].position.x = composition.x;
      entities[division].position.z = ENTITY_BASE[division].z + composition.zOffset;
      entities[division].scale.multiplyScalar(composition.scale);
    }

    if (!params.reducedMotion) {
      this.group.position.x = this.pointerCurrent.x * 0.4;
      this.group.position.y = this.pointerCurrent.y * 0.25;
    } else {
      this.group.position.set(0, 0, this.group.position.z);
    }

    const darknessFactor = 1 - params.eventDarkness * 0.85;
    this.keyLight.intensity = 1.5 * darknessFactor;
    this.fillLight.intensity = 1.2 * darknessFactor;
    this.creatorLight.intensity =
      (0.75 + params.interactions.creator.hoverWeight * 0.35) * darknessFactor;
  }

  dispose() {
    this.visuals.dispose();
    this.technical.dispose();
    this.creator.dispose();
    this.group.clear();
  }
}
