import { isNullish } from "./is-nullish.util";

export const isNonNullable = <T>(value: T): value is NonNullable<T> =>
  !isNullish(value);
