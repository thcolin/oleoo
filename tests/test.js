const Release = require('../src/index.js')
const assert = require('assert')
const names = require('./fixtures/releases.json')

for(let name in names) {
  const release = new Release(name)

  for (let key in names[name]) {
    if (key === 'guess') {
      continue
    }

    assert.equal(''+release[key], ''+names[name][key], `${key} is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`)
  }
}
