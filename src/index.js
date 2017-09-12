const tags = require('./tags.js')

class Release {
  constructor(name, strict = true, defaults = {}) {
    defaults.language = (defaults.language || 'MULTi')
    defaults.resolution = (defaults.resolution || 'SD')

    var cleaned = this.clean(name)
    var waste = cleaned
    var attributes = ['language', 'source', 'encoding', 'resolution', 'dub'] // missing 'year', 'flags' (multi), 'type', 'group' and 'title'

    this.original = name
    this.cleaned = cleaned

    attributes.map(key => {
      console.log(key, waste)
      var result = this.parse(key, waste)

      if (result.match || defaults[key]) {
        this[key] = result.match || defaults[key]
      }

      waste = result.waste
    })
  }

  clean(name) {
    return name
      .replace(/[\[\]\(\)\;\:\!]+/g, ' ')
      .replace(/[\s]+/g, ' ')
      .replace(/ /g, '.')
  }

  parse(key, name) {
    for (var i = 0; i < Object.keys(tags[key]).length; i++) {
      var tag = Object.keys(tags[key])[i]
      var patterns = (Array.isArray(tags[key][tag]) ? tags[key][tag] : [tags[key][tag]])

      for (var j = 0; j < patterns.length; j++) {
        var regex = new RegExp('[\.|\-]' + patterns[j] + '([\.|\-]|$)', 'i')

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
