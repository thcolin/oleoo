import chalk from 'chalk'
import { logo } from '../cli.js'
import oleoo from '../src/index.js'

if (process.argv.length >= 3) {
  logo()
  
  var release = oleoo.parse(process.argv[2], {
    strict: process.argv.includes('--strict'),
    flagged: true, // process.argv.includes('--flagged'),
  })

  console.log(chalk.underline('Debug release parsing'))
  console.log('')
  console.log(`${chalk.bold('Input:')} ${release.original}`)
  console.log(chalk.bold('Output:'), JSON.stringify(release, null, 2))
} else {
  console.log('[Error]', 'Usage: yarn debug "Release.2017.MULTi.1080p.x264.BluRay-TEST"')
}
