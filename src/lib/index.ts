export type Entity = number;

type ComponentHolder<Components> = {
  [K in keyof Components]: Map<Entity, Components[K]>;
};

export interface World<Components> {
  currentTime: number;
  lastAssignedId: number;
  activeEntitites: Set<Entity>;
  components: ComponentHolder<Components>;
}

export interface System<Components> {
  (world: Readonly<World<Components>>, delta: number): void;
}
