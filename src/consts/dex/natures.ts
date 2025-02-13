export const PokemonNatureBoosts: Record<Showdown.PokemonNature, [up?: Showdown.StatName, down?: Showdown.StatName]> = {
  Adamant: ['atk', 'spa'],
  Bashful: [],
  Bold: ['def', 'atk'],
  Brave: ['atk', 'spe'],
  Calm: ['spd', 'atk'],
  Careful: ['spd', 'spa'],
  Docile: [],
  Gentle: ['spd', 'def'],
  Hasty: ['spe', 'def'],
  Impish: ['def', 'spa'],
  Jolly: ['spe', 'spa'],
  Lax: ['def', 'spd'],
  Lonely: ['atk', 'def'],
  Mild: ['spa', 'def'],
  Modest: ['spa', 'atk'],
  Naive: ['spe', 'spd'],
  Naughty: ['atk', 'spd'],
  Quiet: ['spa', 'spe'],
  Quirky: [],
  Rash: ['spa', 'spd'],
  Relaxed: ['def', 'spe'],
  Sassy: ['spd', 'spe'],
  Serious: [],
  Timid: ['spe', 'atk'],
  Hardy: [], // XXX: For some reason, Infinite Fusion will default to the last element in this object
};

export const PokemonNatures = Object.keys(PokemonNatureBoosts) as Showdown.PokemonNature[];

export const PokemonBoostedNatures = (Object.keys(PokemonNatureBoosts) as Showdown.PokemonNature[])
  .filter((nature) => !!PokemonNatureBoosts[nature]?.length);

export const PokemonNeutralNatures = (Object.keys(PokemonNatureBoosts) as Showdown.PokemonNature[])
  .filter((nature) => !PokemonNatureBoosts[nature]?.length);

/**
* These are used by the nature/EV/IV finding algorithm,
* based on the Pokemon's final calculated stats.
*
* * Ordering of each nature is intentional,
*   from common natures to more obscure ones.
* * Any nature that does not boost any stat is ignored,
*   except for Hardy (since it's used in randoms), which is last.
*
* @since 0.1.0
*/
export const PokemonCommonNatures: Showdown.NatureName[] = [
  'Adamant',
  'Modest',
  'Jolly',
  'Timid',
  'Bold',
  'Brave',
  'Calm',
  'Careful',
  'Gentle',
  'Hasty',
  'Impish',
  'Lax',
  'Lonely',
  'Mild',
  'Naive',
  'Naughty',
  'Quiet',
  'Rash',
  'Relaxed',
  'Sassy',
  'Hardy',
];
