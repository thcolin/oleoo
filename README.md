# Oleoo 🎟💸☠️️
[![travis-ci badge](https://travis-ci.org/thcolin/oleoo.svg?branch=master)](https://travis-ci.org/thcolin/oleoo)

Dead simple library trying to extract all the tags from a release name, remaining parts will construct the title of the media (movie or tv show)

Named from an old french warez forum [closed in 2008](http://www.01net.com/actualites/oleoo-ferme-sa-section-illegale-de-telechargement-de-films-382090.html) ☠️

## Installation
Install with `npm` :
```
npm i -S oleoo
```

## How
Exported object has 2 functions, `parse` and `guess`, both take 2 arguments, a `name` to parse and an `options` object where you can define `defaults` values used as fallbacks and a `strict` boolean (if set to `true` it will throw an error, else it will return limited release)

The `guess` method will "fill the blank" of year (based on current system year) and resolution (based on source)

```js
const oleoo = require('oleoo') // import oleoo from 'oleoo'

let release

/* PARSING */
release = oleoo.parse('Arrow.S03E01.FASTSUB.VOSTFR.HDTV.x264-ADDiCTiON', {
  strict: true, // if no main tags found, will throw an exception
  defaults: {} // defaults values for : language, resolution and year
})

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
  episodes: [1],
  type: 'tvshow',
  group: 'ADDiCTiON',
  title: 'Arrow',
  generated: 'Arrow.S03E01.VOSTFR.HDTV.x264-ADDiCTiON',
  score: 5, // bigger is better, max : 8
}
*/

/* GUESSING */
release = oleoo.guess('Bataille a Seattle BDRip', {
  defaults: {
    'language': 'FRENCH' // default to 'VO'
  }
})

console.log(release)

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
  episodes: [],
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
* Add `boolean flags` for `release.toString()`
  * implement option in `release.generate()` too
  * if `true` will add `release.flags` to generated release name
