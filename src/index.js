const Rules = require('./rules.js')
const properties = ['language', 'source', 'encoding', 'resolution', 'dub', 'year', 'flags'] // missing 'type', 'group' and 'title'

class Release {
  constructor(name, strict = true, defaults = {}) {
    defaults = Object.assign({
      language: 'MULTi',
      resolution: 'SD'
    }, defaults)

    const cleaned = this.clean(name)
    let waste = cleaned

    this.original = name
    this.cleaned = cleaned

    properties.map(property => {
      const result = this.parse(property, waste, (property === 'flags'))

      if (result.match || defaults[property]) {
        this[property] = result.match || defaults[property]
      }

      waste = result.waste
    })
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
      case 'year':
        const regex = /[\.|\-](\d{4})([\.|\-])?/
        const matches = name.match(regex)

        if (matches !== null) {
          result.match = matches[1]
          result.waste = name.replace(regex, '$2')
        }

        break
      default:
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

    return result
  }
}

module.exports = Release
