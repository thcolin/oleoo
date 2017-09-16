# scene-release-parser 🎟💸☠️️

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
const strict = true // if no tags found, it will throw an exception
const defaults = {} // defaults values for : language, resolution and year

const release = new Release('Arrow.S03E01.FASTSUB.VOSTFR.HDTV.x264-ADDiCTiON', strict, defaults)
console.log(release)

/*
{
  original: 'Arrow.S03E01.FASTSUB.VOSTFR.HDTV.x264-ADDiCTiON',
  language: 'VOSTFR',
  source: 'HDTV',
  encoding: 'x264',
  resolution: null,
  dub: null,
  year: null,
  flags: [
    'FASTSUB'
  ],
  season: 3,
  episode: 1,
  type: 'tvshow',
  group: 'ADDiCTiON',
  title: 'Arrow',
  generated: 'Arrow.S03E01.VOSTFR.HDTV.x264-ADDiCTiON',
  score: 5, // bigger is better, max : 8
}
*/
```

## Guess
Unknown informations of a current `Release` can be guessed :

```js
const Release = require('scene-release-parser')

const release = new Release('Bataille a Seattle BDRip', false, [
  'language': 'FRENCH' // default to 'VO'
])

const clone = release.guess()
console.log(clone)

/*
{
  original: 'Bataille a Seattle BDRip',
  language: 'FRENCH',
  source: 'BDRip',
  encoding: null,
  resolution: 'SD', // based on this.source
  dub: null,
  year: '2017', // year of the system
  flags: null,
  season: null,
  episode: null,
  type: 'movie',
  group: null,
  title: 'Bataille A Seattle',
  generated: 'Bataille.A.Seattle.FRENCH.BDRip-NOTEAM',
  score: 1
}
*/
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
| La ligne Verte (1999) MULTi-VF2 [1080p] BluRay x264-PopHD (The Green Mile) | La.Ligne.1999.MULTI.1080p.BLURAY.x264-PopHD |

## TODO
* `rules` keys should be quoted
* Add `boolean flags` for `release.toString()`
  * implement option in `release.generate()` too
  * if `true` will add `release.flags` to generated release name
