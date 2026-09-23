import { readFileSync } from 'fs'
import { join } from 'path'
import * as url from 'url'
import oleoo from '../src/index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const fixture = (file) => readFileSync(join(__dirname, 'fixtures', file), 'utf-8')

const names = [...new Set(fixture('releases.txt').split(/\r?\n/).filter(Boolean))]
const accepted = JSON.parse(fixture('accepted.json'))
const refused = JSON.parse(fixture('refused.json'))

const fields = (expected, actual) => [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
  .filter(key => JSON.stringify(expected[key]) !== JSON.stringify(actual[key]))
  .map(key => `    ${key}: ${JSON.stringify(expected[key])} -> ${JSON.stringify(actual[key])}`)

const failures = []

for (const name of names) {
  const release = oleoo.parse(name)

  if (name in accepted) {
    const lines = fields(accepted[name], release)
    lines.length && failures.push(`[accepted] ${name}\n${lines.join('\n')}`)
  } else if (name in refused) {
    const { comment, ...expected } = refused[name]
    const lines = fields(expected, release)
    lines.length && failures.push(`[refused] ${name} (${comment})\n${lines.join('\n')}`)
  } else {
    failures.push(`[unknown] ${name}\n    neither accepted nor refused, run \`yarn fixtures\``)
  }
}

failures.forEach(failure => console.log(failure + '\n'))
console.log(`${names.length} releases, ${Object.keys(accepted).length} accepted, ${Object.keys(refused).length} refused, ${failures.length} changed`)
process.exit(failures.length ? 1 : 0)
