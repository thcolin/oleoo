const rules = {
  source: {
    'CAM': ['cam[\\-]?rip', 'cam', 'ts', 'telesync', 'pdvd'],
    'TC': ['tc', 'telecine'],
    'SCREENER': ['dvd[\\-]?scr', 'dvdscreener', 'screener', 'scr', 'ddc'],
    'R5': ['r5'],
    'DVDRip': ['dvd[\\-]?rip'],
    'BDRip': ['bd[\\-]?rip', 'br[\\-]?rip'],
    'HDRip': ['hdrip', 'hdlight', 'mhd', 'hd'],
    'WEB-DL': ['web[\\-]?tv', 'web[\\-]?dl', 'web[\\-]?rip', 'amazonhd', 'netflixhd', 'webhd', 'web'],
    'DVD-R': ['dvd[\\-]?r', 'dvd\\-5', 'dvd\\-9', 'r6\\-dvd', 'dvd'],
    'BLURAY': ['blu[\\-]?ray', 'bdr'],
    'BDSCR': ['bluray\\-scr', 'bdscr'],
    'PDTV': ['pdtv'],
    'SDTV': ['sdtv', 'dsr', 'dsrip', 'satrip', 'dthrip', 'dvbrip'],
    'HDTV': ['hdtv[\\-]?rip', 'hdtv'],
  },
  encoding: {
    'DivX': ['divx'],
    'XviD': ['xvid'],
    'x264': ['x[\\.]?264'],
    'x265': ['x[\\.]?265'],
    'h264': ['h[\\.]?264'],
    'h265': ['h[\\.]?265', 'hevc'],
  },
  resolution: {
    'SD': ['sd'],
    '720p': ['720p'],
    '1080p': ['1080p'],
    '2160p': ['2160p', '4k', 'uhd'],
  },
  dub: {
    'AC3': ['ac3\\.dubbed', 'ac3'],
    'LD': ['ld', 'licro[\\-]?dubbed'],
    'MD': ['md', 'micro[\\-]?dubbed'],
    'DUBBED': ['dubbed'],
  },
  language: {
    'MULTi': ['multi', 'vf2'],
    'TRUEFRENCH': ['truefrench', 'vff', 'vf2'],
    'FRENCH': ['french', 'français', 'francais', 'fr', 'vf', 'vfi', 'vf2'],
    'VFQ': ['vfq', 'vq'],
    'VOSTFR': ['vostfr', 'vostr', 'stfr', 'subfrench'],
    'PERSIAN': ['persian'],
    'AMHARIC': ['amharic'],
    'ARABIC': ['arabic'],
    'CAMBODIAN': ['cambodian'],
    'CHINESE': ['chinese'],
    'CREOLE': ['creole'],
    'DANISH': ['danish'],
    'DUTCH': ['dutch'],
    'ENGLISH': ['english', 'eng', 'en', 'voa'],
    'ESTONIAN': ['estonian'],
    'FILIPINO': ['filipino'],
    'FINNISH': ['finnish'],
    'FLEMISH': ['flemish'],
    'GERMAN': ['german'],
    'GREEK': ['greek'],
    'HEBREW': ['hebrew'],
    'INDONESIAN': ['indonesian'],
    'IRISH': ['irish'],
    'ITALIAN': ['italian', 'ita'],
    'JAPANESE': ['japanese'],
    'KOREAN': ['korean'],
    'LAOTIAN': ['laotian'],
    'LATVIAN': ['latvian'],
    'LITHUANIAN': ['lithuanian'],
    'MALAY': ['malay'],
    'MALAYSIAN': ['malaysian'],
    'MAORI': ['maori'],
    'NORWEGIAN': ['norwegian'],
    'PASHTO': ['pashto'],
    'POLISH': ['polish'],
    'PORTUGUESE': ['portuguese'],
    'ROMANIAN': ['romanian'],
    'RUSSIAN': ['russian'],
    'SPANISH': ['spanish'],
    'SWAHILI': ['swahili'],
    'SWEDISH': ['swedish'],
    'SWISS': ['swiss'],
    'TAGALOG': ['tagalog'],
    'TAJIK': ['tajik'],
    'THAI': ['thai'],
    'TURKISH': ['turkish'],
    'UKRAINIAN': ['ukrainian'],
    'VIETNAMESE': ['vietnamese'],
    'WELSH': ['welsh'],
    'VO': ['vo'],
  },
  flags: {
    '3D': ['3d'],
    'PROPER': ['proper'],
    'LiMiTED': ['limited'],
    'FASTSUB': ['fastsub'],
    'SUBFORCED': ['subforced'],
    'SUBBED': ['subbed'],
    'EXTENDED': ['extended'],
    'THEATRiCAL': ['theatrical'],
    'WORKPRiNT': ['workprint', 'wp'],
    'FANSUB': ['fansub'],
    'REPACK': ['repack'],
    'UNRATED': ['unrated'],
    'NFOFiX': ['nfofix'],
    'NTSC': ['ntsc'],
    'PAL': ['pal'],
    'iNTERNAL': ['internal', 'int'],
    'FESTiVAL': ['festival'],
    'STV': ['stv'],
    'RETAiL': ['retails'],
    'NETFLIX': ['nf', 'netflix'],
    'AMAZON': ['amzn', 'amazon'],
    'DISNEY+': ['dnsp', 'disney+'],
    'REMASTERED': ['remastered'],
    'RATED': ['rated'],
    'CHRONO': ['chrono'],
    'UNCUT': ['uncut'],
    'UNCENSORED': ['uncensored'],
    'COMPLETE': ['complete'],
    'UNTOUCHED': ['untouched'],
    'DC': ['dc'],
    'HDR': ['hdr'],
    'REMUX': ['remux'],
    'DUAL': ['dual'],
    'FiNAL': ['final'],
    'COLORiZED': ['colorized'],
    'RESTORED': ['restored'],
    'WS': ['ws'],
    'DL': ['(?<!web[\\-]?)dl'],
    'DOLBY-DIGITAL': ['dolby[\\.\\s]?digital'],
    'AAC': ['aac'],
    'DTS-HD': ['dts[\\.\\-\\s]hd'],
    'DTS-MA': ['dts[\\.\\-\\s]ma'],
    'TrueHD': ['true[\\.\\-\\s]hd'],
    'DTS': ['^(?!.*(dts[\\.\\-\\s]hd|dts[\\.\\-\\s]ma)).*dts.*$'],
    'HSBS': ['hsbs'],
    'HOU': ['hou'],
    'DOC': ['doc'],
    'RERiP': ['re[\\-]?rip'],
    'DD5.1': ['dd5[\\.\\-\\s]?1', '5[\\.\\-\\s]1'],
    'READNFO': ['read[\\.\\-]?nfo'],
  },
  erase: ['\\[.*?torrent.*?\\]'],
}

const stringify = (payload, options) => [
  payload.title.replace(/\s+/g, '.'),
  ...(payload.year ? [payload.year] : []),
  ...((payload.season || (payload.episodes && payload.episodes.length)) ? [
    [
      ...(payload.season ? [`S${`${payload.season}`.padStart(2, '0')}`] : []),
      ...(payload.episodes && payload.episodes.length ? [`E${payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join('-E')}`] : []),
    ].join(''),
  ] : []),
  ...(payload.language ? [payload.language] : []),
  ...(payload.resolution && payload.resolution !== 'SD' ? [payload.resolution] : []),
  ...(payload.source ? [payload.source] : []),
  ...(payload.encoding ? [payload.encoding] : []),
  ...(payload.dub ? [payload.dub] : []),
  ...(options.flagged ? payload.flags : []),
].join('.').concat('-' + (payload.group || 'NOTEAM'))

const parse = (raw = '', options = { strict: false, flagged: true, erase: [], defaults: {} }) => {
  const input = [...(options.erase || []), ...rules.erase]
    .reduce((input, regexp) => input.replace(new RegExp(`[\.\-]*?${regexp.replace(/\\\\/g, '\\')}[\.\-]*?`, 'ig'), ''), raw)
    .replace(/\.(avi|mp4|mpeg4|mkv|ts|mov|wmv|flv|webm)(\W.*)?$/i, '')
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
    episode: null,
    episodes: [],
    group: null,
    flags: [],
    ...options.defaults,
    input: input,
    score: 0,
    valid: false,
  }

  let titleEndPosition = input.length
  let groupStartPosition = 0

  let match, matches, property, key, patterns, pattern

  // payload.type
  if (match = input.match(/\WS\d+\W?(?:-?E\d+)*(\W)?/i)) {
    titleEndPosition = match.index
    groupStartPosition = match.index + match[0].length
    payload.type = 'tvshow'
  } else if (match = input.match(/\W(?:-?E\d+)+(\W)?/i)) {
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
  
  // payload.year
  if ((matches = [...input.matchAll(/\W(\d{4})/g)].filter(y => !['1080', '2160'].includes(y[1]))).length) {
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
        if (match = input.match(new RegExp('\\W' + pattern + '(\\W|$)', 'i'))) {
          payload[property] = key
          payload.valid = true
          payload.score += 1

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

  // payload.languages
  for ([key, patterns] of Object.entries(rules.language)) {
    for (pattern of patterns) {
      if (match = input.slice(titleEndPosition === input.length ? 0 : titleEndPosition).match(new RegExp('\\W' + pattern + '(\\W|$)', 'i'))) {
        payload.languages.push(key)

        if ((titleEndPosition + match.index + match[0].length) > groupStartPosition) {
          groupStartPosition = titleEndPosition + match.index + match[0].length
        }

        break
      }
    }
  }

  if (!payload.languages.length) {
    for ([key, patterns] of Object.entries(rules.language)) {
      for (pattern of patterns) {
        if (match = input.match(new RegExp('\\W' + pattern + '(\\W|$)', 'i'))) {
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

  // payload.flags
  for ([key, patterns] of Object.entries(rules.flags)) {
    for (pattern of patterns) {
      if (match = input.match(new RegExp('\\W' + pattern + '(\\W|$)', 'i'))) {
        payload.flags.push(key)

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

  if (payload.flags && payload.flags.length) {
    payload.score += 1
  }

  // payload.season, payload.episodes, payload.episode
  if (payload.type === 'tvshow') {
    if (match = input.match(/\WS(\d+)\W?/i)) {
      payload.season = Number(match[1])

      if ((match.index + match[0].length) > groupStartPosition) {
        groupStartPosition = match.index + match[0].length
      }
    }
  
    if ((matches = [...input.matchAll(/E(\d+)/ig)]).length) {
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
    }
  }

  // payload.group
  if (match = input.slice(Math.max(groupStartPosition, titleEndPosition)).match(/(?:by\W)?([\w\.]+)/)) {
    payload.group = match[1]
    payload.score += 1
  }

  // payload.title
  payload.title = input
    .slice(0, titleEndPosition)
    .replace(/\.+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Diacritic chars, ex: e + `
    .replace(/[\u2000-\u206f]/g, '') // General Punctuation chars
    .replace(/[\u0021-\u002f]/g, ' ') // Punctuation chars, ex: ! " # $ % & ' ( ) * + , - . / -- TODO: Should allow: # &
    .replace(/[\u003a-\u003f]/g, ' ') // Punctuation chars, ex: : ; < = > ?
    .replace(/[\u005b-\u0060]/g, ' ') // Punctuation chars, ex: [ \ ] ^ _ `
    .replace(/[\u007b-\u007f]/g, ' ') // Punctuation chars, ex: { | } ~ DEL
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase())
    .replace(/\W(i+)\W?/i, s => s.toUpperCase())
    .replace('3d', '3D')
  
  // payload.output
  payload.output = stringify(payload, options)

  if (options.strict && !payload.valid) {
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
    flags: payload.flags && payload.flags.length ? payload.flags : null,
    season: payload.season,
    episode: payload.episode,
    episodes: payload.episodes,
    type: payload.type,
    group: payload.group,
    title: payload.title,
    generated: payload.output,
    score: payload.score,
  }
}

const guess = (input, options) => {
  const payload = parse(input, Object.assign({}, options, { strict: false }))

  if (!payload.year) {
    payload.year = new Date().getFullYear()
  }

  if (!payload.resolution) {
    if (['UHD'].includes(payload.flags)) {
      payload.resolution = '2160p'
    } else if (['BDSCR', 'BLURAY'].includes(payload.source)) {
      payload.resolution = '1080p'
    } else {
      payload.resolution = 'SD'
    }
  }

  return payload
}

const oleoo = { stringify, parse, guess, rules }

module.exports = oleoo
