# Oleoo

[![npm version](https://img.shields.io/npm/v/oleoo.svg)](https://www.npmjs.com/package/oleoo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)

<div align="center">
<pre>
  
 ▒█████   ██▓    ▓█████  ▒█████   ▒█████ 
▒██▒  ██▒▓██▒    ▓█   ▀ ▒██▒  ██▒▒██▒  ██▒
▒██░  ██▒▒██░    ▒███   ▒██░  ██▒▒██░  ██▒
▒██   ██░▒██░    ▒▓█  ▄ ▒██   ██░▒██   ██░
░ ████▓▒░░██████▒░▒████▒░ ████▓▒░░ ████▓▒░
░ ▒░▒░▒░ ░ ▒░▓  ░░░ ▒░ ░░ ▒░▒░▒░ ░ ▒░▒░▒░ 

┌─────────────────────────────────────┐
| Scene/P2P/Warez release name parser |
└─────────────────────────────────────┘
</pre>
🏴‍☠️✨🎟 - Named after an old French warez forum <a href="http://www.01net.com/actualites/oleoo-ferme-sa-section-illegale-de-telechargement-de-films-382090.html">closed in 2008</a>
</div>

Oleoo is a robust Javascript zero-dependency library for parsing media release names (like movies and TV shows from scene/P2P sources) to extract structured metadata. It intelligently identifies components like title, year, quality, language, and more, handling many common (and uncommon) naming conventions.

## Features

* **Comprehensive Metadata Extraction** identifying:
  * Title (with intelligent cleaning and formatting)
  * Alternative Title (from parentheses, brackets, or after `-`)
  * Year (including ranges like `2001-2003` for `COLLECTION`)
  * Type (**only** `movie` or `tvshow`)
  * Source (BluRay, WEB-DL, HDTV, CAM, etc.)
  * Resolution (1080p, 720p, 4K/2160p, SD, etc.)
  * Encoding (x264, x265/HEVC, XviD, etc.)
  * Audio details (AC3, DTS, AAC, Atmos, channels like 5.1, etc.)
  * Language(s) (MULTi, MULTi-VFF, MULTI-VF2, FRENCH, VOSTFR, VFQ, TRUEFRENCH, ENGLiSH, etc., including combinations)
  * Season and Episode number(s) for TV shows (handles various formats like S01E01, S01E01-E03, 1x01)
  * Release Group
  * Numerous Flags (Extended, Unrated, Director's Cut, Repack, Proper, Collection, Internal, 3D, HDR, Remux, etc.)
* **Robust Parsing:** Handles various delimiters (`.`, ` `, `-`, `_`) and common scene/P2P naming patterns.
* **Flexible Modes:**
    * `parse()`: Strict parsing based on recognized tags.
    * `guess()`: Best-effort parsing that fills in missing year/resolution details.
* **Standardized Output:** Generates a clean, standardized filename based on extracted data.
* **Customizable:** Allows providing default values and custom patterns to erase before parsing.

## Installation

```bash
yarn add oleoo
# or
npm install oleoo
```

## Basic Usage

```javascript
import oleoo from 'oleoo'

oleoo.parse('Mr.Robot.S01.PROPER.VOSTFR.720p.WEB-DL.DD5.1.H264-ARK01')
// {
//   "original": "Mr.Robot.S01.PROPER.VOSTFR.720p.WEB-DL.DD5.1.H264-ARK01",
//   "language": "VOSTFR",
//   "languages": ["VOSTFR"],
//   "source": "WEB-DL",
//   "encoding": "h264",
//   "resolution": "720p",
//   "dub": null,
//   "year": null,
//   "flags": ["PROPER", "DD5.1"],
//   "season": 1,
//   "episode": null,
//   "episodes": [],
//   "type": "tvshow",
//   "group": "ARK01",
//   "title": "Mr Robot",
//   "generated": "Mr.Robot.S01.PROPER.VOSTFR.720p.WEB-DL.DD5.1.h264-ARK01",
//   "score": 6
// }

oleoo.parse('Zero Dark Thirty (2012) [1080p BluRay HDR] [FR(VFF)-EN] [x265 10-bit AC3] [GWEN]')
// {
//   "original": "Zero Dark Thirty (2012) [1080p BluRay HDR] [FR(VFF)-EN] [x265 10-bit AC3] [GWEN]",
//   "language": "MULTi-VF2",
//   "languages": ["TRUEFRENCH", "FRENCH", "ENGLiSH"],
//   "source": "BLURAY",
//   "encoding": "x265",
//   "resolution": "1080p",
//   "dub": "AC3",
//   "year": "2012",
//   "flags": ["10bit", "HDR"],
//   "season": null,
//   "episode": null,
//   "episodes": [],
//   "type": "movie",
//   "group": "GWEN",
//   "title": "Zero Dark Thirty",
//   "generated": "Zero.Dark.Thirty.2012.MULTi-VF2.1080p.10bit.BLURAY.HDR.x265.AC3-GWEN",
//   "score": 8
// }

oleoo.guess('My Movie (2023)', { defaults: { language: 'ENGLiSH', resolution: 'SD' } })
// {
//   "original": "My Movie (2023)",
//   "language": "ENGLiSH",
//   "languages": ["ENGLiSH"],
//   "source": null,
//   "encoding": null,
//   "resolution": "SD",
//   "dub": null,
//   "year": "2023",
//   "flags": null,
//   "season": null,
//   "episode": null,
//   "episodes": [],
//   "type": "movie",
//   "group": null,
//   "title": "My Movie",
//   "generated": "My.Movie.ENGLiSH.2023-NOTEAM",
//   "score": 1
// }

try {
  oleoo.parse('Not.a.Movie-v28.1-macOS', { strict: true })
} catch (error) {
  console.error(error.message)
  // "Not.a.Movie-v28.1-macOS" does't follow scene release naming rules
}
```

## API Reference

### `oleoo.parse(name, [options])`

Parses the release `name` string and returns an object with extracted metadata.

* `name` (String): The release name to parse.
* `options` (Object, optional):
    * `strict` (Boolean, default: `false`): If `true`, throws an error if essential tags (like source, encoding, resolution, or dub) are not found. If `false`, it attempts to parse as much as possible.
    * `flagged` (Boolean, default: `true`): If `true`, includes detected flags (like `EXTENDED`, `DC`, `PROPER`, etc.) in the `generated` output string, placed according to standard conventions. If `false`, these flags are omitted from the `generated` string (but still present in the `flags` array of the result).
    * `erase` (Array<String|RegExp>, default: `[]`): An array of additional regular expression patterns (as strings or RegExp objects) to remove from the input `name` *before* parsing begins. Useful for removing recurring junk specific to your source.
    * `defaults` (Object, default: `{}`): An object to provide fallback values for specific fields if they cannot be parsed. Supported keys: `language`, `resolution`, `year`.

### `oleoo.guess(name, [options])`

Similar to `parse`, but always uses `strict: false` and attempts to infer missing details:
* If `year` is missing, defaults to the current system year (2025).
* If `resolution` is missing, infers based on source (e.g., BluRay -> 1080p) or flags (e.g., UHD -> 2160p), otherwise defaults to `SD`.
* Accepts the same `options` object as `parse` (though `strict` is ignored).

### Return Value (Object)

Both `parse` and `guess` return an object with the following structure:

```typescript
{
  original: string | null,      // Input string after basic cleanup (extension removal, erase patterns)
  language: string | null,      // Primary/combined language code (e.g., "FRENCH", "MULTi", "MULTi-VFF")
  languages: Array<string>,     // Array of all detected language codes (e.g., ["FRENCH", "ENGLiSH"])
  source: string | null,        // Standardized source tag (e.g., "BluRay", "WEB-DL", "HDTV")
  encoding: string | null,      // Standardized encoding tag (e.g., "x264", "x265")
  resolution: string | null,    // Standardized resolution tag (e.g., "1080p", "720p", "2160p", "SD")
  dub: string | null,           // Primary detected audio tag (e.g., "AC3", "DTS", "AAC-5.1") - *See Limitations*
  year: string | null,          // Detected year or year range (e.g., "2023", "2001-2003")
  flags: Array<string> | null,  // Array of detected flags (e.g., ["EXTENDED", "PROPER"]), null if none
  season: number | null,        // Detected season number for TV shows
  episode: string | null,       // Formatted episode number(s) for TV shows (e.g., "01", "01-03")
  episodes: Array<number>,      // Array of detected episode numbers (e.g., [1], [1, 2, 3])
  type: 'movie' | 'tvshow',     // Detected media type
  group: string | null,         // Detected release group
  title: string | null,         // Cleaned and formatted title
  alternativeTitle?: string,    // Optional: Extracted alternative title
  completeTitle?: string,       // Optional: Combined title and alternative title
  generated: string | null,     // Standardized filename generated based on parsed data and `flagged` option
  score: number                 // Parsing score (0-8), higher is better (points for Year, Source, Encoding, Resolution, Dub, Language, Group, Flags)
}
```

## Limitations / Known Issues

While Oleoo aims for broad compatibility, some release name patterns can be challenging:

* **Group Detection:** Can sometimes be confused by tags, alternative titles in parentheses, or multiple hyphenated parts near the end of the filename.
* **Title Boundaries:** Occasionally, tags (especially language tags) might be incorrectly included in the extracted title if the structure is unusual. Filenames without clear separators are difficult.
* **Complex Structures:** Very unconventional filenames, heavy use of nested brackets/parentheses, or ambiguous terms might lead to partial or incorrect parsing.

## Help Improve Oleoo! ❤️

The real world has countless release name variations! Help make Oleoo more robust by testing it with *your* own filenames. More diverse test cases lead to a better parser for everyone.

Contributing test cases is easy:

1.  **Get Ready:** Clone the repo (`git clone https://github.com/thcolin/oleoo.git`) and install dependencies (`cd oleoo && yarn install`).

2.  **Add Your Filenames:** Append your movie/TV show filenames (one per line) to the `./tests/fixtures/releases.txt` file.
    * *Tip:* You can quickly add many names using a command like `ls /path/to/your/movies >> tests/fixtures/releases.txt` (but please review and clean up the added list!).

3.  **Check Parsing & Update Tests:** Run the interactive script:
    ```bash
    yarn test
    ```
    This command parses all names in `releases.txt`. For any new or changed results, it will show the parsed output and ask you to confirm if it's correct (`y`) or incorrect (`n`). If incorrect, add a comment explaining the problem. This updates the `accepted.json` (correct) and `refused.json` (incorrect) fixture files.

4.  **Share Your Findings (Create a PR):**
    * The best way to contribute your new test cases is to **open a Pull Request** on GitHub.
    * Please include your updated versions of these three files in the PR:
        * `./tests/fixtures/releases.txt`
        * `./tests/fixtures/accepted.json`
        * `./tests/fixtures/refused.json`
    * If you were also able to **fix any parsing issues** you found in `src/index.js`, include those code changes in the same PR! **Important:** Modifying the parsing logic (`src/index.js`) can easily introduce regressions (breaking previously correct parses). **This is the main challenge!** Carefully use the `yarn test` script to confirm that your changes only fix the intended issue and do not negatively affect other entries in `accepted.json`.

**Reporting Issues without a PR:**

Found a filename Oleoo doesn't handle correctly? Your bug reports are valuable! If you don't want to create a Pull Request with updated test fixtures, please **open an Issue** on the [project's GitHub Issues page](https://github.com/thcolin/oleoo/issues).

To help fix the issue quickly, please include as much detail as possible in your report:

* **Essential:** The **full original filename** that failed to parse correctly.
* **Highly Recommended:**
    * The **actual JSON output** you got from Oleoo for that filename. You can copy this from the output of the `yarn test` script when you mark the parse as incorrect, or by running `oleoo.parse()` directly. Please format it using Markdown code blocks (\`\`\`json ... \`\`\`).
    * A **description of what's wrong** with the actual output, or what you **expected** the output to be (e.g., "Expected group to be 'XYZ' but got 'ABC'", "Year '2023' was missed", "Flag 'REPACK' should be present").
    * If you used `yarn test` and marked the parse as incorrect, include the **comment** you added explaining the error.

Even just providing the problematic filename is helpful, but more detail makes debugging much faster! Thank you for contributing!

## License

[MIT](./LICENSE.md)
