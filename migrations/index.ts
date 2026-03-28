import * as migration_20260328_101725 from './20260328_101725';

export const migrations = [
  {
    up: migration_20260328_101725.up,
    down: migration_20260328_101725.down,
    name: '20260328_101725'
  },
];
