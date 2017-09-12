# scene-release-parser

Only one class exported, `Release`: constructor will try to extract all the tags from the release name, remaining parts will construct the title of the media (movie or tv show).

## Installation
Install with `npm` :
```
npm i -S scene-release-parser
```

## Example :
Easiest way to start using the lib is to instantiating a new `Release` object with a scene release name as first argument, it will retrieve all the tags and the name :

```js
const Release = require('scene-release-parser')

// Optionals arguments
var strict = true // if no tags found, it will throw an exception
var defaults = [] // defaults values for : language, resolution and year

var release = new Release('Mr.Robot.S01E05.PROPER.VOSTFR.720p.WEB-DL.DD5.1.H264-ARK01', strict, defaults)

// TYPE
console.log(release.type) // tvshow

// TITLE
console.log(release.title) // Mr Robot

// LANGUAGE
console.log(release.language) // VOSTFR

// YEAR
console.log(release.year) // null (no tag in the release name)
console.log(release.guess().year) // 2015 (year of the system)

// RESOLUTION
console.log(release.resolution) // 720p

// SOURCE
console.log(release.source) // WEB

// DUB
console.log(release.dub) // null (no tag in the release name)

// ENCODING
console.log(release.encoding) // h264

// GROUP
console.log(release.group) // ARK01

// FLAGS
console.log(release.flags) // [PROPER, DD5.1]

// SCORE
console.log(release.score()) // 7 (bigger is better, max : 7)

// ONLY TVSHOW
console.log(release.season) // 1
console.log(release.episode) // 5
```

## Guess
Unknown informations of a current `Release` can be guessed :

```js
const Release = require('scene-release-parser')

var release = new Release('Bataille a Seattle BDRip', false, [
  'language': 'FRENCH' // default to 'VO'
])

// LANGUAGE
console.log(release.language) // null
console.log(release.guess().language) // FRENCH

// RESOLUTION
console.log(release.resolution) // null
console.log(release.guess().resolution) // SD

// YEAR
console.log(release.year) // null
console.log(release.guess().year) // 2017 (current year)

// Will set guessed values to the Release
release = release.guess()

// LANGUAGE
console.log(release.language) // FRENCH

// RESOLUTION
console.log(release.resolution) // SD

// YEAR
console.log(release.year) // 2017 (current year)
```

## Results :
| Original | Generated |
| -------- | --------- |
| Benjamin Button [x264] [HD 720p] [LUCN] [FR].mp4 | Benjamin.Button.FRENCH.720p.HDRip.x264-NOTEAM.mp4 |
| Jamais entre amis (2015) [1080p] MULTI (VFQ-VOA) Bluray x264 AC3-PopHD (Sleeping with Other People).mkv | Jamais.Entre.Amis.2015.MULTI.1080p.BLURAY.x264.AC3-PopHD.mkv |
| La Vie rêvée de Walter Mitty [1080p] MULTi 2013 BluRay x264-Pop (The Secret Life Of Walter Mitty) .mkv | La.Vie.Rêvée.De.Walter.Mitty.2013.MULTI.1080p.BLURAY.x264-Pop.mkv |
| Le Nouveau Stagiaire (2015) The Intern - Multi 1080p - x264 AAC 5.1 - CCATS.mkv | Le.Nouveau.Stagiaire.2015.MULTI.1080p.x264-CCATS.mkv |
| Le prestige (2006) (The Prestige) 720p x264 AAC 5.1 MULTI [NOEX].mkv | Le.Prestige.2006.MULTI.720p.x264-NOTEAM.mkv |
| Les 4 Fantastiques 2015 Truefrench 720p x264 AAC PIXEL.mp4 | Les.4.Fantastiques.2015.TRUEFRENCH.720p.x264-NOTEAM.mp4 |
| One.For.the.Money.2012.1080p.HDrip.French.x264 (by kimo).mkv | One.For.The.Money.2012.FRENCH.1080p.HDRip.x264-NOTEAM.mkv |
| Tower Heist [1080p] MULTI 2011 BluRay x264-Pop  .Le casse De Central Park. .mkv | Tower.Heist.2011.MULTI.1080p.BLURAY.x264-Pop.mkv |

## Bugs
| Original | Generated |
| -------- | --------- |
| The Shawshank Redemption (1994) MULTi (VFQ-VO-VFF) 1080p BluRay x264-PopHD  (Les Évadés) | The.Shawshank.1994.MULTI.1080p.BLURAY.x264-NOTEAM |
| La ligne Verte (1999) MULTi-VF2 [1080p] BluRay x264-PopHD (The Green Mile) | La.Ligne.1999.MULTI.1080p.BLURAY.x264-PopHD |

## TODO
* Refactor `README` code examples with only object structure
* `release.guess().resolution` should consider `release.source`
* Add `boolean flags` for `release.toString()`
  * implement option in `release.generate()` too
  * if `true` will add `release.flags` to generated release name
<!-- * Up to date ! -->
