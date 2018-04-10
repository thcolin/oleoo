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
  'type',
  'group'
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
      const regex = /[\.|\-](\d{4})([\.|\-])?/
      const matches = name.match(regex)

      if (matches !== null) {
        result.match = matches[1]
        result.waste = name.replace(regex, '$2')
      }

      return result
    }

    case 'group': {
      const regex = /\-([a-zA-Z0-9_\.]+)$/
      const matches = name.match(regex)

      if (matches !== null) {
        result.match = (matches[1].length > 12 ? matches[1].replace(/[_\.].+?$/, '') : matches[1])
        result.waste = name.replace(regex, '')
      }

      return result
    }

    case 'season': {
      const regex = /[\.\-]S(\d+)[\.\-]?(E(\d+))?([\.\-])/i
      const matches = name.match(regex)

      if (matches !== null) {
        result.match = parseInt(matches[1])
      }

      return result
    }

    case 'episode': {
      const regex = /[\.\-]S(\d+)[\.\-]?(E(\d+))([\.\-])/i
      const matches = name.match(regex)

      if (matches !== null) {
        result.match = parseInt(matches[3])
      }

      return result
    }

    case 'type': {
      const regex = /[\.\-]S\d+[\.\-]?(E\d+)?([\.\-])/i

      result.match = (name.match(regex) ? 'tvshow' : 'movie')
      result.waste = name.replace(regex, '$2')

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
        const regex = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

        if (result.waste.match(regex)) {
          result.match = (multi ? (result.match || []).concat([tag]) : tag)
          result.waste = result.waste.replace(regex, '$1')

          if (!multi && result.match) {
            break single
          }

          break
        }
      }

    }

  return result
}

function stringify(release) {
  return release.title
    .split(' ')
    .concat([
      release.year,
      [
        (release.season ? 'S' + release.season.toString().padStart(2, '0') : null),
        (release.episode ? 'E' + release.episode.toString().padStart(2, '0') : null)
      ]
      .join(''),
      (release.language !== 'VO' && release.language),
      (release.resolution !== 'SD' && release.resolution),
      release.source,
      release.encoding,
      release.dub
    ])
    .filter(property => property)
    .join('.')
    .concat('-' + (release.group || 'NOTEAM'))
}

function parse(name, options = { strict: false, defaults: {} }) {
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

  release.generated = stringify(release)

  release.score = properties
    .filter(property => !['episode', 'season', 'type'].includes(property))
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
