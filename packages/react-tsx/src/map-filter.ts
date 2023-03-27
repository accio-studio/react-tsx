/**
 * Map an array, filter out undefined values
 * @example
 * ```ts
 * import { mapFilter } from 'map-filter-ts'
 * // Works with arrays, sets, maps, and other iterables.
 * const results = mapFilter([0, 1, 2], value =>
 *   value > 0 ? value + 1 : undefined
 * )
 * // => [2, 3]
 * ```
 * @see https://github.com/aleclarson/map-filter-ts
 */
export function mapFilter<T, U>(values: Iterable<T>, map: (value: T) => U | undefined | void): U[] {
  const results = [];
  // rome-ignore lint/suspicious/noExplicitAny: any
  for (let value of values as Iterable<any>) {
    value = map(value);
    if (value !== undefined) {
      results.push(value);
    }
  }
  return results;
}
