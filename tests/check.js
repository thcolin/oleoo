import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const { default: oleoo } = await import(url.pathToFileURL(process.argv[2] ? resolve(process.argv[2]) : join(__dirname, '../src/index.js')))
const fixture = (file) => readFileSync(join(__dirname, 'fixtures', file), 'utf-8')

const names = [...new Set(fixture('releases.txt').split(/\r?\n/).filter(Boolean))]
const accepted = JSON.parse(fixture('accepted.json'))
const refused = JSON.parse(fixture('refused.json'))

const fields = (expected, actual) => {
  if (JSON.stringify(expected) === JSON.stringify(actual)) {
    return []
  }

  const lines = [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
    .filter(key => JSON.stringify(expected[key]) !== JSON.stringify(actual[key]))
    .map(key => `    ${key}: ${JSON.stringify(expected[key])} -> ${JSON.stringify(actual[key])}`)

  return lines.length ? lines : ['    key order changed']
}

// Pins the year window so the fixtures give the same result on any date.
const options = { currentYear: 2026 }
const failures = []

for (const name of names) {
  const release = oleoo.parse(name, options)

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

  if (JSON.stringify(oleoo.parse(name, { ...options, strict: false })) !== JSON.stringify(release)) {
    failures.push(`[options] ${name}\n    parse with { strict: false } differs from parse with no options`)
  }
}

if (oleoo.parse('Foo.2010.1080p.BluRay.x264-GRP.[www.site.com]', { ...options, erase: [/\[www.*?\]/] }).original !== 'Foo.2010.1080p.BluRay.x264-GRP') {
  failures.push('[options] erase with a RegExp does not remove its match')
}

if (oleoo.parse('Foo.2031.1080p.BluRay.x264-GRP', options).year !== null || oleoo.parse('Foo.2031.1080p.BluRay.x264-GRP', { currentYear: 2027 }).year !== '2031') {
  failures.push('[options] currentYear does not bound the accepted years')
}

failures.forEach(failure => console.log(failure + '\n'))
console.log(`${process.argv[2] || 'src/index.js'}: ${names.length} releases, ${Object.keys(accepted).length} accepted, ${Object.keys(refused).length} refused, ${failures.length} to review`)
process.exit(failures.length ? 1 : 0)
