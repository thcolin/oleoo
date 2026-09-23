import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const { default: oleoo } = await import(url.pathToFileURL(process.argv[2] ? resolve(process.argv[2]) : join(__dirname, '../src/index.js')))
const fixture = (file) => readFileSync(join(__dirname, '../../../tests/fixtures', file), 'utf-8')

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

// rules.json stays in the regex dialect SPEC.md describes, so that other regex engines can read it.
const rules = JSON.parse(readFileSync(join(__dirname, '../../../rules.json'), 'utf-8'))
const patterns = [
  ...['source', 'encoding', 'resolution', 'dub', 'language', 'flags']
    .flatMap(property => Object.values(rules[property]).flat())
    .flatMap(rule => typeof rule === 'string' ? [rule] : [rule.pattern, rule.notAfter]),
  ...rules.erase,
  ...rules.extensions,
]

const outside = (pattern) => {
  const found = []
  let inClass = false
  let depth = 0

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]

    if (char === '\\') {
      if (!'dswW.-+*?()[]{}|^$/\\'.includes(pattern[i + 1])) {
        found.push('\\' + pattern[i + 1])
      }
      i++
    } else if (inClass) {
      inClass = char !== ']'
    } else if (char === '[') {
      inClass = true
    } else if (char === '(' && pattern[i + 1] === '?' && !':=!'.includes(pattern[i + 2])) {
      found.push('(?' + pattern[i + 2])
    } else if (char === '(' || char === ')') {
      depth += char === '(' ? 1 : -1
    } else if (char === '|' && depth === 0) {
      found.push('|')
    } else if ('+*?}'.includes(char) && pattern[i + 1] === '+') {
      found.push(char + '+')
    }
  }

  return found
}

for (const pattern of patterns) {
  const found = outside(pattern)
  found.length && failures.push(`[dialect] ${pattern}\n    ${found.join(', ')} outside the dialect`)
}

for (const [pattern, expected] of [['(?<!x)a\\b', ['(?<', '\\b']], ['\\\\(?<=a)', ['(?<']], ['a++', ['++']], ['x{2}+', ['}+']], ['[(?<+]a+?', []], ['a|b', ['|']], ['(a|b)[|]', []]]) {
  if (JSON.stringify(outside(pattern)) !== JSON.stringify(expected)) {
    failures.push(`[dialect] the check reads ${pattern} as ${JSON.stringify(outside(pattern))}, not ${JSON.stringify(expected)}`)
  }
}

for (const [name, key, expected] of [
  ['Le.Cœur.des.Œuvres.Œdipe.2010.1080p.BluRay.x264-GRP', 'title', 'Le Coeur Des Oeuvres Oedipe'],
  ['Foo.2010.AD.CH. 720p.HDTV.x264-GRP', 'languages', ['CHiNESE']],
  ['Foo.2010.DTS.5.1.CH. 720p.x264-GRP', 'languages', []],
]) {
  const actual = oleoo.parse(name, options)[key]

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`[rules] ${name}\n    ${key}: ${JSON.stringify(expected)} -> ${JSON.stringify(actual)}`)
  }
}

const defaults = { languages: ['ENGLiSH'] }
oleoo.parse('Foo.2010.1080p.BluRay.x264.FRENCH-GRP', { ...options, defaults })
defaults.languages.length === 1 || failures.push('[options] parse writes into the defaults it is given')

for (const [name, message] of [
  ['Show.S01E1-10000.720p', 'episodes 1 to 10000: more than 9999 episodes'],
  ['a'.repeat(1025), 'name of 1025 characters: more than 1024 characters'],
]) {
  try {
    oleoo.parse(name, options)
    failures.push(`[bounds] ${name.slice(0, 40)} parses instead of throwing`)
  } catch (e) {
    e instanceof RangeError && e.message === message || failures.push(`[bounds] ${name.slice(0, 40)} throws ${e.name}: ${e.message}`)
  }
}

oleoo.parse('Show.S01E1-9999.720p', options).episodes.length === 9999 || failures.push('[bounds] an episode range of 9999 episodes does not parse')
oleoo.parse('a'.repeat(1024), options)

try {
  oleoo.parse('Foo.2010.1080p.BluRay.x264-GRP', { currentYear: 'soon' })
  failures.push('[options] currentYear accepts what is not a number')
} catch (e) {
  e instanceof TypeError || failures.push(`[options] currentYear throws ${e.name}, not a TypeError`)
}

failures.forEach(failure => console.log(failure + '\n'))
console.log(`${process.argv[2] || 'src/index.js'}: ${names.length} releases, ${Object.keys(accepted).length} accepted, ${Object.keys(refused).length} refused, ${failures.length} to review`)
process.exit(failures.length ? 1 : 0)
