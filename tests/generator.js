const Release = require('../src/index.js')
const assert = require('assert')
const fs  = require('fs')

const names = fs.readFileSync(`${__dirname}/fixtures/releases.txt`, 'utf-8').split(/\r?\n/)
const data = {}
let name

while(name = names.shift()) {
  const release = new Release(name)
  data[name] = release

  const clone = release.guess()
  data[name].guess = {}

  if (!data[name].year) {
    data[name].guess.year = clone.year
  }

  if (!data[name].resolution) {
    data[name].guess.resolution = clone.resolution
  }
}

fs.writeFileSync(`${__dirname}/fixtures/releases.json`, JSON.stringify(data, null, 2))
