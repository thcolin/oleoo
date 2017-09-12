const Tags = require('./tags.js')
const attributes = ['language', 'source', 'encoding', 'resolution', 'dub'] // missing 'year', 'flags' (multi), 'type', 'group' and 'title'

class Release {
  constructor(name, strict = true, defaults = {}) {
    defaults = Object.assign({language: 'MULTi', resolution: 'SD'}, defaults)

    const cleaned = this.clean(name)
    let waste = cleaned

    this.original = name
    this.cleaned = cleaned

    attributes.map(key => {
      const result = this.parse(key, waste)

      if (result.match || defaults[key]) {
        this[key] = result.match || defaults[key]
      }

      waste = result.waste
    })
  }

  clean(name) {
    return name.replace(/[\[\]\(\)\;\:\!\s\\]+/g, '.')
  }

  parse(key, name) {
    const tag = Tags[key]
    const keys = Object.keys(tag)
    for (let i = 0; i < keys.length; i++) {
      const currentTag = keys[i]
      const patterns = (Array.isArray(tag[currentTag]) ? tag[currentTag] : [tag[currentTag]])

      for (let j = 0; j < patterns.length; j++) {
        const regex = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

        if (name.match(regex)) {
          return {
            match: currentTag,
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
