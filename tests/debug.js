const Release = require('../src/index.js')

if (process.argv.length < 3) {
  console.log('[Error]', 'Usage: node debug.js "Release.2017.MULTi.1080p.x264.BluRay-TEST"')
  return
}

var release = new Release(process.argv[2])
console.log('[Release]', release)

console.log(JSON.stringify(release))
