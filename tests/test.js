const Release = require('../src/index.js')
const assert = require('assert')
const names = require('./fixtures/releases.json')

for (let name in names) {
  const release = new Release(name)

  console.log('[Release]', name, JSON.stringify(release, null, 2), JSON.stringify(names[name], null, 2))

  for (let key in names[name]) {
    assert.equal(
      '' + release[key],
      '' + names[name][key],
      `"${key}" is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`
    )
  }
}
