type SceneTags = {
  [key: string]: string | number | number[]
  original: string,
  language: string,
  source: string | null,
  encoding: string | null,
  resolution: string | null,
  dub: string | null,
  year: number | null,
  flags: string | null,
  season: string | null,
  episode: number | null,
  episodes: number[],
  type: string,
  group: string | null,
  title: string,
  generated: string,
  score: number
}

type ReleaseOptions = {
  [key: string]: boolean | string[] | SceneTags | object
  strict?: boolean,
  flagged?: boolean,
  erase?: string[],
  defaults?: SceneTags | object,
}

declare module 'oleoo' {
  function parse(release: string, options?: ReleaseOptions): SceneTags
  function guess(release: string, options?: ReleaseOptions): SceneTags
  function stringify(release: string, options?: ReleaseOptions): string
  const rules: string
}

export { SceneTags, ReleaseOptions, parse, guess, stringify, rules }
