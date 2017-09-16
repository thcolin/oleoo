const Release = require('../src/index.js')
const assert = require('assert')
const names = require('./fixtures/releases.json')

for (let name in names) {
  const release = new Release(name)
  const clone = release.guess()

  console.log('[Release]', name, JSON.stringify(release, null, 2), JSON.stringify(names[name], null, 2))

  for (let key in names[name]) {
    if (key === 'guess') {
      continue
    }
    
    assert.equal(
      '' + release[key],
      '' + names[name][key],
      `Founded "${key}" is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`
    )
  }

  for (let key in names[name].guess) {
    assert.equal(
      '' + clone[key],
      '' + names[name].guess[key],
      `Guessed "${key}" is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`
    )
  }
}
