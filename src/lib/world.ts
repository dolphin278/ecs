import type { Entity, World } from "./index";

export function createEntity<T>(world: World<T>): Entity {
  const id = ++world.lastAssignedId;
  world.activeEntitites.add(id);
  return id;
}

export function createEntityFromComponents<T, K extends keyof T>(
  world: World<T>,
  components: Pick<T, K>
) {
  const id = createEntity(world);
  for (const component of Object.keys(components) as Array<
    keyof typeof components
  >)
    world.components[component].set(id, components[component]);
  return id;
}

export function removeEntity<T>(
  { components, activeEntitites }: World<T>,
  entity: Entity
): void {
  for (const componentName of Object.keys(components) as Array<keyof T>)
    components[componentName].delete(entity);
  activeEntitites.delete(entity);
}

type PickComponents<Holder, Selection extends ReadonlyArray<keyof Holder>> = {
  [K in keyof Selection]: Selection[K] extends keyof Holder
    ? Holder[Selection[K]]
    : never;
};

export function entitiesWithComponents<T, K extends ReadonlyArray<keyof T>>(
  components: K,
  world: World<T>
): Array<[Entity, ...PickComponents<T, K>]> {
  const result: any[] = [];
  const row: any[] = [];
  const firstComponent = world.components[components[0]];
  if (firstComponent === void 0) return result;
  entityLoop: for (const [entity, firstComponentValue] of firstComponent) {
    row[0] = entity;
    row[1] = firstComponentValue;
    for (var i = 1; i < components.length; i++) {
      var data = world.components[components[i]].get(entity);
      if (data === void 0) continue entityLoop;
      row[i + 1] = data;
    }
    result.push(row.slice());
  }
  return result;
}
