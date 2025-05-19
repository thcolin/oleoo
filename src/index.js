const rules = {
  source: {
    'CAM': ['cam[\\.\\-\\s]?r?(ip)?', '(hd)?cam', 'ts', 'telesync', 'pdvd'],
    'TC': ['tc', 'telecine'],
    'SCREENER': ['screener', 'scr', 'ddc'],
    'DVDSCr': ['dvd[\\.\\-\\s]?scr', 'dvdscreener'],
    'R5': ['r5'],
    'R6': ['r6'],
    'HDRip': ['hd[\\.\\-\\s]?rip', 'hd[\\.\\-\\s]?l(ight)?', 'mhd', 'hd(web)?', 'hddvdrip'],
    'BRRip': ['br[\\.\\-\\s]?r?(ip)?'],
    'BDRip': ['bd[\\.\\-\\s]?r?(ip)?'],
    'DVD-R': ['dvd[\\.\\-\\s]?r', 'dvd[\\.\\-\\s]?5', 'dvd[\\.\\-\\s]?9', 'r6[\\.\\-\\s]?dvd', 'dvd'],
    'DVDRip': ['dvd[\\.\\-\\s]?rip', '480p'],
    'WEB-DL': ['web[\\.\\-\\s]?tv', 'web[\\.\\-\\s]?dl', 'web[\\.\\-\\s]?r?(ip)?', 'amazonhd', 'netflixhd', 'webhd', 'web', 'weblight'],
    'BLURAY': ['blu[\\.\\-\\s]?ray', 'br(1080|720)p?', 'br'],
    'BDSCR': ['bluray\\-scr', 'bdscr'],
    'PDTV': ['pdtv'],
    'SDTV': ['sdtv', 'dsr', 'ds[\\.\\-\\s]?r?(ip)?', 'sat[\\.\\-\\s]?r?(ip)?', 'dth[\\.\\-\\s]?r?(ip)?', 'dvb[\\.\\-\\s]?r?(ip)?'],
    'HDTV': ['hdtv[\\.\\-\\s]?r?(ip)?', 'hdtv', 'tvriphd'],
    'UHDTV': ['uhdtv[\\.\\-\\s]?r?(ip)?', 'uhdtv'],
    'TVRip': ['tv[\\.\\-\\s]?(r(ip)?)?'],
  },
  encoding: {
    'MPEG2': ['mpeg[\\.\\-\\s]?2'],
    'MPEG4': ['mp(eg)?[\\.\\-\\s]?4'],
    'DivX': ['divx'],
    'XviD': ['xvid(hd)?'],
    'h264': ['h?[\\.\\-\\s]?264'],
    'h265': ['h?[\\.\\-\\s]?265', 'hevc'],
    'x264': ['(avc)?x[\\.\\-\\s]?264'],
    'x265': ['(avc)?x[\\.\\-\\s]?265'],
    'VP9': ['vp9'],
  },
  resolution: {
    'SD': ['sd', '480[pi]'],
    '720p': ['(br)?720p', '1280x720'],
    '1080p': ['(br)?1080[pi]?'],
    '2160p': ['2160p', '4k', 'uhd(r10)?'],
  },
  // Should I keep "2.0", "5.1" and "7.1" only as flags to simplify dub ?
  dub: {
    'MP3': ['mp3'],
    'ACC': ['acc'],
    'AAC': ['aac'],
    'AAC-LC': ['aac[\\.\\-\\s]?lc'],
    'AAC-LC-1.0': ['aac[\\.\\-\\s]?lc[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'AAC-LC-2.0': ['aac[\\.\\-\\s]?lc[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'AAC-LC-5.1': ['aac[\\.\\-\\s]?lc[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'AAC-LC-7.1': ['aac[\\.\\-\\s]?lc[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'AAC-1.0': ['aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'AAC-2.0': ['aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'AAC-5.1': ['aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'AAC-7.1': ['aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'HE-AAC': ['he[\\.\\-\\s]aac'],
    'HE-AAC-1.0': ['he[\\.\\-\\s]aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'HE-AAC-2.0': ['he[\\.\\-\\s]aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'HE-AAC-5.1': ['he[\\.\\-\\s]aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'HE-AAC-7.1': ['he[\\.\\-\\s]aac([\\.\\-\\s]?v\\d+)?[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'AC3': ['ac[\\.\\-\\s]?3(\\.dubbed)?'],
    'AC3-1.0': ['ac[\\.\\-\\s]?3[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'AC3-2.0': ['ac[\\.\\-\\s]?3[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'AC3-5.1': ['ac[\\.\\-\\s]?3[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'AC3-7.1': ['ac[\\.\\-\\s]?3[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'PCM': ['pcm(\\.dubbed)?'],
    'PCM-1.0': ['pcm[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'PCM-2.0': ['pcm[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'PCM-5.1': ['pcm[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'PCM-7.1': ['pcm[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'LPCM': ['lpcm(\\.dubbed)?'],
    'LPCM-1.0': ['lpcm[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'LPCM-2.0': ['lpcm[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'LPCM-5.1': ['lpcm[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'LPCM-7.1': ['lpcm[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'EAC3': ['e[\\.\\-\\s]?ac[\\.\\-\\s]?3'],
    'EAC3-1.0': ['e[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'EAC3-2.0': ['e[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'EAC3-5.1': ['e[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'EAC3-7.1': ['e[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'LPCM': ['lpcm'],
    'OPUS': ['opus'],
    'OPUS-1.0': ['opus[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'OPUS-2.0': ['opus[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'OPUS-5.1': ['opus[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'OPUS-7.1': ['opus[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'FLAC': ['flac'],
    'FLAC-1.0': ['flac[\\.\\-\\s]?1[\\.\\-\\s]0'],
    'FLAC-2.0': ['flac[\\.\\-\\s]?2[\\.\\-\\s]0'],
    'FLAC-5.1': ['flac[\\.\\-\\s]?5[\\.\\-\\s]1'],
    'FLAC-7.1': ['flac[\\.\\-\\s]?7[\\.\\-\\s]1'],
    'DUBBED': ['dubbed'],
  },
  language: {
    'SiLENT': ['muet', 'silent'],
    'MULTi': ['multi?(\\d+)?', 'vf2', 'fr[\\.\\-\\s]en', 'en[\\.\\-\\s]fr', 'mlv', '(dual|2)[\\.\\-\\s]?audio', 'multilang'],
    'VFQ': ['vfq', 'vq', 'ca'],
    'TRUEFRENCH': ['truefrench', '(french[\\.\\-\\s]?)?vff', 'vf2', 'vof'],
    'FRENCH': ['(?<!(vof|true|sub|vff)[\\.\\-\\s]?)french(?![\\.\\-\\s](vof|vff))', 'francais', 'français', '(?<!(s(rt|tr?)|vo|sub|vff)[\\.\\-\\s]?)fra?(?![\\.\\-\\s]s(tr|rt)|vff)', 'vf(?!f)', 'vfi', 'vf2', 'vof(st(fr)?)'],
    'VOSTFR': ['s(rt|tr?)[\\.\\-\\s]?fr', 'fr[\\.\\-\\s]?s(rt|tr?)', 'vo(?!f)(\\w*)stfr', 'vo(?!f)(\\w*)str', 'vo(?!f)(\\w*)stf', 'vo(?!f)(\\w*)st', 'stfr', 'subfr(ench)?'],
    'VOSTA': ['vo(?!f)(\\w*)sta', 'vo(?!f)(\\w*)sten', 'e[\\.\\-\\s]?subs?'],
    'VOST': ['multi(\\d+)?[\\.\\-\\s]?subs?'],
    'PERSiAN': ['persian'],
    'AMHARiC': ['amharic'],
    'ARABiC': ['arabic'],
    'CAMBODiAN': ['cambodian'],
    'CHiNESE': ['chinese', '(?<!\d[\\.\\-\\s]?)ch[\\.\\-\\s]', 'ci', 'chi', 'chs', 'mandarin'],
    'CREOLE': ['creole'],
    'DANiSH': ['danish'],
    'DUTCH': ['dutch', 'nl(subs?)?'],
    'ENGLiSH': ['english', 'eng', 'en', 'voa'],
    'ESTONiAN': ['estonian'],
    'FiLiPiNO': ['filipino'],
    'FiNNiSH': ['finnish'],
    'FLEMiSH': ['flemish'],
    'GERMAN': ['german', 'ge'],
    'GREEK': ['greek'],
    'HEBREW': ['hebrew'],
    'HiNDi': ['hindi'],
    'iNDONESiAN': ['indonesian'],
    'iRiSH': ['irish'],
    'iTALiAN': ['italian', 'ita', 'it'],
    'JAPANESE': ['japanese', 'ja?p'],
    'KOREAN': ['korean', 'kor?(sub)?'],
    'LAOTiAN': ['laotian'],
    'LATViAN': ['latvian'],
    'LiTHUANiAN': ['lithuanian'],
    'MALAY': ['malay'],
    'MALAYSiAN': ['malaysian'],
    'MAORi': ['maori'],
    'NORDiC': ['nordic'],
    'NORWEGiAN': ['norwegian', 'no'],
    'PASHTO': ['pashto', 'pa'],
    'POLiSH': ['polish', 'po'],
    'PORTUGUESE': ['portuguese', 'pt'],
    'ROMANiAN': ['romanian', 'ro'],
    'RUSSiAN': ['russian', 'rus?'],
    'SPANiSH': ['spanish', 'e?sp', 'spa'],
    'SWAHiLi': ['swahili'],
    'SLOVENiAN': ['slovenian', 'slo(subs?)?'],
    'SWEDiSH': ['swedish', 'swe'],
    'SWiSS': ['swiss'],
    'TAGALOG': ['tagalog'],
    'TAJiK': ['tajik'],
    'THAi': ['thai'],
    'TURKiSH': ['turkish'],
    'UKRAiNiAN': ['ukrainian'],
    'ViETNAMESE': ['vietnamese'],
    'WELSH': ['welsh'],
    'VO': ['vo'],
  },
  flags: {
    'Atmos': ['atmos'],
    '8bit': ['8[\\.\\-\\s]?b(its?)?', 'u?hdr8'],
    '10bit': ['10[\\.\\-\\s]?b(its?)?', 'u?hdr10'],
    '2CH': ['2[\\.\\-\\s]?ch'],
    '3CH': ['3[\\.\\-\\s]?ch'],
    '4CH': ['4[\\.\\-\\s]?ch'],
    '5CH': ['5[\\.\\-\\s]?ch'],
    '6CH': ['6[\\.\\-\\s]?ch'],
    'HEVC': ['hevc'],
    'AV1': ['av1'],
    'HD1': ['hd1'],
    'PROPER': ['proper'],
    'COLLECTION': [
      '(?<!criterion[\\.\\-\\s]?)(la[\\.\\-\\s])?(the[\\.\\-\\s])?collec?tion',
      '(la[\\.\\-\\s])?(the[\\.\\-\\s])?(complete[\\.\\-\\s])?saga([\\.\\-\\s]complete)?',
      'coffret',
      '(l\')?int[ée]grale?',
      'duologie',
      'duology',
      'trilogie',
      'trilogy',
      'quadrilogie',
      'quadrilogy',
      'pentalogie',
      'pentalogy',
      'hexalogie',
      'hexalogy',
      'octalogie',
      'octalogy',
      'heptalogie',
      'heptalogy',
      'nonalogie',
      'nonalogy',
      'decalogie',
      'decalogy',
    ],
    'FASTSUB': ['fastsub'],
    'SUBFORCED': ['subforced'],
    'SUBBED': ['subbed'],
    'LiMiTED': ['limited'],
    'EXTENDED': ['ex-?tended([\\.\\-\\s](edition|cut))?', 'ext', 'version[\\.\\-\\s]longue', 'vl', 'sp[ée]ciale?([\\.\\-\\s]\\w+)?[\\.\\-\\s](edition|cut)'],
    'DC': ['director[\\W\\s]?s?([\\.\\-\\s]Cut)?', '(version[\\.\\-\\s])?d[\\.\\-\\s]?c', '(alternate|alternative)[\\.\\-\\s]cut', 'final[\\.\\-\\s]cut'],
    'THEATRiCAL': ['theatrical'],
    'WORKPRiNT': ['workprint', 'wp'],
    'BONUS': ['bonus'],
    'FANSUB': ['fansub'],
    'REPACK': ['repack'],
    'UNRATED': ['unrated'],
    'NFOFiX': ['nfofix'],
    'NTSC': ['ntsc'],
    'PAL': ['pal'],
    'iNTERNAL': ['internal', 'int'],
    'FESTiVAL': ['festival'],
    'STV': ['stv'],
    'RETAiL': ['retails?'],
    'REMASTERED': ['remastered', 'remasteris[eé]e?', 'rm'],
    'RATED': ['rated'],
    'CHRONO': ['chrono'],
    'UNCUT': ['uncut'],
    'UNCENSORED': ['uncensored', '(version[\\.\\-\\s])?non[\\.\\-\\s]censur[ée]e'],
    'CUSTOM': ['custom'],
    'COMPLETE': ['complete'],
    'UNTOUCHED': ['untouched'],
    'AD': ['ad', 'stsm', 's[&\\.\\-\\s]m', 'sourds?[\\.\\-\\s](et)?[\\.\\-\\s]?malentendants?'],
    'HDR': ['hdr'],
    'mHD': ['mhd', '(hd|ultra)[\\.\\-\\s]?l(ight)?'],
    'REMUX': ['remux'],
    'DUAL': ['dual(?![\\.\\-\\s]audio)'],
    'DKSUBS': ['dksubs'],
    'FiNAL': ['(?<!version[\\.\\-\\s])final(?![\\.\\-\\s]?(cut|edition))'],
    'COLORiZED': ['colorized'],
    'NB': ['nb'], // Noir et Blanc
    'RESTORED': ['restored', 'restaur[ée]e?'],
    'WS': ['ws'],
    'DL': ['(?<!web[\\.\\-\\s]?)dl'],
    'DOLBY-DIGITAL': ['dolby[\\.\\s]?digital'],
    'DOLBY-VISION': ['dolby[\\.\\s]?vision'],
    'Dolby': ['dolby(?![\\.\\s]?(vision|digital))'],
    'NETFLIX': ['nf', 'netflix', 'netflixhd'],
    'PCOK': ['pcok'],
    'ARTE': ['arte'],
    'AMZN': ['amzn', 'amazon'],
    'ATVP': ['atvp'],
    'DSNP': ['dsnp', 'disney\\+'],
    'HULU': ['hulu'],
    'HMAX': ['hmax'],
    'HBO': ['hbo'],
    'iTN': ['itunes', 'itn'],
    'VC': ['vc'],
    'SC': ['sc'],
    'AVC': ['avc[\\.\\s]?(x26[45])?'],
    'QEBS5': ['qebs5'],
    'DV': ['dv'],
    'DXVA': ['dxva'],
    'CEE': ['cee'],
    'DTS-HD': ['dts[\\.\\-\\s]hd(?![\\.\\-\\s]?ma)'],
    'DTS-MA': ['dts[\\.\\-\\s]ma'],
    'DTS-HDMA': ['dts[\\.\\-\\s]hd[\\.\\-\\s]?ma'],
    'DTS': ['^(?!.*(dts[\\.\\-\\s]hd(?!china)|dts[\\.\\-\\s]ma|dts[\\.\\-\\s]hd[\\.\\-\\s]?ma)).*dts'],
    'TrueHD': ['true[\\.\\-\\s]?hd'],
    'HSBS': ['hsbs', 'half[\\.\\-\\s]?sbs'],
    'HOU': ['hou'],
    'SDH': ['SDH'],
    'SBS': ['(?<!h(alf)?[\\.\\-\\s]?)SBS'],
    'UHD': ['UHD'],
    'HC': ['HC'],
    'DOC': ['doc'],
    'PPV': ['ppv'],
    'RERiP': ['re[\\-]?rip'],
    'DD1.0': ['dd[\\.\\-\\s]?1[\\.\\-\\s]?0'],
    'DD2.0': ['dd[\\.\\-\\s]?2[\\.\\-\\s]?0'],
    'DD5.1': ['dd[\\.\\-\\s]?5[\\.\\-\\s]?1'],
    'DD7.1': ['dd[\\.\\-\\s]?7[\\.\\-\\s]?1'],
    'DDP1.0': ['dd[p\\+][\\.\\-\\s]?1[\\.\\-\\s]?0'],
    'DDP2.0': ['dd[p\\+][\\.\\-\\s]?2[\\.\\-\\s]?0'],
    'DDP5.1': ['dd[p\\+][\\.\\-\\s]?5[\\.\\-\\s]?1'],
    'DDP7.1': ['dd[p\\+][\\.\\-\\s]?7[\\.\\-\\s]?1'],
    'DDP': ['^(?!.*(dd[p\\+][\\.\\-\\s]?5[\\.\\-\\s]?1|dd[p\\+][\\.\\-\\s]?2[\\.\\-\\s]?0|dd[p\\+][\\.\\-\\s]?1[\\.\\-\\s]?0)).*dd[p\\+]'],
    '1.0': ['^(?!.*(dd[\\.\\-\\s]?1[\\.\\-\\s]?0|dd[p\\+][\\.\\-\\s]?1[\\.\\-\\s]?0|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?1[\\.\\-\\s]0|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?1[\\.\\-\\s]0|opus[\\.\\-\\s]?1[\\.\\-\\s]0|flac[\\.\\-\\s]?1[\\.\\-\\s]0|l?pcm[\\.\\-\\s]?1[\\.\\-\\s]0)).*1[\\.\\-\\s]0'],
    '2.0': ['^(?!.*(dd[\\.\\-\\s]?2[\\.\\-\\s]?0|dd[p\\+][\\.\\-\\s]?2[\\.\\-\\s]?0|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?2[\\.\\-\\s]0|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?2[\\.\\-\\s]0|opus[\\.\\-\\s]?2[\\.\\-\\s]0|flac[\\.\\-\\s]?2[\\.\\-\\s]0|l?pcm[\\.\\-\\s]?2[\\.\\-\\s]0)).*2[\\.\\-\\s]0'],
    '3.0': ['^(?!.*(dd[\\.\\-\\s]?3[\\.\\-\\s]?0|dd[p\\+][\\.\\-\\s]?3[\\.\\-\\s]?0|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?3[\\.\\-\\s]0|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?3[\\.\\-\\s]0|opus[\\.\\-\\s]?3[\\.\\-\\s]0|flac[\\.\\-\\s]?3[\\.\\-\\s]0|l?pcm[\\.\\-\\s]?3[\\.\\-\\s]0)).*3[\\.\\-\\s]0'],
    '5.1': ['^(?!.*(dd[\\.\\-\\s]?5[\\.\\-\\s]?1|dd[p\\+][\\.\\-\\s]?5[\\.\\-\\s]?1|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?5[\\.\\-\\s]1|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?5[\\.\\-\\s]1|opus[\\.\\-\\s]?5[\\.\\-\\s]1|flac[\\.\\-\\s]?5[\\.\\-\\s]1|l?pcm[\\.\\-\\s]?5[\\.\\-\\s]1)).*5[\\.\\-\\s]1'],
    '6.1': ['^(?!.*(dd[\\.\\-\\s]?6[\\.\\-\\s]?1|dd[p\\+][\\.\\-\\s]?6[\\.\\-\\s]?1|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?6[\\.\\-\\s]1|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?6[\\.\\-\\s]1|opus[\\.\\-\\s]?6[\\.\\-\\s]1|flac[\\.\\-\\s]?6[\\.\\-\\s]1|l?pcm[\\.\\-\\s]?6[\\.\\-\\s]1)).*6[\\.\\-\\s]1'],
    '7.1': ['^(?!.*(dd[\\.\\-\\s]?7[\\.\\-\\s]?1|dd[p\\+][\\.\\-\\s]?7[\\.\\-\\s]?1|(he\-)?aac([\\.\\-\\s]?((v\\d+)|lc))?[\\.\\-\\s]?7[\\.\\-\\s]1|e?[\\.\\-\\s]?ac[\\.\\-\\s]?3[\\.\\-\\s]?7[\\.\\-\\s]1|opus[\\.\\-\\s]?7[\\.\\-\\s]1|flac[\\.\\-\\s]?7[\\.\\-\\s]1|l?pcm[\\.\\-\\s]?7[\\.\\-\\s]1)).*7[\\.\\-\\s]1'],
    'LD': ['ld', 'licro[\\-]?dubbed'],
    'MD': ['md', 'micro[\\-]?dubbed'],
    'MONO': ['mono'],
    'STEREO': ['stereo'],
    'READNFO': ['read[\\.\\-]?nfo'],
    'DiRFiX': ['dir[\\.\\-]?fix'],
    'FiXED': ['fixed'],
    'CRITERION': ['crit(erion)?([\\.\\-\\s]?edition)?([\\.\\-\\s]?collection)?'],
    'iMAX': ['imax'],
    '3D': ['3d'],
  },
  erase: ['\\[.*?torrent.*?\\]'],
}

const DUB_RELATED_FLAGS = ['DOLBY-VISION', 'DD1.0', 'DD2.0', 'DD5.1', 'DD7.1', 'DDP2.0', 'DDP5.1', 'DDP7.1', 'DTS-HD', 'DTS-MA', 'DTS-HDMA', 'DTS', 'Dolby', 'Atmos', 'TrueHD', 'AVC', 'DV']

const UPPERCASE_WORDS = [
  '3D', 'XXL', 'USA', 'UK', 'NATO', 'OTAN', 'FBI', 'CIA', 'SWAT', 'NYPD', 'UFO', 'OVNI', 'OK', 'TV',
  'NASA', 'WWII', 'WWI', 'VIP', 'ASAP', 'DIY', 'FAQ', 'SOS', 'RIP', 'AKA', 'POV', 'PS', 'AM', 'PM',
  'BC', 'IQ', 'QI', 'CEO', 'HR', 'PR', 'RSVP', 'ETA', 'FYI', 'ID', 'PIN', 'ATM', 'GPS', 'ADN',
  'DNA', 'LGBT', 'LGBTQ', 'LGBTQIA', 'PDG', 'RH', 'RP', 'VHS', 'LOL', 'MDR', 'JFK', 'JCVD', 'BDE', 'WWE',
  'HLM', 'H2G2', 'UFC', 'LSD', 'MDMA', 'MMA', 'RPG', 'R2D2', 'C3PO', 'BB8', 'TBA', 'TBC', 'BBC', 'TNT', 'VOD',
  'BFG', 'BFF', 'NIMH'
]

const AMBIGUOUS_FLAGS = [
  'AD', 'DOC', 'DUAL', 'FESTiVAL', 'FiNAL', 'LiMiTED', 'FiXED', 'MONO', 'STEREO', 'UNTOUCHED', 'COMPLETE', 'THEATRiCAL', 'BONUS', 'CHRONO'
]

const AMBIGUOUS_PATTERNS = [
  'english', 'francais', 'français', 'cambodian', 'chinese', 'danish', 'dutch', 'estonian', 'filipino', 'finnish', 'flemish', 'german', 'greek',
  'hebrew', 'indonesian', 'irish', 'italian', 'japanese', 'korean', 'laotian', 'latvian', 'lithuanian', 'malay', 'malaysian', 'maori', 'norwegian',
  'pashto', 'polish', 'portuguese', 'romanian', 'russian', 'spanish', 'swahili', 'swedish', 'swiss', 'tagalog', 'tajik', 'thai', 'turkish', 'ukrainian',
  'vietnamese', 'welsh', 'it', 'ru', 'ge', 'en', 'no', 'ro', 'pt', 'po', 'fr', 'jp', 'kor', 'zh', 'ch', 'fi', 'da', 'nl', 'et', 'tl', 'ms', 'ml', 'ja', 'chi'
]

const AFTER_TITLE_FLAGS = [
  '3D',
  'HSBS',
  'HOU',
  'COLLECTION',
]

const AFTER_YEAR_FLAGS = [
  'FiNAL',
  'UNTOUCHED',
  'RESTORED',
  'READNFO',
  'DiRFiX',
  'FiXED',
  
  'CRITERION',
  
  'VC',
  'SC',
  'DC',
  'EXTENDED',
  'THEATRiCAL',
  'BONUS',

  'DKSUBS',
  'PPV',
  'PROPER',
  'REPACK',
  'RERiP',
  'CUSTOM',
  'LiMiTED',

  'DOC',
  'NB',

  'DUAL',
  'COMPLETE',

  'FASTSUB',
  'FANSUB',

  'UNRATED',
  'iNTERNAL',
  'FESTiVAL',
  'STV',
  'REMASTERED',
  'RATED',
  'UNCUT',
  'UNCENSORED',
]

const AFTER_LANGUAGE_FLAGS = [
  'AD',
  'LD',
  'MD',
  'DL',

  'SUBFORCED',
  'SUBBED',

  'WORKPRiNT',
  'iMAX',
]

const AFTER_RESOLUTION_FLAGS = [
  'NETFLIX',
  'AMZN',
  'ATVP',
  'DSNP',
  'HMAX',
  'HBO',
  'HULU',
  'iTN',
  'ARTE',
  'PCOK',

  '10bit',
  '8bit',
  'UHD',
  'HC',
  'NTSC',
  'PAL',
  'QEBS5',
]

const AFTER_SOURCE_FLAGS = [
  'REMUX',
  'CEE',
  'SBS',
  'HDR',
  'mHD',

  '2CH',
  '3CH',
  '4CH',
  '5CH',
  '6CH',

  ...DUB_RELATED_FLAGS,

  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('1.0') && '1.0',
  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('3.0') && '3.0',
  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('2.0') && '2.0',
  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('6.1') && '6.1',
  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('5.1') && '5.1',
  (payload) => DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('7.1') && '7.1',
]

const AFTER_ENCODING_FLAGS = [
  'HEVC',
  'AV1',
]

const AFTER_DUB_FLAGS = [
  'DDP',
  'MONO',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('1.0') && '1.0',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('3.0') && '3.0',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('2.0') && '2.0',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('6.1') && '6.1',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('5.1') && '5.1',
  (payload) => !DUB_RELATED_FLAGS.some(flag => payload.flags.includes(flag)) && payload.flags.includes('7.1') && '7.1',
]

const stringify = (payload, options) => {
  const output = [
    payload.title.replace(/\s+/g, '.'),
    // ...(payload.alternativeTitle ? [`(${payload.alternativeTitle.replace(/\s+/g, '.')})`] : []),
    ...(options.flagged ? AFTER_TITLE_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(payload.year ? [payload.year] : []),
    ...((payload.season || (payload.episodes && payload.episodes.length)) ? [
      [
        ...(payload.season ? [`S${`${payload.season}`.padStart(2, '0')}`] : []),
        ...(payload.episodes && payload.episodes.length ? [`${payload.episodes.every(e => /^\d+$/.test(e)) ? 'E' : ''}${payload.episodes.map(episode => `${episode}`.padStart(2, '0')).join(payload.episodes.every(e => /^\d+$/.test(e)) ? '-E' : '-')}`] : []),
      ].join(''),
    ] : []),
    ...(options.flagged ? AFTER_YEAR_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(payload.language ? [payload.language] : []),
    ...(options.flagged ? AFTER_LANGUAGE_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(payload.resolution && payload.resolution !== 'SD' ? [payload.resolution] : []),
    ...(options.flagged ? AFTER_RESOLUTION_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...((payload.source && !(['HDRip'].includes(payload.source) && payload.flags.includes('mHD'))) ? [payload.source] : []),
    ...(options.flagged ? AFTER_SOURCE_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(payload.encoding ? [payload.encoding] : []),
    ...(options.flagged ? AFTER_ENCODING_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(payload.dub ? [payload.dub] : []),
    ...(options.flagged ? AFTER_DUB_FLAGS : []).map(flag => (typeof flag === 'string' ? (payload.flags.includes(flag) && flag) : flag(payload)) || ''),
    ...(options.flagged ? payload.flags : []).filter(flag => ![
      ...AFTER_TITLE_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_YEAR_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_LANGUAGE_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_RESOLUTION_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_SOURCE_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_ENCODING_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
      ...AFTER_DUB_FLAGS.map(flag => typeof flag === 'string' ? flag : flag(payload)),
    ].includes(flag)),
  ].filter(p => !!p).join('.').concat('-' + (payload.group || 'NOTEAM'))

  return output
}

const parse = (raw = '', options = { strict: false, flagged: true, erase: [], defaults: {} }) => {
  const input = [...(options.erase || []), ...rules.erase]
    .reduce((input, regexp) => input.replace(new RegExp(`[\.\-]*?${regexp.replace(/\\\\/g, '\\')}[\.\-]*?`, 'ig'), ''), raw)
    .replace(/\.(avi|mp4|mpeg4|mkv|ts|m2ts|mov|wmv|flv|webm|m4v)(\W.*)?$/i, '')
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

  let titleStartPosition = 0
  let titleEndPosition = input.length
  let groupStartPosition = 0

  let match, matches, property, key, patterns, pattern

  // payload.type
  if (match = input.match(/\WS(eason[_\W])?\d{1,3}\W?(?:-?EP?\d+)*[e\.-\s]/i)) {
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
  
  // payload.year
  if (
    (match = input.match(/[_\W]((\d{4})[\.\s]?-[\.\s]?(\d{4}))/)) && (
      (Number(match[2]) > 1900 && Number(match[2]) < (new Date().getFullYear() + 5)) &&
      (Number(match[3]) > 1900 && Number(match[3]) < (new Date().getFullYear() + 5))
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
  } else if ((matches = [...input.matchAll(/(?<!\d{2}[_\W]\d{2})[_\W](\d{4})(?![_\W]\d{2}[_\W]\d{2})/g)].filter(y => Number(y[1]) > 1900 && Number(y[1]) < (new Date().getFullYear() + 5))).length) {
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
        if (match = input.match(new RegExp('[_\\W]' + pattern + (property === 'dub' ? '([\\.\\-\\s]?\\@?\\d+(kbps)?)?' : '') + '([_\\W]|$)', 'i'))) {
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
    if (AMBIGUOUS_FLAGS.includes(key)) {
      continue
    }

    for (pattern of patterns) {
      try {
        if (match = input.match(new RegExp((pattern.startsWith('^') ? pattern : '[_\\W]' + pattern) + '([_\\W]|$)', 'i'))) {
          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
  
          if (!pattern.startsWith('^') && match.index < titleEndPosition) {
            titleEndPosition = match.index
          }
  
          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }
  
          break
        } else if (['COLLECTION', 'VC'].includes(key) && (match = input.match(new RegExp('^' + pattern + '([_\\W]|$)', 'i')))) {
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
      if (match = input.slice(titleEndPosition === input.length ? 0 : titleEndPosition).match(new RegExp('[_\\W]' + pattern + '([_\\W]|$)', 'i'))) {
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
        if (match = input.match(new RegExp('[_\\W]' + pattern + '([_\\W]|$)', 'i'))) {
          if (AMBIGUOUS_PATTERNS.includes(pattern) && (match.index + match[0].length) < titleEndPosition) {
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
    if (!AMBIGUOUS_FLAGS.includes(key)) {
      continue
    }

    for (pattern of patterns) {
      try {
        if (match = input.match(new RegExp((pattern.startsWith('^') ? pattern : '[_\\W]' + pattern) + '([_\\W]|$)', 'i'))) {
          if (
            !pattern.startsWith('^') &&
            match.index < titleEndPosition &&
            (match.index + match[0].length) <= (titleEndPosition + 1) &&
            !(new RegExp(key).test(match[0]))
          ) {
            break
          }

          if (!payload.flags.includes(key)) {
            payload.flags.push(key)
          }
  
          if (!pattern.startsWith('^') && match.index < titleEndPosition) {
            titleEndPosition = match.index
          }
  
          if ((match.index + match[0].length) > groupStartPosition) {
            groupStartPosition = match.index + match[0].length
          }
  
          break
        } else if (['COLLECTION', 'VC'].includes(key) && (match = input.match(new RegExp('^' + pattern + '([_\\W]|$)', 'i')))) {
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
    if (match = input.match(/\WS(?:eason[_\W]?)?(\d{1,3})[e\.\-\s]/i)) {
      payload.season = Number(match[1])

      if ((match.index + match[0].length) > groupStartPosition) {
        groupStartPosition = match.index + match[0].length
      }
    }
  
    if (match = input.match(/EP?(\d+)\-(\d+)/i)) {
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
    .replace('Œ', 'OE')
    .replace('œ', 'oe')

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
    .map(s => UPPERCASE_WORDS.includes(s.toUpperCase()) ? s.toUpperCase() : s)
    .join(' ')
    .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase())
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
      .map(s => UPPERCASE_WORDS.includes(s.toUpperCase()) ? s.toUpperCase() : s)
      .join(' ')
      .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase())
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

  if ([
    'Hitchcock',
    'James Bond 007',
    '007',
    'James Bond',
  ].includes(payload.title) && payload.alternativeTitle) {
    payload.title = payload.alternativeTitle
    delete payload.alternativeTitle
  }

  // Year at the beginning of the title ("2002 - The Movie" for example)
  if (!payload.year && (match = payload.title.match(/^(\d{4})\W?(.+$)/))) {
    if (match[1] === '2001' && match[2].toLowerCase().includes('a space odyssey')) {
      payload.year = '1968'
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
    delete payload.flags[payload.flags.indexOf('COLLECTION')]
  } else if (payload.type === 'tvshow' && payload.flags.includes('COMPLETE')) {
    delete payload.flags[payload.flags.indexOf('COMPLETE')]
  }

  if (payload.year === '0') {
    payload.year = null
  }

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
    ...((payload.year || '').includes('-') ? {
      // years: payload.year.split('-').map(y => Number(y)),
      // years: Array(1 + payload.year.split('-').sort((a, b) => b - a).filter((_, i, arr) => i === 0 || i === (arr.length - 1)).reduce((acc, curr) => acc ? acc - curr : curr, 0))
      //   .fill(1)
      //   .map((_, i) => Number(payload.year.split('-').sort((a, b) => b - a).pop()) + i),
    } : {}),
    flags: payload.flags && payload.flags.length ? payload.flags : null,
    season: payload.season,
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

export default oleoo
