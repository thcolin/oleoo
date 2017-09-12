const Rules = require('./rules.js')
const properties = ['language', 'source', 'encoding', 'resolution', 'dub'] // missing 'year', 'flags' (multi), 'type', 'group' and 'title'

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
      const result = this.parse(property, waste)

      if (result.match || defaults[property]) {
        this[property] = result.match || defaults[property]
      }

      waste = result.waste
    })
  }

  clean(name) {
    return name.replace(/[\[\]\(\)\;\:\!\s\\]+/g, '.')
  }

  parse(property, name) {
    const rule = Rules[property]
    const tags = Object.keys(rule)

    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      const patterns = (Array.isArray(rule[tag]) ? rule[tag] : [rule[tag]])

      for (let j = 0; j < patterns.length; j++) {
        const regex = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

        if (name.match(regex)) {
          return {
            match: tag,
            waste: name.replace(regex, '$1')
          }
        }
      }
    }

    return {
      match: null,
      waste: name
    }
  }
}

module.exports = Release
