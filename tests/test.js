const oleoo = require('../src/index.js')
const assert = require('assert')
const names = require('./fixtures/releases.json')

for (let name in names) {
  const release = oleoo.parse(name)
  const guessed = oleoo.guess(name)

  console.log('[Release]', name)
  console.log('Current', ':', JSON.stringify(release, null, 2))
  console.log('Fixture', ':', JSON.stringify(names[name], null, 2))

  for (let key in names[name]) {
    if (key === 'guess') {
      continue
    }

    assert.deepEqual(
      release[key],
      names[name][key],
      `Founded "${key}" is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`
    )
  }

  for (let key in names[name].guess) {
    assert.deepEqual(
      guessed[key],
      names[name].guess[key],
      `Guessed "${key}" is not equal between expected and parsed: \n Expected: "${names[name][key]}" \n Parsed: "${release[key]}".`
    )
  }
}
