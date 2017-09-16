const Rules = require('./rules.js')
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

class Release {
  constructor(name, strict = true, defaults = {}) {
    defaults = Object.assign({
      language: 'VO',
      source: null,
      resolution: null,
      dub: null,
      year: null,
      flags: null,
      season: null,
      episode: null,
      group: null
    }, defaults)

    const cleaned = this.clean(name)

    let words = cleaned.split('.')
    let waste = cleaned
    let handicap = []

    this.original = name

    properties.map(property => {
      const result = this.parse(property, waste, (property === 'flags'))

      waste = result.waste
      handicap = handicap.concat([!result.match && defaults[property] && property])

      this[property] = result.match || defaults[property]
    })

    this.title = waste
      .replace(/\.+/, '.')
      .split('.')
      .filter((word, position) => word === words[position])
      .join(' ')
      .toLowerCase()
      .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase()) // ucwords

    this.generated = this.toString()

    this.score = properties
      .filter(property => !['episode', 'season', 'type'].includes(property))
      .filter(property => !handicap.includes(property))
      .filter(property => this[property])
      .length

    let valid = !!['resolution', 'source', 'dub', 'encoding']
      .filter(property => !handicap.includes(property))
      .filter(property => this[property])
      .length

    if (strict && !valid) {
      throw new Error('"' + this.original + '" does\'t follow scene release naming rules')
    }
  }

  toString(){
    return this.title
      .split(' ')
      .concat([
        this.year,
        [
          (this.season ? 'S' + pad(this.season) : null),
          (this.episode ? 'E' + pad(this.episode) : null)
        ]
        .join(''),
        (this.language !== 'VO' && this.language),
        (this.resolution !== 'SD' && this.resolution),
        this.source,
        this.encoding,
        this.dub
      ])
      .filter(property => property)
      .join('.')
      .concat('-' + (this.group || 'NOTEAM'))
  }

  clean(name) {
    return name.replace(/[\[\]\(\)\;\:\!\s\\]+/g, '.')
  }

  parse(property, name, multi = false) {
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

        break
      }

      case 'group': {
        const regex = /\-([a-zA-Z0-9_\.]+)$/
        const matches = name.match(regex)

        if (matches !== null) {
          result.match = (matches[1].length > 12 ? matches[1].replace(/[_\.].+?$/, '') : matches[1])
          result.waste = name.replace(regex, '')
        }

        break
      }

      case 'season': {
        const regex = /[\.\-]S(\d+)[\.\-]?(E(\d+))?([\.\-])/i
        const matches = name.match(regex)

        if (matches !== null) {
          result.match = parseInt(matches[1])
        }

        break
      }

      case 'episode': {
        const regex = /[\.\-]S(\d+)[\.\-]?(E(\d+))([\.\-])/i
        const matches = name.match(regex)

        if (matches !== null) {
          result.match = parseInt(matches[3])
        }

        break
      }

      case 'type': {
        const regex = /[\.\-]S\d+[\.\-]?(E\d+)?([\.\-])/i

        result.match = (name.match(regex) ? 'tvshow' : 'movie')
        result.waste = name.replace(regex, '$2')

        break
      }

      default: {
        const rule = Rules[property]
        const tags = Object.keys(rule)

        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i]
          const patterns = (Array.isArray(rule[tag]) ? rule[tag] : [rule[tag]])

          for (let j = 0; j < patterns.length; j++) {
            const regex = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

            if (result.waste.match(regex)) {
              result.match = (multi ? (result.match || []).concat([tag]) : tag)
              result.waste = result.waste.replace(regex, '$1')

              break
            }
          }

          if (!multi && result.match) {
            break
          }
        }
      }
    }

    return result
  }
}

function pad(number) {
  return (number < 10 ? '0' : '') + number
}

module.exports = Release
