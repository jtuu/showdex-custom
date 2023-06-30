import { type CalcdexPokemonPreset } from '@showdex/redux/store';
import { nonEmptyObject } from '@showdex/utils/core';
import { detectUsageAlts } from '@showdex/utils/presets';
import { dehydrateArray, dehydrateStatsTable, dehydrateValue } from './dehydrators';

/* eslint-disable @typescript-eslint/indent */

export type DehydrationPresetKeys = Exclude<keyof CalcdexPokemonPreset,
  | 'id'
  | 'gen'
  | 'ability'
  | 'item'
  | 'moves'
>;

/* eslint-enable @typescript-eslint/indent */

/**
 * Mapping of `CalcdexPokemonPreset` properties to their `string` opcodes.
 *
 * @since 1.1.6
 */
export const DehydrationPresetMap: Record<DehydrationPresetKeys, string> = {
  calcdexId: 'cid',
  source: 'src',
  name: 'nom',
  playerName: 'pln',
  format: 'fmt',
  nickname: 'nkn',
  usage: 'usg',
  speciesForme: 'fme',
  level: 'lvl',
  gender: 'gdr',
  hiddenPowerType: 'hpt',
  teraTypes: 'trt',
  shiny: 'shy',
  happiness: 'hpy',
  dynamaxLevel: 'dml',
  gigantamax: 'gmx',
  altAbilities: 'abl',
  altItems: 'itm',
  altMoves: 'mov',
  nature: 'ntr',
  ivs: 'ivs',
  evs: 'evs',
  pokeball: 'pkb',
};

/**
 * Mapping of `CalcdexPokemonPreset` properties that are `CalcdexPokemonAlt<T>[]`'s to their non-alt properties.
 *
 * * Typically used for dehydrating non-`'smogon'` & non-`'usage'` presets.
 *   - Alt properties like `altAbilities[]` are typically only populated if derived from the aforementioned sources.
 *   - Otherwise, we'll only dehydrate the `ability` (unless that's unavailable too LOL -- no biggie tho).
 * * If there is no mapping (i.e., value is falsy like `null`), then no property override will be performed.
 *
 * @since 1.1.6
 */
export const DehydrationPresetAltMap: Partial<Record<DehydrationPresetKeys, keyof CalcdexPokemonPreset>> = {
  teraTypes: null,
  altAbilities: 'ability',
  altItems: 'item',
  altMoves: 'moves',
};

/**
 * Dehydrates (serializes) a single `preset` into a hydratable `string`.
 *
 * Outputs the following format:
 *
 * ```
 * <opcode>~<value>,[<opcode>~<value>...]
 * ```
 *
 * where `<opcode>` is one of the following:
 *
 * * `cid`, representing the `calcdexId`.
 * * `src`, representing the `source`.
 * * `nom`, representing the `name` of the `preset`.
 * * `pln`, representing the `playerName`, if any.
 * * `fmt`, representing the battle `format`.
 *   - `gen` value is omitted during dehydration & will be extracted from its `<value>` during hydration.
 * * `nkn`, representing the Pokemon's `nickname`, if any.
 * * `usg`, representing the usage percentage of the `preset`, as a decimal between `0` & `1`, both inclusive.
 * * `fme`, representing the `speciesForme`.
 * * `lvl`, representing the Pokemon's `level`, if any.
 * * `gdr`, representing the Pokemon's `gender`, if any.
 * * `hpt`, representing the *Hidden Power* type for applicable gens, if any.
 * * `trt`, representing the `teraTypes[]` for gen 9.
 * * `shy`, representing whether the Pokemon is `shiny`.
 * * `hpy`, representing the Pokemon's `happiness`.
 * * `dml`, representing the `dynamaxLevel` for gen 8.
 * * `gmx`, representing whether the Pokemon can `gigantamax` for gen 8.
 * * `abl`, representing the `altAbilities` for gens 3+.
 *   - Empty `preset.altAbilities[]` will fallback to `[preset.ability]`.
 *   - `ability` will be extracted from the first element of the hydrated array.
 * * `itm`, representing the `altItems[]` for gens 2+.
 *   - Empty `preset.altItems[]` will fallback to `[preset.item]`.
 *   - During hydration, `item` will be extracted from the first element of the hydrated array.
 * * `mov`, representing the `altMoves[]`.
 *   - Empty `preset.altMoves[]` will fallback to `preset.moves[]`.
 *   - During hydration, `moves[]` will be extracted from the *first* 4 elements of the hydrated array.
 * * `ntr`, representing the `nature` for gens 3+.
 * * `ivs`, representing the `ivs` (or DVs converted into IVs for legacy gens).
 * * `evs`, representing the `evs` for gens 3+.
 * * `pkb`, representing the `pokeball`, if any lol.
 *
 * For `CalcdexPokemonAlt<T>[]` properties, specifically `teraTypes` (`ter`), `altAbilities` (`abl`), `altItems` (`itm`), & `altMoves` (`mov`),
 * the array should be dehydrated using a foward slash delimiter (`'/'`) in the following format:
 *
 * ```
 * <value>[@<usage>][/<value>[@<usage>]...]
 * ```
 *
 * where `<usage>` is the usage percentage represented as a decimal between `0` & `1`, both inclusive.
 *
 * * Primarily used for caching the dehydrated presets in client's `LocalStorage`.
 * * Note that this only dehydrates a **single** `CalcdexPokemonPreset`!
 *   - You must assemble the entire dehydrated payload (including the standardized header via
 *     `dehydrateHeader()`) yourself.
 *
 * @since 1.1.6
 */
export const dehydratePreset = (
  preset: CalcdexPokemonPreset,
  delimiter = ',',
): string => {
  if (!preset?.calcdexId || !preset.speciesForme) {
    return null;
  }

  const output: string[] = [];

  const push = (
    opcode: string,
    value: string,
  ) => output.push(`${opcode}~${value}`);

  Object.entries(DehydrationPresetMap).forEach(([
    key,
    opcode,
  ]: [
    keyof CalcdexPokemonPreset,
    string,
  ]) => {
    const value = preset[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      let source: typeof value = value.length
        // e.g., key = 'altMoves'
        // -> value = [['Bullet Seed', 1], ['Mach Punch', 1], ['Rock Tomb', 0.8303], ['Spore', 0.5994], ['Swords Dance', 0.5703]]
        ? detectUsageAlts(value)
          // e.g., ['Bullet Seed@1', 'Mach Punch@1', 'Rock Tomb@0.8303', 'Spore@0.5994', 'Swords Dance@0.5703']
          ? value.map((alt) => dehydrateArray(alt, '@')) as typeof value
          // e.g., ['Bullet Seed', 'Mach Punch', ...]
          // (i.e., no usage, probably from a 'smogon'-sourced preset)
          : value
        : null;

      // if `source` is empty, check if there's a mapped non-alt property to use instead
      if (!source) {
        const hasNonAlt = (
          key in DehydrationPresetAltMap
            && DehydrationPresetAltMap[key as DehydrationPresetKeys]
        ) || null;

        if (!hasNonAlt) {
          return;
        }

        const nonAlt = preset[hasNonAlt];

        source = Array.isArray(nonAlt)
          ? nonAlt
          : [nonAlt] as typeof value;
      }

      if (!source?.length) {
        return;
      }

      // e.g., 'mov~Bullet Seed@1/Mach Punch@1/Rock Tomb@0.8303/Spore@0.5994/Swords Dance@0.5703'
      push(opcode, dehydrateArray(source, '/'));

      return;
    }

    const dehydratedValue = ['ivs', 'evs'].includes(key) && nonEmptyObject(value)
      ? dehydrateStatsTable(value as Showdown.StatsTable, '/')
      : dehydrateValue(value);

    push(opcode, dehydratedValue);
  });

  return output.join(delimiter);
};
