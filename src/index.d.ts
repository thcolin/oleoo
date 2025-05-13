/**
 * @file Type declarations for the Oleoo library (src/index.d.ts)
 * @license MIT
 */

// --- Rule Definitions ---

// Define the literal types based on the keys in the runtime rules object.
// In a real .d.ts, we don't have direct access to the runtime object,
// so these would ideally be generated or manually kept in sync.
// For this example, we list them based on the provided JS code.

/** Represents the standardized keys for video sources. */
export type SourceType =
  | 'CAM'
  | 'TC'
  | 'SCREENER'
  | 'DVDSCr'
  | 'R5'
  | 'HDRip'
  | 'BRRip'
  | 'BDRip'
  | 'WEB-DL'
  | 'DVD-R'
  | 'DVDRip'
  | 'BLURAY'
  | 'BDSCR'
  | 'PDTV'
  | 'SDTV'
  | 'HDTV'
  | 'UHDTV'
  | 'TVRip'

/** Represents the standardized keys for video encodings. */
export type EncodingType = 'MPEG2' | 'MPEG4' | 'DivX' | 'XviD' | 'h264' | 'h265' | 'x264' | 'x265'

/** Represents the standardized keys for video resolutions. */
export type ResolutionType = 'SD' | '720p' | '1080p' | '2160p'

/** Represents the standardized keys for audio formats/dubs. */
export type DubType =
  | 'ACC'
  | 'AAC'
  | 'AAC-LC'
  | 'AAC-LC-1.0'
  | 'AAC-LC-2.0'
  | 'AAC-LC-5.1'
  | 'AAC-LC-7.1'
  | 'AAC-1.0'
  | 'AAC-2.0'
  | 'AAC-5.1'
  | 'AAC-7.1'
  | 'HE-AAC'
  | 'HE-AAC-1.0'
  | 'HE-AAC-2.0'
  | 'HE-AAC-5.1'
  | 'HE-AAC-7.1'
  | 'AC3'
  | 'AC3-1.0'
  | 'AC3-2.0'
  | 'AC3-5.1'
  | 'AC3-7.1'
  | 'PCM'
  | 'PCM-1.0'
  | 'PCM-2.0'
  | 'PCM-5.1'
  | 'PCM-7.1'
  | 'EAC3'
  | 'EAC3-1.0'
  | 'EAC3-2.0'
  | 'EAC3-5.1'
  | 'EAC3-7.1'
  | 'LPCM'
  | 'OPUS'
  | 'OPUS-1.0'
  | 'OPUS-2.0'
  | 'OPUS-5.1'
  | 'OPUS-7.1'
  | 'FLAC'
  | 'FLAC-1.0'
  | 'FLAC-2.0'
  | 'FLAC-5.1'
  | 'FLAC-7.1'
  | 'DUBBED'

/** Represents the standardized keys for languages. */
export type LanguageType =
  | 'SiLENT'
  | 'MULTi'
  | 'VFQ'
  | 'TRUEFRENCH'
  | 'FRENCH'
  | 'VOSTFR'
  | 'VOSTA'
  | 'PERSiAN'
  | 'AMHARiC'
  | 'ARABiC'
  | 'CAMBODiAN'
  | 'CHiNESE'
  | 'CREOLE'
  | 'DANiSH'
  | 'DUTCH'
  | 'ENGLiSH'
  | 'ESTONiAN'
  | 'FiLiPiNO'
  | 'FiNNiSH'
  | 'FLEMiSH'
  | 'GERMAN'
  | 'GREEK'
  | 'HEBREW'
  | 'iNDONESiAN'
  | 'iRiSH'
  | 'iTALiAN'
  | 'JAPANESE'
  | 'KOREAN'
  | 'LAOTiAN'
  | 'LATViAN'
  | 'LiTHUANiAN'
  | 'MALAY'
  | 'MALAYSiAN'
  | 'MAORi'
  | 'NORWEGiAN'
  | 'PASHTO'
  | 'POLiSH'
  | 'PORTUGUESE'
  | 'ROMANiAN'
  | 'RUSSiAN'
  | 'SPANiSH'
  | 'SWAHiLi'
  | 'SWEDiSH'
  | 'SWiSS'
  | 'TAGALOG'
  | 'TAJiK'
  | 'THAi'
  | 'TURKiSH'
  | 'UKRAiNiAN'
  | 'ViETNAMESE'
  | 'WELSH'
  | 'VO'

/** Represents the standardized keys for miscellaneous flags. */
export type FlagType =
  | '3D'
  | 'Atmos'
  | '8bit'
  | '10bit'
  | '2CH'
  | '3CH'
  | '4CH'
  | '5CH'
  | '6CH'
  | 'HEVC'
  | 'AV1'
  | 'HD1'
  | 'PROPER'
  | 'COLLECTION'
  | 'FASTSUB'
  | 'SUBFORCED'
  | 'SUBBED'
  | 'LiMiTED'
  | 'EXTENDED'
  | 'DC'
  | 'THEATRiCAL'
  | 'WORKPRiNT'
  | 'FiNAL'
  | 'BONUS'
  | 'FANSUB'
  | 'REPACK'
  | 'UNRATED'
  | 'NFOFiX'
  | 'NTSC'
  | 'PAL'
  | 'iNTERNAL'
  | 'FESTiVAL'
  | 'STV'
  | 'RETAiL'
  | 'REMASTERED'
  | 'RATED'
  | 'CHRONO'
  | 'UNCUT'
  | 'UNCENSORED'
  | 'CUSTOM'
  | 'COMPLETE'
  | 'UNTOUCHED'
  | 'AD'
  | 'HDR'
  | 'mHD'
  | 'REMUX'
  | 'DUAL'
  | 'COLORiZED'
  | 'RESTORED'
  | 'NB'
  | 'WS'
  | 'DL'
  | 'DOLBY-DIGITAL'
  | 'DOLBY-VISION'
  | 'Dolby'
  | 'NETFLIX'
  | 'PCOK'
  | 'ARTE'
  | 'AMZN'
  | 'DSNP'
  | 'HULU'
  | 'HMAX'
  | 'HBO'
  | 'iTN'
  | 'VC'
  | 'SC'
  | 'AVC'
  | 'DV'
  | 'DTS-HD'
  | 'DTS-MA'
  | 'DTS-HDMA'
  | 'DTS'
  | 'TrueHD'
  | 'HSBS'
  | 'SDH'
  | 'UHD'
  | 'HOU'
  | 'DOC'
  | 'RERiP'
  | 'DD1.0'
  | 'DD2.0'
  | 'DD5.1'
  | 'DD7.1'
  | 'DDP1.0'
  | 'DDP2.0'
  | 'DDP5.1'
  | 'DDP7.1'
  | 'DDP'
  | '1.0'
  | '2.0'
  | '3.0'
  | '5.1'
  | '6.1'
  | '7.1'
  | 'LD'
  | 'MD'
  | 'MONO'
  | 'STEREO'
  | 'READNFO'
  | 'DiRFiX'
  | 'FiXED'
  | 'CRITERION'
  | 'iMAX'

/** Structure defining the patterns for a specific rule category (like source, encoding, etc.). */
export interface RulePatterns<T> {
  /** A map where keys are the standardized type names (e.g., "BLURAY") and values are arrays of regex patterns (as strings). */
  [key in T]: string[]
}

/** Structure defining the patterns for flags. */
export interface FlagPatterns {
  /** A map where keys are the standardized flag names (e.g., "PROPER") and values are arrays of regex patterns (as strings). */
  // [key: string]: string[] // Use string index signature for broader compatibility in .d.ts
  [key in FlagType]: string[]
}

/** Structure defining the patterns for erasing parts of the filename. */
export type ErasePatterns = string[]

/**
 * Defines the complete set of rules used by the parser.
 * Contains mappings from standardized keys (like "BLURAY", "x264", "FRENCH", "PROPER")
 * to arrays of string patterns used for regex matching.
 */
export interface OleooRules {
  /** Rules for identifying the video source. */
  source: RulePatterns<SourceType>
  /** Rules for identifying the video encoding. */
  encoding: RulePatterns<EncodingType>
  /** Rules for identifying the video resolution. */
  resolution: RulePatterns<ResolutionType>
  /** Rules for identifying the audio format (dub). */
  dub: RulePatterns<DubType>
  /** Rules for identifying the language(s). */
  language: RulePatterns<LanguageType>
  /** Rules for identifying miscellaneous flags. */
  flags: FlagPatterns
  /** Patterns to erase/remove from the filename before parsing. */
  erase: ErasePatterns
}

// --- Internal Payload & Conditional Flags ---

/** Represents the internal state object used during parsing and by stringify. */
export interface OleooPayload {
  type: MediaType | null
  year: string | null // Can be YYYY or YYYY-YYYY
  source: SourceType | null
  encoding: EncodingType | null
  resolution: ResolutionType | null
  dub: DubType | null
  languages: LanguageType[] // Array of all detected languages before combination
  language: string | null // Combined language string (e.g., "FRENCH", "MULTi-VFF") or null
  season: number | null
  episode: string | null // Formatted episode string (e.g., "01", "01-03") or null
  episodes: number[] // Array of episode numbers
  group: string | null
  flags: FlagType[] // Array of detected standardized flags
  input: string // Original input after initial cleanup
  score: number
  valid: boolean // Internal flag indicating if essential tags were found
  title: string | null // Intermediate title before potential splitting
  alternativeTitle?: string | null // Intermediate alternative title
  output?: string // Generated output name added at the end
  [key: string]: any // Allow potential defaults or other properties
}

/**
 * Represents a rule for placing flags in the output string.
 * Can be a simple FlagType string or a function that decides based on the payload.
 */
export type AfterFlagRule = FlagType | ((payload: OleooPayload) => FlagType | string | false | null | undefined)

// --- Function Options & Results ---

/** Represents the detected media type. */
export type MediaType = 'movie' | 'tvshow'

/** Options for the parse and guess functions. */
export interface OleooOptions {
  /**
   * If true, throws an error if essential tags (source, encoding, resolution, dub) are not found.
   * @default false
   */
  strict?: boolean
  /**
   * If true, includes detected flags in the `generated` output string according to standard placement rules.
   * @default true
   */
  flagged?: boolean
  /**
   * Additional regex patterns (as strings or RegExp objects) to remove from the input name before parsing.
   * @default []
   */
  erase?: (string | RegExp)[]
  /**
   * Default values to use if specific fields cannot be parsed.
   * @default {}
   */
  defaults?: Partial<Pick<OleooPayload, 'language' | 'resolution' | 'year'>>
}

/**
 * Represents the final result object returned by the parse and guess functions.
 */
export interface OleooResult {
  /** Input string after initial cleanup (extension removal, erase patterns). */
  original: string | null
  /** Primary or combined language code (e.g., "FRENCH", "MULTi", "MULTi-VFF"). */
  language: string | null
  /** Array of all detected standardized language codes (e.g., ["FRENCH", "ENGLiSH"]). */
  languages: LanguageType[]
  /** Standardized source tag (e.g., "BLURAY", "WEB-DL", "HDTV"). */
  source: SourceType | null
  /** Standardized encoding tag (e.g., "x264", "x265"). */
  encoding: EncodingType | null
  /** Standardized resolution tag (e.g., "1080p", "720p", "2160p", "SD"). */
  resolution: ResolutionType | null
  /** Standardized audio tag (e.g., "AC3", "DTS", "AAC-5.1"). */
  dub: DubType | null
  /** Detected year or year range (e.g., "2023", "2001-2003"). */
  year: string | null
  /** Array of detected standardized flags (e.g., ["EXTENDED", "PROPER"]), or null if none. */
  flags: FlagType[] | null
  /** Detected season number for TV shows. */
  season: number | null
  /** Formatted episode number(s) string for TV shows (e.g., "01", "01-03"). */
  episode: string | null
  /** Array of detected episode numbers (e.g., [1], [1, 2, 3]). */
  episodes: number[]
  /** Detected media type ('movie' or 'tvshow'). */
  type: MediaType // Type should always be determined
  /** Detected release group. */
  group: string | null
  /** Cleaned and formatted title. */
  title: string // Title should ideally always be determined, even if empty
  /** Optional: Extracted alternative title, if found. */
  alternativeTitle?: string
  /** Optional: Combined title and alternative title, if alternativeTitle exists. */
  completeTitle?: string
  /** Standardized filename generated based on parsed data and the `flagged` option. */
  generated: string // Generated name should always be produced
  /**
   * Parsing score (0-8), indicating how many main components were found
   * (Year, Source, Encoding, Resolution, Dub, Language, Group, Flags). Higher is better.
   */
  score: number
}

// --- Main Exported Object Type ---

/**
 * Interface describing the main exported 'oleoo' object.
 */
export interface Oleoo {
  /**
   * Parses a release name string to extract media metadata. Throws an error in strict mode if essential tags are missing.
   * @param name - The release name string to parse.
   * @param options - Optional configuration for parsing.
   * @returns An object containing the parsed metadata.
   * @throws Will throw an error if `options.strict` is true and essential tags are not found.
   */
  parse: (name: string, options?: OleooOptions) => OleooResult

  /**
   * Parses a release name string, attempting to guess missing year and resolution information. Never throws in strict mode.
   * @param name - The release name string to parse.
   * @param options - Optional configuration for parsing (strict option is ignored).
   * @returns An object containing the parsed metadata, potentially with guessed values.
   */
  guess: (name: string, options?: OleooOptions) => OleooResult

  /**
   * Takes a payload object (similar to the result of parse/guess) and generates a standardized filename string.
   * @param payload - An object containing the media metadata (typically from a parse/guess result).
   * @param options - Optional configuration, primarily the `flagged` option to control flag inclusion.
   * @returns A standardized filename string.
   */
  stringify: (payload: OleooPayload, options?: Pick<OleooOptions, 'flagged'>) => string

  /**
   * The rules object containing all patterns used for parsing.
   */
  rules: Readonly<OleooRules> // Mark as Readonly as users shouldn't modify it directly
}

declare const oleoo: Oleoo
export default oleoo
