const oleoo = require('../src/index.js')

if (process.argv.length < 3) {
  console.log('[Error]', 'Usage: node debug.js "Release.2017.MULTi.1080p.x264.BluRay-TEST"')
  return
}

var release = oleoo.parse(process.argv[2], {
  strict: process.argv[3] === '--strict'
})

console.log('[Release]', process.argv[2], JSON.stringify(release, null, 2))
