import { CalcdexPokemon } from '@showdex/interfaces/calc';

export function getFusionPartNames(pokemon: CalcdexPokemon): { headName: string; bodyName: string; } | null {
  // Find body name by parsing the `details` property.
  // Full text of `details` is something like "Houndoom, L76, F, fusion: Jolteon".
  // Match everything after "fusion: " until end of string or comma.
  const bodyNameMatch = pokemon.details.match(/fusion: (.+?)(?:,|$)/);
  if (!bodyNameMatch || bodyNameMatch.length < 2) {
    return null;
  }

  return {
    headName: pokemon.speciesForme,
    bodyName: bodyNameMatch[1],
  };
}

export function calculateFusedBaseStats(head: Showdown.Species, body: Showdown.Species): Required<Showdown.StatsTable> {
  // Formula source: https://infinitefusion.fandom.com/wiki/Fusion_FAQs#Stats
  const fuseStat = (a: number, b: number) => Math.floor((2 * a) / 3 + b / 3);

  return {
    // Body primary stats
    atk: fuseStat(body.baseStats.atk, head.baseStats.atk),
    def: fuseStat(body.baseStats.def, head.baseStats.def),
    spe: fuseStat(body.baseStats.spe, head.baseStats.spe),
    // Head primary stats
    hp: fuseStat(head.baseStats.hp, body.baseStats.hp),
    spa: fuseStat(head.baseStats.spa, body.baseStats.spa),
    spd: fuseStat(head.baseStats.spd, body.baseStats.spd),
  };
}
