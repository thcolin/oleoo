const rules = require('./rules.json')
const properties = [
  'language',
  'source',
  'encoding',
  'resolution',
  'dub',
  'year',
  'flags',
  'season',
  'episode',
  'episodes',
  'type',
  'group',
]

function clean(str) {
  return str.replace(/[\[\]\(\)\;\:\!\s\\]+/g, '.')
}

function deduce(property, name, multi = false) {
  const result =  {
    match: null,
    waste: name
  }

  switch (property) {
    case 'year': {
      const regexp = /[\.|\-](\d{4})([\.|\-])?/
      const matches = name.match(regexp)

      if (matches !== null) {
        result.match = matches[1]
        result.waste = name.replace(regexp, '$2')
      }

      return result
    }

    case 'group': {
      const regexp = /\-([a-zA-Z0-9_\.]+)$/
      const matches = name.match(regexp)

      if (matches !== null) {
        result.match = (matches[1].length > 12 ? matches[1].replace(/[_\.].+?$/, '') : matches[1])
        result.waste = name.replace(regexp, '')
      }

      return result
    }

    case 'season': {
      const regexp = /[\.\-]S(\d+)[\.\-]?(?:E\d+)?(?:[\.\-])/i
      const matches = name.match(regexp)

      if (matches !== null) {
        result.match = parseInt(matches[1])
      }

      return result
    }

    case 'episode': {
      const regexps = {
        episodes: /[\.\-]S(?:\d+)[\.\-]?((?:-?E(?:\d+))+)(?:[\.\-])/i,
        episode: /E(\d+)/ig,
      }

      const matches = name.match(regexps.episodes)
      const match = []
      let crumbs = []

      while (matches && (crumbs = regexps.episode.exec(matches[1])) !== null) {
        match.push(crumbs[1])
      }

      result.match = match.map(Number).sort((a, b) => a - b).reduce((res, episode, index, match) => (
        match.length === 1 ? episode : match.join('-')
      ), null)

      return result
    }

    case 'episodes': {
      const regexps = {
        episodes: /[\.\-]S(?:\d+)[\.\-]?((?:-?E(?:\d+))+)(?:[\.\-])/i,
        episode: /E(\d+)/ig,
      }

      const matches = name.match(regexps.episodes)
      const match = []
      let crumbs = []

      while (matches && (crumbs = regexps.episode.exec(matches[1])) !== null) {
        match.push(crumbs[1])
      }

      result.match = match.map(Number).sort((a, b) => a - b)

      return result
    }

    case 'type': {
      const regexp = /[\.\-]S\d+[\.\-]?(?:-?E\d+)*([\.\-])/i

      result.match = (name.match(regexp) ? 'tvshow' : 'movie')
      result.waste = name.replace(regexp, '$1')

      return result
    }
  }

  const rule = rules[property]
  const tags = Object.keys(rule)

  single:
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      const patterns = (Array.isArray(rule[tag]) ? rule[tag] : [rule[tag]])

      for (let j = 0; j < patterns.length; j++) {
        const regexp = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

        if (result.waste.match(regexp)) {
          result.match = (multi ? (result.match || []).concat([tag]) : tag)
          result.waste = result.waste.replace(regexp, '$1')

          if (!multi && result.match) {
            break single
          }

          break
        }
      }

    }

  return result
}

function stringify(release, options) {
  return release.title
    .split(' ')
    .concat([
      release.year,
      [
        (release.season ? 'S' + release.season.toString().padStart(2, '0') : null),
        (release.episode ? 'E' + release.episodes.map(episode => episode.toString().padStart(2, '0')).join('-E') : null)
      ]
      .join(''),
      (release.language !== 'VO' && release.language),
      (release.resolution !== 'SD' && release.resolution),
      release.source,
      release.encoding,
      release.dub,
    ])
    .concat(options.flagged ? release.flags : [])
    .filter(property => property)
    .join('.')
    .concat('-' + (release.group || 'NOTEAM'))
}

function parse(name, options = { strict: false, flagged: true, defaults: {} }) {
  options.defaults = Object.assign(
    properties
      .filter(property => !['type'].includes(property))
      .reduce((obj, property) => Object.assign(obj, { [property]: null }), {}),
    {
      language: 'VO',
    },
    options.defaults
  )

  const cleaned = clean(name)

  let words = cleaned.split('.')
  let waste = cleaned
  let handicap = []

  let release = {
    original: name
  }

  properties.map(property => {
    const result = deduce(property, waste, (property === 'flags'))

    waste = result.waste
    handicap = handicap.concat([!result.match && options.defaults[property] && property])

    release[property] = result.match || options.defaults[property]
  })

  release.title = waste
    .replace(/\.+/, '.')
    .split('.')
    .filter((word, position) => word === words[position])
    .join(' ')
    .toLowerCase()
    .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase()) // ucwords

  release.generated = stringify(release, options)

  release.score = properties
    .filter(property => !['season', 'episodes', 'episode', 'type'].includes(property))
    .filter(property => !handicap.includes(property))
    .filter(property => release[property])
    .length

  let valid = !!['resolution', 'source', 'dub', 'encoding']
    .filter(property => !handicap.includes(property))
    .filter(property => release[property])
    .length

  if (options.strict && !valid) {
    throw new Error('"' + release.original + '" does\'t follow scene release naming rules')
  }

  return release
}

function guess(name, options) {
  const release = parse(name, Object.assign({}, options, { strict: false }))

  if (!release.year) {
    release.year = new Date().getFullYear()
  }

  if (!release.resolution) {
    release.resolution = ['BDSCR', 'BLURAY'].includes(release.source) ? '1080p' : 'SD'
  }

  return release
}

const oleoo = {
  parse,
  guess,
}

module.exports = oleoo
