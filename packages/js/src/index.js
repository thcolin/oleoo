import data from '../../../rules.json' with { type: 'json' }

const { source, encoding, resolution, dub, language, flags, erase, ambiguous, title, stringify: order, extensions } = data

// When several keys of source, encoding, resolution or dub match, the last declared one wins: generic keys go first.
const rules = { source, encoding, resolution, dub, language, flags, erase }

// A rule is a pattern, or { pattern, notAfter } when the match must not follow notAfter: it stands in for a lookbehind.
const find = (string, before, rule, after) => {
  const { pattern, notAfter } = typeof rule === 'string' ? { pattern: rule } : rule
  const regexp = new RegExp('(' + before + ')' + pattern + after, 'ig')
  let match

  while (match = regexp.exec(string)) {
    if (!notAfter || !new RegExp('(?:' + notAfter + ')$', 'i').test(string.slice(0, match.index + match[1].length))) {
      return match
    }

    regexp.lastIndex = match.index + 1
  }

  return null
}

// A dub channel flag like 5.1 goes after the source when the release has a dub related flag, after the dub otherwise.
const place = (entry, payload) => entry.dubRelated === order.dubRelated.some(flag => payload.flags.includes(flag)) && payload.flags.includes(entry.flag) && entry.flag

const stringify = (payload, options = {}) => {
  const { flagged = true } = options

  const output = [
    payload.title.replace(/\s+/g, '.'),
    // ...(payload.alternativeTitle ? [`(${payload.alternativeTitle.replace(/\s+/g, '.')})`] : []),
    ...(flagged ? order.afterTitle : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(payload.year ? [payload.year] : []),
    ...((payload.season || (payload.episodes && payload.episodes.length)) ? [
      [
        ...(payload.season ? [`S${`${payload.season}`.padStart(2, '0')}`] : []),
        ...(payload.episodes && payload.episodes.length ? [`${payload.episodes.every(e => /^\d+$/.test(e)) ? 'E' : ''}${payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join(payload.episodes.every(e => /^\d+$/.test(e)) ? '-E' : '-')}`] : []),
      ].join(''),
    ] : []),
    ...(flagged ? order.afterYear : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(payload.language ? [payload.language] : []),
    ...(flagged ? order.afterLanguage : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(payload.resolution && payload.resolution !== 'SD' ? [payload.resolution] : []),
    ...(flagged ? order.afterResolution : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...((payload.source && !(['HDRip'].includes(payload.source) && payload.flags.includes('mHD'))) ? [payload.source] : []),
    ...(flagged ? order.afterSource : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(payload.encoding ? [payload.encoding] : []),
    ...(flagged ? order.afterEncoding : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(payload.dub ? [payload.dub] : []),
    ...(flagged ? order.afterDub : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : place(flag, payload)) || ''),
    ...(flagged ? payload.flags : []).filter(flag => ![
      ...order.afterTitle.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterYear.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterLanguage.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterResolution.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterSource.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterEncoding.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
      ...order.afterDub.map(flag => typeof flag === 'string' ? flag : place(flag, payload)),
    ].includes(flag)),
  ].filter(p => !!p).join('.').concat('-' + (payload.group || 'NOTEAM'))

  return output
}

const parse = (raw = '', options = {}) => {
  const { strict = false, flagged = true, erase = [], defaults = {} } = options

  if (raw.length > 1024) {
    throw new RangeError(`name of ${raw.length} characters: more than 1024 characters`)
  }
  const currentYear = Number(options.currentYear ?? new Date().getFullYear())

  if (Number.isNaN(currentYear)) {
    throw new TypeError('currentYear must be a number, got ' + JSON.stringify(options.currentYear))
  }
  const input = [...(erase || []), ...rules.erase]
    .reduce((input, regexp) => input.replace(new RegExp(`[\.\-]*?${typeof regexp === 'string' ? regexp.replace(/\\\\/g, '\\') : regexp.source}[\.\-]*?`, 'ig' + (typeof regexp === 'string' ? '' : regexp.flags.replace(/[igy]/g, ''))), ''), raw)
    .replace(new RegExp('\\.(' + extensions.join('|') + ')(\\W.*)?$', 'i'), '')
    .trim()

  const payload = {
    type: null,
    year: null,
    source: null,
    encoding: null,
    resolution: null,
    dub: null,
    languages: [],
    language: null,
    season: null,
    seasons: [],
    episode: null,
    episodes: [],
    group: null,
    flags: [],
    ...Object.fromEntries(Object.entries(defaults || {}).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])),
    input: input,
    score: 0,
    valid: false,
  }

  let titleStartPosition = 0
  let titleEndPosition = input.length
  let groupStartPosition = 0

  let match, matches, property, key, patterns, pattern

  // payload.type
  if (match = input.match(/[_\W]S(?:(?:eason|aison)s?[_\W])?\d{1,3}\W?(?:-?EP?\d+)*[_e\.\-\s]/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else if (match = input.match(/\W(?:-?EP?\d+)+(\W)?/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else if (match = input.match(/\W(\d{4}[_\W]\d{2}[_\W]\d{2}[_\W])(\W)?/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else if (match = input.match(/\W(\d{2}[_\W]\d{2}[_\W]\d{4}[_\W])(\W)?/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else if (match = input.match(/\W(?:(?:\d{1,2})x(?:\d{1,3}))+(\W)?/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else {
    payload.type = 'movie'
  }

  // A whole series ("Complete Series"), or COMPLETE right before its seasons ("Complete.S01-S09")
  if (match = input.match(/[_\W](?:(?:the[_\W])?complete[_\W](?:series|seasons?)(?=[_\W]|$)|complete(?=[_\W]S\d{1,3}[_\W]))/i)) {
    payload.type = 'tvshow'

    if (match.index < titleEndPosition) {
      titleEndPosition = match.index
    }

    if ((match.index + match[0].length) > groupStartPosition) {
      groupStartPosition = match.index + match[0].length
    }
  }
  
  // payload.year
  if (
    (match = input.match(/[_\W]((\d{4})[\.\s]?-[\.\s]?(\d{4}))/)) && (
      (Number(match[2]) > 1900 && Number(match[2]) < (currentYear + 5)) &&
      (Number(match[3]) > 1900 && Number(match[3]) < (currentYear + 5))
    )
  ) {
    payload.year = `${match[2]}-${match[3]}`
    payload.score += 1
    payload.flags.push('COLLECTION')

    if (match.index < titleEndPosition) {
      titleEndPosition = match.index
    }

    if ((match.index + match[0].length) > groupStartPosition) {
      groupStartPosition = match.index + match[0].length
    }
  } else if ((matches = [...input.matchAll(/[_\W](\d{4})(?![_\W]\d{2}[_\W]\d{2})/g)].filter(y => !/\d{2}[_\W]\d{2}$/.test(input.slice(0, y.index)) && Number(y[1]) > 1900 && Number(y[1]) < (currentYear + 5))).length) {
    const match = matches.pop()
    payload.year = match[1]
    payload.score += 1

    if (match.index < titleEndPosition) {
      titleEndPosition = match.index
    }

    if ((match.index + match[0].length) > groupStartPosition) {
      groupStartPosition = match.index + match[0].length
    }
  }

  // payload.source, payload.encoding, payload.resolution, payload.dub
  for (property of ['source', 'encoding', 'resolution', 'dub']) {
    for ([key, patterns] of Object.entries(rules[property])) {
      for (pattern of patterns) {
        if (match = find(input, '[_\\W]', pattern, (property === 'dub' ? '([\\.\\-\\s]?\\@?\\d+(kbps)?)?' : '') + '([_\\W]|$)')) {
          payload.score += payload[property] ? 0 : 1
          payload[property] = key
          payload.valid = true

          if (match.index < titleEndPosition) {
            titleEndPosition = match.index
          }

          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }

          break
        }
      }
    }
  }

  // payload.flags
  for ([key, patterns] of Object.entries(rules.flags)) {
    if (ambiguous.flags.includes(key)) {
      continue
    }

    for (pattern of patterns) {
      const anchored = typeof pattern === 'string' && pattern.startsWith('^')

      try {
        if (match = find(input, anchored ? '' : '[_\\W]', pattern, '([_\\W]|$)')) {
          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
  
          if (!anchored && match.index < titleEndPosition) {
            titleEndPosition = match.index
          }
  
          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }
  
          break
        } else if (title.leadingFlags.includes(key) && (match = find(input, '^', pattern, '([_\\W]|$)'))) {
          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
          
          titleStartPosition = match[0].length
        }
      } catch (e) {
        console.warn(e)
      }
    }
  }

  // payload.languages
  for ([key, patterns] of Object.entries(rules.language)) {
    for (pattern of patterns) {
      const offset = titleEndPosition === input.length ? 0 : titleEndPosition

      if (match = find(input.slice(offset), '[_\\W]', pattern, '([_\\W]|$)')) {
        payload.languages.push(key)

        if ((offset + match.index + match[0].length) > groupStartPosition) {
          groupStartPosition = offset + match.index + match[0].length
        }

        break
      }
    }
  }

  if (!payload.languages.length) {
    for ([key, patterns] of Object.entries(rules.language)) {
      for (pattern of patterns) {
        if (match = find(input, '[_\\W]', pattern, '([_\\W]|$)')) {
          if (ambiguous.patterns.includes(pattern) && (match.index + match[0].length) < titleEndPosition) {
            break
          }

          payload.languages.push(key)

          if (match.index < titleEndPosition) {
            titleEndPosition = match.index
          }

          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }

          break
        }
      }
    }
  }

  // payload.flags (ambiguous)
  for ([key, patterns] of Object.entries(rules.flags)) {
    if (!ambiguous.flags.includes(key)) {
      continue
    }

    for (pattern of patterns) {
      const anchored = typeof pattern === 'string' && pattern.startsWith('^')

      try {
        if (match = find(input, anchored ? '' : '[_\\W]', pattern, '([_\\W]|$)')) {
          if (
            !anchored &&
            match.index < titleEndPosition &&
            (match.index + match[0].length) <= (titleEndPosition + 1) &&
            !(new RegExp(key).test(match[0]))
          ) {
            break
          }

          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
  
          if (!anchored && match.index < titleEndPosition) {
            titleEndPosition = match.index
          }
  
          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }
  
          break
        } else if (title.leadingFlags.includes(key) && (match = find(input, '^', pattern, '([_\\W]|$)'))) {
          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
          
          titleStartPosition = match[0].length
        }
      } catch (e) {
        console.warn(e)
      }
    }
  }

  if (payload.flags && payload.flags.length) {
    payload.score += 1
  }

  if (payload.languages && payload.languages.length) {
    payload.score += 1
    payload.language = (
      payload.languages.length === 1 ? payload.languages[0] : [
        'MULTi',
        ...(
          (payload.languages.includes('TRUEFRENCH') && (payload.languages.includes('FRENCH') || payload.languages.includes('VFQ'))) ? ['VF2'] :
          (payload.languages.includes('TRUEFRENCH')) ? ['VFF'] :
          (payload.languages.includes('VFQ')) ? ['VFQ'] : []
        ),
      ].join('-')
    )
  }

  // payload.season, payload.episodes, payload.episode
  if (payload.type === 'tvshow') {
    if (match = input.match(/[_\W]S(?:(?:eason|aison)s?[_\W]?)?(\d{1,3})[_e\.\-\s]/i)) {
      payload.season = Number(match[1])

      if ((match.index + match[0].length) > groupStartPosition) {
        groupStartPosition = match.index + match[0].length
      }

      // A range of seasons ("S01-S10", "S01-10", "Saison 1 à 5")
      if ((matches = input.slice(match.index).match(/^[_\W]S(?:(?:eason|aison)s?[_\W]?)?\d{1,3}(?:-S?|[\.\s]-[\.\s]?S|[\.\s](?:à|a|to)[\.\s]S?)(?:(?:eason|aison)s?[_\W]?)?(\d{1,3})(?=[_\W]|$)/i)) && Number(matches[1]) > payload.season) {
        payload.seasons = Array.from({ length: Number(matches[1]) - payload.season + 1 }, (_, i) => payload.season + i)

        if ((match.index + matches[0].length) > groupStartPosition) {
          groupStartPosition = match.index + matches[0].length
        }
      }
    }
  
    if (match = input.match(/EP?(\d+)\-(\d+)/i)) {
      if (Number(match[2]) - Number(match[1]) >= 9999) {
        throw new RangeError(`episodes ${match[1]} to ${match[2]}: more than 9999 episodes`)
      }

      payload.episodes = Array.from({ length: Number(match[2]) - Number(match[1]) + 1 }, (_, i) => Number(match[1]) + i)
      payload.episode = payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join('-')

      if ((match.index + match[0].length) > groupStartPosition) {
        groupStartPosition = match.index + match[0].length
      }
    } else if ((matches = [...input.matchAll(/EP?(\d+)/ig)]).length) {
      payload.episodes = matches.map(match => Number(match[1]))
      payload.episode = payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join('-')

      if ((matches[matches.length - 1].index + matches[matches.length - 1][0].length) > groupStartPosition) {
        groupStartPosition = matches[matches.length - 1].index + matches[matches.length - 1][0].length
      }
    } else if ((matches = [...input.matchAll(/\W?(?:(\d{1,2})x(\d{1,3}))+(\W)?/ig)]).length) {
      payload.season = Number(matches[0][1])
      payload.episodes = matches.map(match => Number(match[2]))
      payload.episode = payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join('-')

      if ((matches[matches.length - 1].index + matches[matches.length - 1][0].length) > groupStartPosition) {
        groupStartPosition = matches[matches.length - 1].index + matches[matches.length - 1][0].length
      }
    } else if (match = input.match(/\W(\d{4})[_\W](\d{2}[_\W]\d{2})[_\W]?/i)) {
      if (!payload.year || match[1] === payload.year) {
        payload.episode = match[2].replaceAll(/\D/g, '.').replaceAll(/\.+/g, '.')
        payload.episodes = [payload.episode]
        payload.score += payload.year ? 0 : 1
        payload.year = match[1]

        if ((match.index + match[0].length) > groupStartPosition) {
          groupStartPosition = match.index + match[0].length
        }
      }
    } else if (match = input.match(/\W(\d{2}[_\W]\d{2})[_\W](\d{4})[_\W]?/i)) {
      if (!payload.year || match[2] === payload.year) {
        payload.episode = match[1].replaceAll(/\D/g, '.').replaceAll(/\.+/g, '.')
        payload.episodes = [payload.episode]
        payload.score += payload.year ? 0 : 1
        payload.year = match[2]

        if ((match.index + match[0].length) > groupStartPosition) {
          groupStartPosition = match.index + match[0].length
        }
      }
    }
  }

  if (!payload.seasons.length && payload.season !== null) {
    payload.seasons = [payload.season]
  }

  // payload.group
  if (match = input.slice(Math.max(groupStartPosition, titleEndPosition)).match(/(?:by[\W\-])?([\w\.]+)/i)) {
    payload.group = match[1]
      .replace("'s", 's')
      .replace(/[\u0300-\u036f]/g, '') // Diacritic chars, ex: e + `
      .replace(/[\u2000-\u206f]/g, '') // General Punctuation chars
      .replace(/[\u0021-\u0022]/g, ' ') // Punctuation chars, ex: ! "
      .replace(/[\u0027-\u002f]/g, ' ') // Punctuation chars, ex: ' ( ) * + , - .
      .replace(/[\u003a-\u003f]/g, ' ') // Punctuation chars, ex: : ; < = > ?
      .replace(/[\u005b-\u0060]/g, ' ') // Punctuation chars, ex: [ \ ] ^ _ `
      .replace(/[\u007b-\u007f]/g, ' ') // Punctuation chars, ex: { | } ~ DEL
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')[0]

    payload.score += 1
  }

  // payload.title
  payload.title = input
    .slice(titleStartPosition, titleEndPosition)
    .replace(/\.+/g, ' ')
    .normalize('NFD')
    .replace(/'s/i, 's')
    .replace(/\[.+\]/g, '')
    .replace(/[\u0300-\u036f]/g, '') // Diacritic chars, ex: e + `
    .replace(/[\u2000-\u206f]/g, '') // General Punctuation chars
    .replace(/[\u0021-\u0022\u0027\u002a\u002b\u002c\u002e\u002f]/g, ' ') // Punctuation chars, ex: ! " ' * + , .
    .replace(/[\u003a-\u003f]/g, ' ') // Punctuation chars, ex: : ; < = > ?
    .replace(/[\u005c\u005e-\u0060]/g, ' ') // Punctuation chars, ex: \ ^ _ `
    .replace(/[\u007b-\u007f]/g, ' ') // Punctuation chars, ex: { | } ~ DEL
    .replace(/Œ/g, 'OE')
    .replace(/œ/g, 'oe')

  if (match = payload.title.match(/[\.\s]aka[\.\s](.*?)$/i)) {
    payload.title = payload.title.replace(match[0], '')
    payload.alternativeTitle = match[1]
  }

  if (match = payload.title.match(/[\.\s]\-[\.\s]?(.*?)$/i)) {
    payload.title = payload.title.replace(match[0], '')
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
    payload.alternativeTitle = match[1]
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
  }

  if (match = payload.title.match(/\s?\[(.+)\]?\s?/i)) {
    payload.title = payload.title.replace(match[0], '')
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
    payload.alternativeTitle = match[1]
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
  }

  if (match = payload.title.match(/\s?\((.+)\)?\s?/i)) {
    payload.title = payload.title.replace(match[0], '')
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
    payload.alternativeTitle = match[1]
      .replace(/[\u0028\u0029]/g, '')
      .replace(/[\.\s]\u002d[\.\s]?/, ' ')
  }

  payload.title = payload.title
    .replace(/\u002d$/, '')
    .replace(/^\u002d/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(s => title.uppercase.includes(s.toUpperCase()) ? s.toUpperCase() : s)
    .join(' ')
    .replace(/(^([a-zA-Z]))|([ -][a-zA-Z])/g, s => s.toUpperCase())
    .replace(/\W([ivx]+)(\W|$)/ig, s => s.toUpperCase()) // Roman number (XVI)
    .replace(/\W(i+)\W?/ig, s => s.toUpperCase()) // Roman number (III)

  if (payload.alternativeTitle) {
    payload.alternativeTitle = payload.alternativeTitle
      .replace(/\u002d$/, '')
      .replace(/^\u002d/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .map(s => title.uppercase.includes(s.toUpperCase()) ? s.toUpperCase() : s)
      .join(' ')
      .replace(/(^([a-zA-Z]))|([ -][a-zA-Z])/g, s => s.toUpperCase())
      .replace(/\W([ivx]+)(\W|$)/ig, s => s.toUpperCase()) // Roman number (XVI)
      .replace(/\W(i+)\W?/ig, s => s.toUpperCase()) // Roman number (III)

    if ((new RegExp(/^\d{4}$/)).test(payload.alternativeTitle)) {
      payload.year = payload.alternativeTitle
      delete payload.alternativeTitle
    } else if (!payload.year && (new RegExp(/^\d{4}$/)).test(payload.title)) {
      payload.year = payload.title
      payload.title = payload.alternativeTitle
      delete payload.alternativeTitle
    } else if ((new RegExp(/^\d+$/)).test(payload.title)) {
      payload.title = payload.alternativeTitle
      delete payload.alternativeTitle
    }
  }

  if (!payload.title && payload.alternativeTitle) {
    payload.title = payload.alternativeTitle
    delete payload.alternativeTitle
  }

  if (title.franchises.includes(payload.title) && payload.alternativeTitle) {
    payload.title = payload.alternativeTitle
    delete payload.alternativeTitle
  }

  // Year at the beginning of the title ("2002 - The Movie" for example)
  if (!payload.year && (match = payload.title.match(/^(\d{4})\W?(.+$)/))) {
    const exception = title.leadingYears.find(({ year, contains }) => match[1] === year && match[2].toLowerCase().includes(contains))

    if (exception) {
      payload.year = exception.release
    } else {
      payload.year = match[1]
      payload.title = match[2]
    }
  }

  // Manga episode ("One Piece - 123" for example)
  if (payload.type === 'movie' && payload.alternativeTitle && (match = payload.alternativeTitle.match(/^(\d{3,}$)/))) {
    payload.type = 'tvshow'
    payload.episode = match[1]
    payload.episodes = [match[1]]
    delete payload.alternativeTitle
  }

  // Undetected Collection of Movies ("The Movie - 1, 2, 3" for example)
  if (payload.type === 'movie' && (match = payload.title.match(/^(.+)(\d[, \-]\s?){2,}\d$/))) {
    payload.flags.push('COLLECTION')
    payload.title = match[1].trim()
  }

  if (payload.type === 'tvshow' && payload.flags.includes('COLLECTION')) {
    payload.flags = payload.flags.filter(flag => flag !== 'COLLECTION')
  } else if (payload.type === 'tvshow' && payload.seasons.length && payload.flags.includes('COMPLETE')) {
    payload.flags = payload.flags.filter(flag => flag !== 'COMPLETE')
  }

  if (payload.year === '0') {
    payload.year = null
  }

  // payload.output
  payload.output = stringify(payload, { flagged })

  if (strict && !payload.valid) {
    throw new Error('"' + payload.input + '" does\'t follow scene release naming rules')
  }

  return {
    original: payload.input,
    language: payload.language,
    languages: payload.languages,
    source: payload.source,
    encoding: payload.encoding,
    resolution: payload.resolution,
    dub: payload.dub,
    year: payload.year,
    ...((payload.year || '').includes('-') ? {
      // years: payload.year.split('-').map(y => Number(y)),
      // years: Array(1 + payload.year.split('-').sort((a, b) => b - a).filter((_, i, arr) => i === 0 || i === (arr.length - 1)).reduce((acc, curr) => acc ? acc - curr : curr, 0))
      //   .fill(1)
      //   .map((_, i) => Number(payload.year.split('-').sort((a, b) => b - a).pop()) + i),
    } : {}),
    flags: payload.flags,
    season: payload.season,
    seasons: payload.seasons,
    episode: payload.episode,
    episodes: payload.episodes,
    type: payload.type,
    group: payload.group,
    ...(payload.alternativeTitle ? {
      title: payload.title,
      alternativeTitle: payload.alternativeTitle,
      completeTitle: `${payload.title} (${payload.alternativeTitle})`,
    } : {
      title: payload.title,
    }),
    generated: payload.output,
    score: payload.score,
  }
}

const guess = (input, options) => {
  options = Object.assign({}, options, { strict: false })
  const payload = parse(input, options)

  if (!payload.year) {
    payload.year = String(options.currentYear ?? new Date().getFullYear())
  }

  if (!payload.resolution) {
    if (payload.flags.includes('UHD')) {
      payload.resolution = '2160p'
    } else if (['BDSCR', 'BLURAY'].includes(payload.source)) {
      payload.resolution = '1080p'
    } else {
      payload.resolution = 'SD'
    }
  }

  payload.generated = stringify(payload, options)

  return payload
}

const oleoo = { stringify, parse, guess, rules }

export default oleoo
