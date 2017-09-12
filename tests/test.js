const Release = require('../src/index.js')
const assert = require('assert')
const names = require('./fixtures/names.json')

for(let name in names) {
  const release = new Release(name)

  for (let key in names[name]) {
    assert.equal(release[key], names[name][key], `${key} is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`)
  }
}
