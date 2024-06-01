import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as url from 'url'
import { confirm, input } from '@inquirer/prompts'
import diff from 'cli-diff'
import chalk from 'chalk'
import oleoo from '../src/index.js'
import { logo } from '../cli.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

let cache = null

const progress = (total, accepted, refused) => {
  const current = accepted + refused
  const percentage = Math.round((current / total) * 100) / 100

  console.log(`[${Array(Math.floor(39 * percentage)).fill('#').join('')}${Array(Math.ceil(39 * (1 - percentage))).fill('-').join('')}] ${Math.round(percentage * 100)}%`)
  console.log('Fixtures:', total, '| Accepted:', accepted, '| Refused:', refused)
}

const main = async () => {
  const names = readFileSync(join(__dirname, 'fixtures', 'releases.txt'), 'utf-8').split(/\r?\n/).slice(0, -1)
  const total = names.length
  const accepted = existsSync(join(__dirname, 'fixtures', 'accepted.json')) ? JSON.parse(readFileSync(join(__dirname, 'fixtures', 'accepted.json'), 'utf-8')) : {}
  const refused = existsSync(join(__dirname, 'fixtures', 'refused.json')) ? JSON.parse(readFileSync(join(__dirname, 'fixtures', 'refused.json'), 'utf-8')) : {}
  let name

  logo()
  console.log(chalk.underline('Updating fixtures with new parsing'))
  console.log('')
  console.log(chalk.bold('Resumed'))
  progress(total, Object.keys(accepted).length, Object.keys(refused).length)
  console.log('')
  
  while(name = names.pop()) {
    cache = [total, Object.keys(accepted).length, Object.keys(refused).length]

    const release = oleoo.parse(name)

    if (Object.keys(accepted).includes(name)) {
      const { ...a } = release
      const { ...b } = accepted[name]

      if (JSON.stringify(a) === JSON.stringify(b)) {
        continue
      }

      console.log(diff.default(JSON.stringify(b, null, 2) + '\n', JSON.stringify(a, null, 2) + '\n'))
      const answer = await confirm({ message: `🔄 ${chalk.bold('Accepted')} release diff "${name}", is new parsing correct ?`, default: true })

      if (answer) {
        accepted[name] = release
        writeFileSync(join(__dirname, 'fixtures', 'accepted.json'), JSON.stringify(accepted, null, 2))
        continue
      } else {
        release.comment = await input({ message: "What's wrong ?" })
        refused[name] = release
        writeFileSync(join(__dirname, 'fixtures', 'refused.json'), JSON.stringify(refused, null, 2))
        delete accepted[name]
        writeFileSync(join(__dirname, 'fixtures', 'accepted.json'), JSON.stringify(accepted, null, 2))
        continue
      }
    }

    if (Object.keys(refused).includes(name)) {
      const { ...a } = release
      const { comment, ...b } = refused[name]

      if (JSON.stringify(a) === JSON.stringify(b)) {
        continue
      }

      console.log(diff.default(JSON.stringify(b, null, 2) + '\n', JSON.stringify(a, null, 2) + '\n'))
      const answer = await confirm({ message: `⚠️ ${chalk.bold('Refused')} release diff "${name}", is comment fixed ? (${refused[name].comment}) ?`, default: true })

      if (answer) {
        accepted[name] = release
        writeFileSync(join(__dirname, 'fixtures', 'accepted.json'), JSON.stringify(accepted, null, 2))
        delete refused[name]
        writeFileSync(join(__dirname, 'fixtures', 'refused.json'), JSON.stringify(refused, null, 2))
        continue
      } else {
        release.comment = await input({ message: "What's wrong ?", default: refused[name].comment })
        refused[name] = release
        writeFileSync(join(__dirname, 'fixtures', 'refused.json'), JSON.stringify(refused, null, 2))
        continue
      }
    }
  
    console.log(diff.default(release.original + '\n', release.generated + '\n') || (release.generated + '\n'))
  
    if (await confirm({ message: 'Correct parsing ?', default: true })) {
      accepted[name] = release
      writeFileSync(join(__dirname, 'fixtures', 'accepted.json'), JSON.stringify(accepted, null, 2))
    } else {
      console.log(JSON.stringify(release, null, 2))
      release.comment = await input({ message: "What's wrong ?" })
      refused[name] = release
      writeFileSync(join(__dirname, 'fixtures', 'refused.json'), JSON.stringify(refused, null, 2))
    }
  }
}

main() 
  .then(
    () => {},
    (err) => {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        if (cache) {
          console.log('')
          console.log(chalk.bold('Aborted'))
          progress(...cache)
          console.log('')
        }

        return
      }

      console.warn('[Error]', err.message, err.stack)
    },
  )
