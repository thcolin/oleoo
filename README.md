# Oleoo 🎟💸☠️️

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
  flagged: true, // add flags to generated relese name (like STV, REMASTERED, READNFO)
  erase: [], // add expressions to erase before parsing
  defaults: {} // defaults values for : language, resolution and year
})

console.log(release)

/*
{
  original: 'Arrow.S03E01.FASTSUB.VOSTFR.HDTV.x264-ADDiCTiON',
  languages: ['VOSTFR'],
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

## Issues :
| Original | Generated |
| -------- | --------- |
| 👻 | 👻 |

## Results :
| Original | Generated |
| -------- | --------- |
| La Grande Cuisine.1978.HDTV.1080i.Untouched.AVC-EAC3.AC3.SubFr-BB85 | La.Grande.Cuisine.1978.1080p.HDTV.AC3.UNTOUCHED-SubFr |
| Zorro.01x01.Arriva.Zorro.XViD.DVDRip.ITA.AC3-iTV | Zorro.S01E01.ITALIAN.DVDRip.XviD.AC3-iTV |
| The Closer - 02x14-2x15 - Serving the King | The.Closer.S02E14-E15-Serving |
| Quand je serai petit | Quand.Je.Serai.Petit-NOTEAM |
| Hedwig And The Angry Inch.avi | Hedwig.And.The.Angry.Inch-NOTEAM |
| Easy Living.1937.VOSTFR.DVDRip.XVid-AC3.afrique31 | Easy.Living.1937.VOSTFR.DVDRip.XviD.AC3-afrique31 |
| The.Invisible.2007.DC.DVDRip.XviD-NQR | The.Invisible.2007.DVDRip.XviD.DC-NQR |
| A.crazy.movie.2007.720p.XviD-NQR | A.Crazy.Movie.2007.720p.XviD-NQR |
| Regular.Show.S05E26.Return.of.Mordecai.and.the.Rigbys.720p.HDTV.x264-W4F | Regular.Show.S05E26.720p.HDTV.x264-W4F |
| Godzilla.x.Kong.The.New.Empire.2024.MULTI.VFQ.1080p.10bit.WEBRip.6CH.x265.HEVC-SERQPH (Godzilla x Kong : Le Nouvel Empire)  | Godzilla.X.Kong.The.New.Empire.2024.MULTi-VFQ.1080p.WEB-DL.h265-SERQPH |
| Reviens-moi (2007) [1080p] BluRay MULTi x264-PopHD.mkv | Reviens.Moi.2007.MULTi.1080p.BLURAY.x264-PopHD |
| Spider-Man.Into.The.Spider-Verse.2018.TRUEFRENCH.BDRip.x264-NEO | Spider.Man.Into.The.Spider.Verse.2018.TRUEFRENCH.BDRip.x264-NEO |
| The.Lion.in.Winter.1968.RESTORED.VOSTFR.1080p.BluRay.X264-AMIABLE | The.Lion.In.Winter.1968.VOSTFR.1080p.BLURAY.x264.RESTORED-AMIABLE |
| Escape.from.New.York.1981.COMPLETE.UHD.BLURAY-COASTER | Escape.From.New.York.1981.2160p.BLURAY.COMPLETE-COASTER |
| Escape From New York 1981 MULTi VFF BluRay 4K HDR DTS-HD MA AC3 x265-HD2 | Escape.From.New.York.1981.MULTi-VFF.2160p.BLURAY.x265.AC3.HDR.DTS-HD-HD2 |
| Syngue.Sabour.Pierre.de.Patience.The.Patience.Stone.2012.SUBFRENCH.720p.BluRay.x264-ROUGH | Syngue.Sabour.Pierre.De.Patience.The.Patience.Stone.2012.VOSTFR.720p.BLURAY.x264-ROUGH |
| [ www.Torrent*.** ] The.Darkest.Minds.2018.MULTi.1080p.WEB-DL.DD5.1.H264-ACOOL.mkv | The.Darkest.Minds.2018.MULTi.1080p.WEB-DL.h264.DD5.1-ACOOL |
| Serendipity (2001) MULTi VF2 [1080p] BluRay x264-PopHD ("Un amour à New York" ou "Heureux hasard") | Serendipity.2001.MULTi-VF2.1080p.BLURAY.x264-PopHD |
| Dragon.Ball.Super.E89.FRENCH.1080P.HDTV.x264-R342 [ www.Torrent*.** ].mkv | Dragon.Ball.Super.E89.FRENCH.1080p.HDTV.x264-R342 |
| The Hitmans BodyGuard (2017) VFQ-ENG AC3 BluRay 1080p x264.GHT (Mon meilleur ennemi) | The.Hitmans.Bodyguard.2017.MULTi-VFQ.1080p.BLURAY.x264.AC3-GHT |
| 2.Fast.2.Furious.2003.MULTi.2160p.UHD.BluRay.x265-OohLaLa | 2.Fast.2.Furious.2003.MULTi.2160p.BLURAY.x265-OohLaLa |
| Ugly Americans - S02 STFR 720p.WEB-DL.x264 AC3 MpEbUtCh3r | Ugly.Americans.S02.VOSTFR.720p.WEB-DL.x264.AC3-MpEbUtCh3r |
| The.Good.German.2006.DVDRip.MULTI.H264.720x480.AAC.MK2017 | The.Good.German.2006.MULTi.DVDRip.h264.AAC-MK2017 |
| La ligne Verte (1999) MULTi-VF2 [1080p] BluRay x264-PopHD (The Green Mile) | La.Ligne.Verte.1999.MULTi-VF2.1080p.BLURAY.x264-PopHD |
| Fear.the.Walking.Dead.S03E01-E02.PROPER.720p.HDTV.x264-AVS | Fear.The.Walking.Dead.S03E01-E02.720p.HDTV.x264.PROPER-AVS |
| Teenage.Mutant.Ninja.Turtles.2012.S05E11E12E13.720p.WEB-DL.AAC2.0.H264-iT00NZ | Teenage.Mutant.Ninja.Turtles.2012.S05E11-E12-E13.720p.WEB-DL.h264-iT00NZ |
| Scream S02E01 German DD51 DL 720p NetflixHD x264-TVS | Scream.S02E01.GERMAN.720p.WEB-DL.x264.DL.DD5.1-TVS |
| Preacher S01E01 Pilot German DD51 DL 720p AmazonHD x264-TVS | Preacher.S01E01.GERMAN.720p.WEB-DL.x264.DL.DD5.1-TVS |
| Noah.German.2014.LD.1080p.BluRay.x264-HCS | Noah.2014.GERMAN.1080p.BLURAY.x264.LD-HCS |
| Snowpiercer.2013.German.AC3.MD.1080p.BluRay.x264-HuNTER | Snowpiercer.2013.GERMAN.1080p.BLURAY.x264.MD-HuNTER |
| 2012.AC3.720p.BluRay.x264-XXL | 2012.720p.BLURAY.x264.AC3-XXL |
| No.Foreigners.Here.100.Percent.British.S01E03.PDTV.x264-C4TV | No.Foreigners.Here.100.Percent.British.S01E03.PDTV.x264-C4TV |
| Supernatural.S09E08.Endlich.wieder.Jungfrau.GERMAN.DUBBED.DL.720p.BluRay.x264-TVP | Supernatural.S09E08.GERMAN.720p.BLURAY.x264.DUBBED.DL-TVP |
| Die.Hoehle.der.Loewen.S01E08.German.HDTVRip.x264-SotW | Die.Hoehle.Der.Loewen.S01E08.GERMAN.HDTV.x264-SotW |
| Police.Ten.7.S21E35.REPACK.720p.HDTV.x264-FiHTV | Police.Ten.7.S21E35.720p.HDTV.x264.REPACK-FiHTV |
| Shortland.Street.S23E180.720p.HDTV.x264-FiHTV | Shortland.Street.S23E180.720p.HDTV.x264-FiHTV |
| Rules.of.Engagement.S05E24.German.DVDRip.x264-iNTENTiON | Rules.Of.Engagement.S05E24.GERMAN.DVDRip.x264-iNTENTiON |
| Edge.of.Tomorrow.3D.HOU.German.DL.1080p.BluRay.x264-EXQUiSiTE | Edge.Of.Tomorrow.GERMAN.1080p.BLURAY.x264.3D.DL.HOU-EXQUiSiTE |
| Friday.The.13th.Part.III.3D.1982.iNTERNAL.BDRip.x264-MARS | Friday.The.13th.Part.III.1982.BDRip.x264.3D.iNTERNAL-MARS |
| Free.Birds.Esst.uns.an.einem.anderen.Tag.3D.HSBS.German.DL.1080p.BluRay.x264-EXQUiSiTE | Free.Birds.Esst.Uns.An.Einem.Anderen.Tag.GERMAN.1080p.BLURAY.x264.3D.DL.HSBS-EXQUiSiTE |
| Nurse.3D.2013.German.DL.720p.BluRay.x264-PussyFoot | Nurse.2013.GERMAN.720p.BLURAY.x264.3D.DL-PussyFoot |
| Dumb.And.Dumber.1994.iNTERNAL.BDRip.x264-LiBRARiANS | Dumb.And.Dumber.1994.BDRip.x264.iNTERNAL-LiBRARiANS |
| The.Mask.1994.iNTERNAL.BDRip.x264-LiBRARiANS | The.Mask.1994.BDRip.x264.iNTERNAL-LiBRARiANS |
| Looters.Tooters.and.Sawn.Off.Shooters.2014.DVDRiP.X264-TASTE | Looters.Tooters.And.Sawn.Off.Shooters.2014.DVDRip.x264-TASTE |
| Transformers.Dark.Of.The.Moon.2011.3D.MULTi.1080p.BluRay.x264-LUNETTES | Transformers.Dark.Of.The.Moon.2011.MULTi.1080p.BLURAY.x264.3D-LUNETTES |
| The.Rover.2014.DUAL.COMPLETE.BLURAY-XORBiTANT | The.Rover.2014.BLURAY.COMPLETE.DUAL-XORBiTANT |
| Hannah.Arendt.2012.DUAL.COMPLETE.BLURAY-SharpHD | Hannah.Arendt.2012.BLURAY.COMPLETE.DUAL-SharpHD |
| The.Sugarland.Express.1974.MULTi.1080p.BluRay.x264-ULSHD | The.Sugarland.Express.1974.MULTi.1080p.BLURAY.x264-ULSHD |
| Wer.spinnt.denn.da.Herr.Doktor.1982.German.1080p.BluRay.x264-iFPD | Wer.Spinnt.Denn.Da.Herr.Doktor.1982.GERMAN.1080p.BLURAY.x264-iFPD |
| Anflug.Alpha.1.German.1971.COMPLETE.PAL.DVDR-MOViEiT | Anflug.Alpha.1.1971.GERMAN.DVD-R.PAL.COMPLETE-MOViEiT |
| Angriff.der.Urzeitmonster.German.2006.COMPLETE.PAL.DVDR-MOViEiT | Angriff.Der.Urzeitmonster.2006.GERMAN.DVD-R.PAL.COMPLETE-MOViEiT |
| Mr.Peabody.And.Sherman.2014.NTSC.DVDR-JFKDVD | Mr.Peabody.And.Sherman.2014.DVD-R.NTSC-JFKDVD |
| Ein.Leben.fuer.den.Tod.German.2010.LD.DVDRip.XviD-KLASSiGER | Ein.Leben.Fuer.Den.Tod.2010.GERMAN.DVDRip.XviD.LD-KLASSiGER |
| The.Purge.Anarchy.German.DL.AC3.Dubbed.1080p.BluRay.x264-Pleaders | The.Purge.Anarchy.GERMAN.1080p.BLURAY.x264.DUBBED.DL-Pleaders |
| 22.Jump.Street.GERMAN.DL.AC3.Dubbed.1080p.BluRay.x264-SOV | 22.Jump.Street.GERMAN.1080p.BLURAY.x264.DUBBED.DL-SOV |
| Tammy.Voll.abgefahren.German.DL.AC3.Dubbed.720p.WebHD.h264-PsO | Tammy.Voll.Abgefahren.GERMAN.720p.WEB-DL.h264.DUBBED.DL-PsO |
| Faster, Pussycat ! Kill ! Kill !. 1965.Russ Meyer.VOSTFR.Blu-Ray 720p.Liosaa (RU) / Popo | Faster.Pussycat.Kill.Kill.1965.VOSTFR.720p.BLURAY-Liosaa |
| Kiss the blood off my hands - (Norman FOSTER) - 1948 - VOSTFR - Dvdrip-x264 - kerfiche | Kiss.The.Blood.Off.My.Hands.Norman.Foster.1948.VOSTFR.DVDRip.x264-kerfiche |
| Scary Movie 1 (2000) - 1080p FR EN x264 ac3 mHDgz | Scary.Movie.1.2000.MULTi.1080p.x264.AC3-mHDgz |
| Elektra 2005 [J.Garner, T.Stamp] BRRIP-H264-720P & AC3-5.1-VFF-STFR [Calinos1] | Elektra.2005.MULTi-VFF.720p.BDRip.h264.AC3.DD5.1-Calinos1 |
| Tower Heist [1080p] MULTI 2011 BluRay x264-Pop  .Le casse De Central Park. | Tower.Heist.2011.MULTi.1080p.BLURAY.x264-Pop |
| Star.Wars.Episode.I.The.Phantom.Menace.1999.MULTi.1080p.BluRay.x264-LOST | Star.Wars.Episode.I.The.Phantom.Menace.1999.MULTi.1080p.BLURAY.x264-LOST |
| Star Wars Episode 6 Le Retour du Jedi 1983 Truefrench BDrip x264-BBer | Star.Wars.Episode.6.Le.Retour.Du.Jedi.1983.TRUEFRENCH.BDRip.x264-BBer |
| Star Wars Episode 5 L'Empire contre-attaque 1980 Truefrench BDrip x264-BBer | Star.Wars.Episode.5.L.Empire.Contre.Attaque.1980.TRUEFRENCH.BDRip.x264-BBer |
| Star Wars Episode 4 Un Nouvel espoir 1977 Truefrench BDrip x264-BBer | Star.Wars.Episode.4.Un.Nouvel.Espoir.1977.TRUEFRENCH.BDRip.x264-BBer |
| Star Wars Episode 3 La Revanche des Sith 2005 Truefrench BDrip x264-BBer | Star.Wars.Episode.3.La.Revanche.Des.Sith.2005.TRUEFRENCH.BDRip.x264-BBer |
| Star Wars Episode 2 L'Attaque des clones 2002 Truefrench BDrip x264-BBer | Star.Wars.Episode.2.L.Attaque.Des.Clones.2002.TRUEFRENCH.BDRip.x264-BBer |
| Star Wars Episode 1 La Menace fantome 1999 Truefrench BDrip x264-BBer | Star.Wars.Episode.1.La.Menace.Fantome.1999.TRUEFRENCH.BDRip.x264-BBer |
| One.For.the.Money.2012.1080p.HDrip.French.x264 (by kimo) | One.For.The.Money.2012.FRENCH.1080p.HDRip.x264-kimo |
| Les 4 Fantastiques 2015 Truefrench 720p x264 AAC PIXEL | Les.4.Fantastiques.2015.TRUEFRENCH.720p.x264.AAC-PIXEL |
| Le prestige (2006) (The Prestige) 720p x264 AAC 5.1 MULTI [NOEX] | Le.Prestige.2006.MULTi.720p.x264.AAC.DD5.1-NOEX |
| Le Nouveau Stagiaire (2015) The Intern - Multi 1080p - x264 AAC 5.1 - CCATS | Le.Nouveau.Stagiaire.2015.MULTi.1080p.x264.AAC.DD5.1-CCATS |
| La Vie revee de Walter Mitty [1080p] MULTi 2013 BluRay x264-Pop (The Secret Life Of Walter Mitty) | La.Vie.Revee.De.Walter.Mitty.2013.MULTi.1080p.BLURAY.x264-Pop |
| Jamais entre amis (2015) [1080p] MULTI (VFQ-VOA) Bluray x264 AC3-PopHD (Sleeping with Other People) | Jamais.Entre.Amis.2015.MULTi-VFQ.1080p.BLURAY.x264.AC3-PopHD |
| Benjamin Button [x264] [HD 720p] [LUCN] [FR] | Benjamin.Button.FRENCH.720p.HDRip.x264-NOTEAM |
| Lone.Survivor.2013.FANSUB.VOSTFR.DVDSCR.XVID.AC3-NIKOo | Lone.Survivor.2013.VOSTFR.SCREENER.XviD.AC3.FANSUB-NIKOo |
| Women.In.Trouble.2011.TRUEFRENCH.DVDRiP.XViD-UTT | Women.In.Trouble.2011.TRUEFRENCH.DVDRip.XviD-UTT |
| With.This.Ring.2015.RERiP.FRENCH.DVDRip.x264.AC3-DesTroY | With.This.Ring.2015.FRENCH.DVDRip.x264.AC3.RERiP-DesTroY |
| Mommy.2014.FRENCH.BDRip.x264-PRiDEHD | Mommy.2014.FRENCH.BDRip.x264-PRiDEHD |
| Wild.Child.2008.TRUEFRENCH.BRRip.XviD.AC3-LiberTeam | Wild.Child.2008.TRUEFRENCH.BDRip.XviD.AC3-LiberTeam |
| Meet Bill 2012 TRUEFRENCH DvDRiP Xvid-TFTD | Meet.Bill.2012.TRUEFRENCH.DVDRip.XviD-TFTD |
| White.Bird.In.A.Blizzard.2014.LiMiTED.FRENCH.DVDRip.XviD.AC3-DesTroY | White.Bird.In.A.Blizzard.2014.FRENCH.DVDRip.XviD.AC3.LiMiTED-DesTroY |
| While.Were.Young.2014.FRENCH.BDRip.x264-PRiDEHD | While.Were.Young.2014.FRENCH.BDRip.x264-PRiDEHD |
| Marvels.Agent.Carter.S01.VOSTFR.720p.WEB-DL.DD5.1.H.264-SEEHD | Marvels.Agent.Carter.S01.VOSTFR.720p.WEB-DL.h264.DD5.1-SEEHD |
| Weeds.S01.REPACK.MULTI.720p.BluRay.x264-DWS | Weeds.S01.MULTi.720p.BLURAY.x264.REPACK-DWS |
| Marvels.Agent.Carter.S01E03.VOSTFR.720p.WEB-DL.DD5.1.H.264-LTL | Marvels.Agent.Carter.S01E03.VOSTFR.720p.WEB-DL.h264.DD5.1-LTL |
| Water.For.Elephants.2011.FRENCH.SUBFORCED.BRRip.x264.AC3-FUNKY | Water.For.Elephants.2011.FRENCH.BDRip.x264.AC3.SUBFORCED-FUNKY |
| Marvels.Agent.Carter.S01E02.VOSTFR.720p.HDTV.x264-LTL | Marvels.Agent.Carter.S01E02.VOSTFR.720p.HDTV.x264-LTL |
| Marvels.Agent.Carter.S01E01.VOSTFR.720p.HDTV.x264-LTL | Marvels.Agent.Carter.S01E01.VOSTFR.720p.HDTV.x264-LTL |
| Veronica Mars 2014 TRUEFRENCH BDRip XviD AC3-FrIeNdS | Veronica.Mars.2014.TRUEFRENCH.BDRip.XviD.AC3-FrIeNdS |
| Marvels.Agent.Carter.S01E01.FASTSUB.VOSTFR.720p.HDTV.x264-ADDiCTiON | Marvels.Agent.Carter.S01E01.VOSTFR.720p.HDTV.x264.FASTSUB-ADDiCTiON |
| Ma.Premiere.Fois.2012.FRENCH.720p.BluRay.x264-CARPEDIEM | Ma.Premiere.Fois.2012.FRENCH.720p.BLURAY.x264-CARPEDIEM |
| Manhattan.S01E01.FRENCH.HDTV.x264-CaCoLaC | Manhattan.S01E01.FRENCH.HDTV.x264-CaCoLaC |
| Magic.In.The.Moonlight.2014.FRENCH.BRRip.x264.AC3-DesTroY | Magic.In.The.Moonlight.2014.FRENCH.BDRip.x264.AC3-DesTroY |
| Un Peu.Beaucoup.Aveuglement.2014.FRENCH.WEB-DL.1080p.x264-SVR | Un.Peu.Beaucoup.Aveuglement.2014.FRENCH.1080p.WEB-DL.x264-SVR |
| Transformers.Age.Of.Extinction.2014.TRUEFRENCH.DVDRip.x264.AC3-DesTroY | Transformers.Age.Of.Extinction.2014.TRUEFRENCH.DVDRip.x264.AC3-DesTroY |
| Liberal.Arts.2012.FANSUB.VOSTFR.BRRiP.XviD-NIKOo | Liberal.Arts.2012.VOSTFR.BDRip.XviD.FANSUB-NIKOo |
| Total.recall.1990.FRENCH.BRRIP.X264.AC3-KENPACHI | Total.Recall.1990.FRENCH.BDRip.x264.AC3-KENPACHI |
| Les.Gorilles.2014.TRUEFRENCH.WEBRip.XviD-SVR | Les.Gorilles.2014.TRUEFRENCH.WEB-DL.XviD-SVR |
| Tomorrowland.2015.TRUEFRENCH.720p.WEB-DL.AC3.x264-TonTon | Tomorrowland.2015.TRUEFRENCH.720p.WEB-DL.x264.AC3-TonTon |
| La.Vie.D.Adele.2013.FRENCH.WORKPRINT.XViD-ATN | La.Vie.D.Adele.2013.FRENCH.XviD.WORKPRiNT-ATN |
| The.Worlds.End.2013.FRENCH.SUBFORCED.BRRip.x264.AC3-FUNKY | The.Worlds.End.2013.FRENCH.BDRip.x264.AC3.SUBFORCED-FUNKY |
| La.Veritable.Histoire.Du.Petit.Chaperon.Rouge.FRENCH.DVDRiP.XviD | La.Veritable.Histoire.Du.Petit.Chaperon.Rouge.FRENCH.DVDRip.XviD-NOTEAM |
| The.Wind.Rises.2013.FRENCH.BRRip.x264.AC3-DesTroY | The.Wind.Rises.2013.FRENCH.BDRip.x264.AC3-DesTroY |
| La.Planete.Des.Singes.L'affrontement.TRUEFRENCH.720p.x264.HDLIGHT | La.Planete.Des.Singes.L.Affrontement.TRUEFRENCH.720p.HDRip.x264-NOTEAM |
| The Ten 2011 TRUEFRENCH SUBFORCED DVDRIP XVID-FwD | The.Ten.2011.TRUEFRENCH.DVDRip.XviD.SUBFORCED-FwD |
| La.French.2014.FRENCH.BRRip.x264.AC3-DesTroY | La.French.2014.FRENCH.BDRip.x264.AC3-DesTroY |
| The Spirit 2009 TRUEFRENCH DVDRiP XViD AC3-FwD | The.Spirit.2009.TRUEFRENCH.DVDRip.XviD.AC3-FwD |
| Inherent.Vice.2014.FRENCH.BRRip.XviD-DesTroY | Inherent.Vice.2014.FRENCH.BDRip.XviD-DesTroY |
| The.Maze.Runner.2014.TRUEFRENCH.BDRip.XviD-GLUPS | The.Maze.Runner.2014.TRUEFRENCH.BDRip.XviD-GLUPS |
| The.Master.2012.FRENCH.BDRiP.XViD-AViTECH | The.Master.2012.FRENCH.BDRip.XviD-AViTECH |
| How.to.Train.Your.Dragon.2.2014.FRENCH.BDRip.x264-PRiDEHD | How.To.Train.Your.Dragon.2.2014.FRENCH.BDRip.x264-PRiDEHD |
| The.Man.In.The.High.Castle.S01E01.Pilot.720p.WEBRip.DD5.1.x264-FtDL | The.Man.In.The.High.Castle.S01E01.720p.WEB-DL.x264.DD5.1-FtDL |
| How.Do.You.Know.2010.TRUEFRENCH.DVDRip.XviD-LiberTeam | How.Do.You.Know.2010.TRUEFRENCH.DVDRip.XviD-LiberTeam |
| The.Longest.Ride.2015.FRENCH.BDRip.x264-VENUE | The.Longest.Ride.2015.FRENCH.BDRip.x264-VENUE |
| Horrible.Bosses.2.2014.THEATRICAL.FRENCH.BDRip.XviD.AC3-DesTroY | Horrible.Bosses.2.2014.FRENCH.BDRip.XviD.AC3.THEATRiCAL-DesTroY |
| The.Longest.Ride.2015.FRENCH.720p.BluRay.x264.AC3-BUITONIO | The.Longest.Ride.2015.FRENCH.720p.BLURAY.x264.AC3-BUITONIO |
| Hector.and.the.Search.for.Happiness.2014.FRENCH.DVDRiP.XviD.AC3-S.V | Hector.And.The.Search.For.Happiness.2014.FRENCH.DVDRip.XviD.AC3-S.V |
| The.Last.Man.On.Earth.S01E01.FASTSUB.VOSTFR.HDTV.XviD-ADDiCTiON | The.Last.Man.On.Earth.S01E01.VOSTFR.HDTV.XviD.FASTSUB-ADDiCTiON |
| The.Gambler.2014.FRENCH.BDRip.x264-VENUE | The.Gambler.2014.FRENCH.BDRip.x264-VENUE |
| HappyThankYouMorePlease.2010.HDRip.AC3 | Happythankyoumoreplease.2010.HDRip.AC3-NOTEAM |
| The.Drop.2014.FRENCH.BDRip.x264-PRiDEHD | The.Drop.2014.FRENCH.BDRip.x264-PRiDEHD |
| Hannibal.2001.TRUEFRENCH.SUBFORCED.BRRip.x264.AC3-FUNKY | Hannibal.2001.TRUEFRENCH.BDRip.x264.AC3.SUBFORCED-FUNKY |
| The.Angriest.Man.in.Brooklyn.2014.FRENCH.BDRip.x264-PRiDEHD | The.Angriest.Man.In.Brooklyn.2014.FRENCH.BDRip.x264-PRiDEHD |
| Green.Zone.2010.TRUEFRENCH.SUBFORCED.DVDRIP.XVID-KNOB | Green.Zone.2010.TRUEFRENCH.DVDRip.XviD.SUBFORCED-KNOB |
| The.100.S01E01.FASTSUB.VOSTFR.HDTV.XviD-ADDiCTiON | The.100.S01E01.VOSTFR.HDTV.XviD.FASTSUB-ADDiCTiON |
| Gravity.2013.FRENCH.BRRip.XviD.AC3-S.V | Gravity.2013.FRENCH.BDRip.XviD.AC3-S.V |
| Fury.2014.FRENCH.BDRip.x264-ROUGH | Fury.2014.FRENCH.BDRip.x264-ROUGH |
| Ted.2.2015.UNRATED.FRENCH.720p.WEB-DL.DD5.1.H264 | Ted.2.2015.FRENCH.720p.WEB-DL.h264.UNRATED.DD5.1-NOTEAM |
| Furious.Seven.2015.EXTENDED.TRUEFRENCH.BDRip.x264.AC3-GLUPS | Furious.Seven.2015.TRUEFRENCH.BDRip.x264.AC3.EXTENDED-GLUPS |
| Ted.2012.TRUEFRENCH.720p.BluRay.x264.AC3 | Ted.2012.TRUEFRENCH.720p.BLURAY.x264.AC3-NOTEAM |
| Taken.3.2014.EXTENDED.FRENCH.BDRip.XviD-GLUPS | Taken.3.2014.FRENCH.BDRip.XviD.EXTENDED-GLUPS |
| Fish.Tank.2009.FRENCH.BRRip.x264.AC3-SALEM | Fish.Tank.2009.FRENCH.BDRip.x264.AC3-SALEM |
| Still.Alice.2014.TRUEFRENCH.BDRip.XviD-DesTroY | Still.Alice.2014.TRUEFRENCH.BDRip.XviD-DesTroY |
| Factotum.FRENCH.DVDRiP.XviD-ZANBiC | Factotum.FRENCH.DVDRip.XviD-ZANBiC |
| Ex.Machina.2015.FRENCH.SUBFORCED.BRRip.XviD.AC3-CHARTAIR | Ex.Machina.2015.FRENCH.BDRip.XviD.AC3.SUBFORCED-CHARTAIR |
| Exam.2009.LiMiTED.FRENCH.DVDRip.XviD | Exam.2009.FRENCH.DVDRip.XviD.LiMiTED-NOTEAM |
| Eureka.S05.FRENCH.LD.DVDRiP.XViD-EPZ | Eureka.S05.FRENCH.DVDRip.XviD.LD-EPZ |
| Sous.Les.Jupes.Des.Filles.2014.FRENCH.BDRip.XviD-GLUPS | Sous.Les.Jupes.Des.Filles.2014.FRENCH.BDRip.XviD-GLUPS |
| Enemy.2013.LIMITED.FRENCH.SUBFORCED.BRRip.x264.AC3-SP3CTR3 | Enemy.2013.FRENCH.BDRip.x264.AC3.LiMiTED.SUBFORCED-SP3CTR3 |
| Source.Code.2011.FRENCH.BRRip.x264.AC3-FUNKY | Source.Code.2011.FRENCH.BDRip.x264.AC3-FUNKY |
| Endless Love 2014 FRENCH 720p BluRay x264-CARPEDIEM | Endless.Love.2014.FRENCH.720p.BLURAY.x264-CARPEDIEM |
| Sin.City.A.Dame.to.Kill.For.2014.FRENCH.BDRip.x264.AC3-GLUPS | Sin.City.A.Dame.To.Kill.For.2014.FRENCH.BDRip.x264.AC3-GLUPS |
| Eden.Lost.in.Music.2014.FRENCH.BDRip.x264-MELBA | Eden.Lost.In.Music.2014.FRENCH.BDRip.x264-MELBA |
| Silver.Linings.Playbook.2012.TRUEFRENCH.BDRip.x264.AC3-TKS | Silver.Linings.Playbook.2012.TRUEFRENCH.BDRip.x264.AC3-TKS |
| Dumb.And.Dumber.FRENCH.BRRip.XviD-LKT | Dumb.And.Dumber.FRENCH.BDRip.XviD-LKT |
| Shrek.Tetralogie.TRUEFRENCH.DVDRIP.XVID.AC3.5.1-lanesra13 | Shrek.Tetralogie.TRUEFRENCH.DVDRip.XviD.AC3.DD5.1-lanesra13 |
| Drinking.Buddies.2013.LIMITED.DVDRip.x264-NODLABS | Drinking.Buddies.2013.DVDRip.x264.LiMiTED-NODLABS |
| Serendipity.2001.FRENCH.BRRip.x264.AC3-CHARTAIR | Serendipity.2001.FRENCH.BDRip.x264.AC3-CHARTAIR |
| Dope.2015.SUBFORCED.FRENCH.BRRip.XviD-SVR | Dope.2015.FRENCH.BDRip.XviD.SUBFORCED-SVR |
| Serena.2014.FRENCH.DVDRip.x264-FUTiL | Serena.2014.FRENCH.DVDRip.x264-FUTiL |
| Rush.2013.FRENCH.BDRip.x264-Thursday16th | Rush.2013.FRENCH.BDRip.x264-Thursday16th |
| Qu.Est.Ce.Qu.On.a.Fait.au.Bon.Dieu.2014.FRENCH.720p.mHD.x264-ExPLiCiT | Qu.Est.Ce.Qu.On.A.Fait.Au.Bon.Dieu.2014.FRENCH.720p.HDRip.x264-ExPLiCiT |
| Quand.Harry.Rencontre.Sally.FRENCH.DVDRiP.XviD-Shane | Quand.Harry.Rencontre.Sally.FRENCH.DVDRip.XviD-Shane |
| Chef.2014.FRENCH.BDRiP.x264-PRiDEHD | Chef.2014.FRENCH.BDRip.x264-PRiDEHD |
| Pompeii.2014.TRUEFRENCH.BRRip.XviD-DesTroY | Pompeii.2014.TRUEFRENCH.BDRip.XviD-DesTroY |
| Celeste.and.Jesse.Forever.2012.VOSTFR.BDRiP.XviD-NIKOo | Celeste.And.Jesse.Forever.2012.VOSTFR.BDRip.XviD-NIKOo |
| Captain.Phillips.2013.FRENCH.DVDRip.x264-TiCKETS | Captain.Phillips.2013.FRENCH.DVDRip.x264-TiCKETS |
| Platoon.1986.FRENCH.SUBFORCED.BRRip.x264.AC3-FUNKY | Platoon.1986.FRENCH.BDRip.x264.AC3.SUBFORCED-FUNKY |
| Pixels.2015.FRENCH.DVDRip.XviD-SVR | Pixels.2015.FRENCH.DVDRip.XviD-SVR |
| Camp.X-Ray.2014.FRENCH.BDRip.x264-PRiDEHD | Camp.X.Ray.2014.FRENCH.BDRip.x264-PRiDEHD |
| Pixels.2015.FRENCH.BDRip.x264-VENUE | Pixels.2015.FRENCH.BDRip.x264-VENUE |
| Blue. Valentine 2010 French DvDRip Xvid-FwD | Blue.Valentine.2010.FRENCH.DVDRip.XviD-FwD |
| Pitch.Perfect.2.2015.FRENCH.BDRip.x264-COUAC | Pitch.Perfect.2.2015.FRENCH.BDRip.x264-COUAC |
| Blended.2014.FRENCH.BRRIP XVID AC3-lecorse | Blended.2014.FRENCH.BDRip.XviD.AC3-lecorse |
| Big.Eyes.2014.FRENCH.BDRip.XviD-GLUPS | Big.Eyes.2014.FRENCH.BDRip.XviD-GLUPS |
| Peter.Pan.TRUEFRENCH.DVDRip.XviD.AC3-LiberTeam | Peter.Pan.TRUEFRENCH.DVDRip.XviD.AC3-LiberTeam |
| Barbecue.2014.FRENCH.DVDRiP.XViD-ARTEFAC | Barbecue.2014.FRENCH.DVDRip.XviD-ARTEFAC |
| Palo.Alto.2013.LIMITED.VOSTFR.BRRip.x264.AC3-S.V | Palo.Alto.2013.VOSTFR.BDRip.x264.AC3.LiMiTED-S.V |
| Arthur.Newman.2012.FRENCH.BDRip.x264-Ryotox | Arthur.Newman.2012.FRENCH.BDRip.x264-Ryotox |
| Orange.Mecanique.MULTI.DVDRIP.x264.AAC-ECKOES | Orange.Mecanique.MULTi.DVDRip.x264.AAC-ECKOES |
| Arrow.S03E01.FASTSUB.VOSTFR.HDTV.x264-ADDiCTiON | Arrow.S03E01.VOSTFR.HDTV.x264.FASTSUB-ADDiCTiON |
| Nights.In.Rodanthe.TRUEFRENCH.DVDRip.XviD-UNSKiLLED | Nights.In.Rodanthe.TRUEFRENCH.DVDRip.XviD-UNSKiLLED |
| Mr.Robot.S01.PROPER.VOSTFR.720p.WEB-DL.DD5.1.H264-ARK01 | Mr.Robot.S01.VOSTFR.720p.WEB-DL.h264.PROPER.DD5.1-ARK01 |
| 12.Monkeys.S01E01.FRENCH.HDTV.x264-AZR | 12.Monkeys.S01E01.FRENCH.HDTV.x264-AZR |
