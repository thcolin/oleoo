# Oleoo specification

This document describes what `oleoo.parse`, `oleoo.guess` and `oleoo.stringify` do, so that the parser can be written again in another language (Rust, C++, Python…) and give the same result as the JavaScript one.

A port is made of three parts:

- `rules.json`, read as is: every pattern and every list lives there, none is copied in the port;
- the algorithm below, written in the port's language;
- the fixtures of `tests/fixtures/`, replayed as described in [Conformance](#conformance).

`src/index.js` is the reference implementation. When this document and the code disagree, the code and the fixtures win, and this document is fixed.

## Contents

1. [rules.json](#rulesjson)
2. [Regex dialect](#regex-dialect)
3. [Strings and positions](#strings-and-positions)
4. [Matching a rule](#matching-a-rule)
5. [parse](#parse)
6. [stringify](#stringify)
7. [guess](#guess)
8. [Conformance](#conformance)

## rules.json

A single JSON object. **The order of the keys is significant**, in every object of the file: read it with a parser that keeps it (`serde_json` with the `preserve_order` feature, `nlohmann::ordered_json`, Python's `json` since 3.7).

| Key | Type | Used by |
|---|---|---|
| `source`, `encoding`, `resolution`, `dub` | `{ [key]: Rule[] }` | [Source, encoding, resolution, dub](#5-source-encoding-resolution-dub) |
| `language` | `{ [key]: Rule[] }` | [Languages](#7-languages) |
| `flags` | `{ [key]: Rule[] }` | [Flags](#6-flags) and [ambiguous flags](#8-ambiguous-flags) |
| `erase` | `string[]` | [Input](#1-input) |
| `extensions` | `string[]` | [Input](#1-input) |
| `ambiguous.flags` | `string[]` | flag keys searched after the languages |
| `ambiguous.patterns` | `string[]` | language patterns that are not read inside the title |
| `title.uppercase` | `string[]` | words kept in upper case in the title |
| `title.leadingFlags` | `string[]` | flag keys that may open the input, before the title |
| `title.franchises` | `string[]` | titles that give way to the alternative title |
| `title.leadingYears` | `{ year, contains, release }[]` | titles that start with a number which is not their year |
| `stringify.dubRelated` | `string[]` | flag keys that move the channel flags after the source |
| `stringify.afterTitle` … `stringify.afterDub` | `(string \| { flag, dubRelated })[]` | [stringify](#stringify) |

A `Rule` is either a pattern string, or `{ "pattern": string, "notAfter": string }`: the pattern matches only where the text before it does not end with `notAfter`. It stands in for a lookbehind, which the dialect does not have.

`oleoo.rules`, in the JavaScript API, exposes the first seven keys only: `source`, `encoding`, `resolution`, `dub`, `language`, `flags`, `erase`.

## Regex dialect

Every pattern of `rules.json`, and every regex this document writes, stays in a subset meant for PCRE2, Oniguruma, `fancy-regex` (Rust) and `std::regex` in ECMAScript mode (C++). `tests/check.js` fails when a pattern of `rules.json` leaves it. Every pattern of `rules.json`, wrapped as [Matching a rule](#matching-a-rule) does, has been compiled with PCRE2 and with `std::regex`; Oniguruma and `fancy-regex` have not been tried yet.

Allowed:

- literals, `.`, `^`, `$`, alternation `|`;
- classes `[...]` and `[^...]`, ranges `a-z`;
- groups `(...)`, `(?:...)`, lookaheads `(?=...)` and `(?!...)`;
- quantifiers `?`, `*`, `+`, `{n}`, `{n,}`, `{n,m}`, and their lazy form `??`, `*?`, `+?`;
- escapes of a metacharacter: `\.`, `\-`, `\+`, `\*`, `\?`, `\(`, `\)`, `\[`, `\]`, `\{`, `\}`, `\|`, `\^`, `\$`, `\/`, `\\`;
- the classes `\d`, `\w`, `\W`, `\s`, with the meaning below.

Not allowed: lookbehinds, named groups, backreferences, `\b`, `\p{…}`, inline flags like `(?i)`, atomic groups, possessive quantifiers.

The classes have their ECMAScript meaning **without** the `u` flag, which is not the default of every engine:

| Class | Matches |
|---|---|
| `\d` | `[0-9]` |
| `\w` | `[A-Za-z0-9_]` |
| `\W` | any character but `[A-Za-z0-9_]`, accented letters included |
| `\s` | U+0009 to U+000D, U+0020, U+00A0, U+1680, U+2000 to U+200A, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF |
| `.` | any character but U+000A, U+000D, U+2028, U+2029 |

In C++, `std::regex` works on bytes: `[ée]` would not match `é` in UTF-8. Use `std::wregex` on wide strings, or PCRE2.

Rust's `regex` and `fancy-regex` read these classes as Unicode ones, and PCRE2's `\s` without `PCRE2_UCP` leaves out U+00A0, as Rust's `(?-u:\s)` does. The safe way is to expand the classes before compiling: `\d` into `[0-9]`, `\w` into `[A-Za-z0-9_]`, `\W` into `[^A-Za-z0-9_]`, `\s` into the list above. `\W` only appears inside a class as `[_\W]`, which is `[^A-Za-z0-9]`, and as `[\W\s]` or `[\W\-]`, which are `[^A-Za-z0-9_]`.

**Case.** Every pattern of `rules.json` is matched case-insensitively. A few patterns hold non-ASCII letters (`français`, `int[ée]grale?`, `restaur[ée]e?`): the engine must fold case on Unicode letters too, `É` matching `é`. The regexes of this document say when they are case-insensitive, with an `i` after them.

## Strings and positions

The input is a string of Unicode characters. A position is an offset into that string, in whatever unit the port's strings and regex engine use (UTF-16 code units in JavaScript, bytes in Rust): a port only compares positions with each other and slices with them, so any unit works as long as the engine returns offsets in the same one.

`lowercase` and `uppercase` are the full Unicode mappings (JavaScript `toLowerCase` and `toUpperCase`: `ß` becomes `SS`). `NFD` is Unicode canonical decomposition.

"Replace" replaces every occurrence, "replace the first" only the first, and "remove" replaces with nothing.

## Matching a rule

`find(string, before, rule, after)` returns the first match of a rule in `string`, or nothing:

1. Split the rule into `pattern` and `notAfter` (a string rule has no `notAfter`).
2. Build the regex `(` + `before` + `)` + `pattern` + `after`, case-insensitive. `before` is `[_\W]`, `^` or empty; the group gives the length of what `before` matched.
3. Search from position 0. For a match at `index`, whose `before` group is `n` long:
   - with no `notAfter`, return the match;
   - otherwise take `string[0 .. index + n]` and test it against `(?:` + `notAfter` + `)$`, case-insensitive. No match: return the match. A match: search again from `index + 1`.
4. No match left: return nothing.

The match gives three values: `index`, `end` (`index` + the length of the whole match), and its text.

## parse

`parse(raw, options)` takes a release name and these options:

| Option | Default | |
|---|---|---|
| `strict` | `false` | throw when no source, encoding, resolution nor dub is found |
| `flagged` | `true` | place the flags in `generated` |
| `erase` | `[]` | more patterns to remove from the input |
| `defaults` | `{}` | starting values of the payload |
| `currentYear` | the current year of the host | bounds the accepted years |

It fills a payload, then returns part of it. The steps run in this order, each one reading what the ones before it wrote.

### 1. Input

1. For each pattern of `options.erase`, then each pattern of `rules.erase`: remove every match of `[.\-]*?` + pattern + `[.\-]*?`, case-insensitive, from the name.
2. Remove the first match of `\.(` + `extensions` joined by `|` + `)(\W.*)?$`, case-insensitive.
3. Trim the whitespace at both ends. The result is `input`, returned as `original`.

### 2. Payload

```
type, year, source, encoding, resolution, dub, language, season, episode, group: null
languages, episodes, flags: []
```

then the keys of `options.defaults` over these, then `score = 0`, `valid = false`.

Three positions follow the parsing: `titleStart = 0`, `titleEnd = length(input)`, `groupStart = 0`. Unless a step says otherwise, **"move the positions to a match"** means: `titleEnd = min(titleEnd, index)` and `groupStart = max(groupStart, end)`.

### 3. Type

Test these regexes on `input` in order, each case-insensitive; the first that matches sets `titleEnd = index`, `groupStart = end` (both assigned, not compared) and `type = "tvshow"`:

1. `\WS(eason[_\W])?\d{1,3}\W?(?:-?EP?\d+)*[e\.\-\s]`
2. `\W(?:-?EP?\d+)+(\W)?`
3. `\W(\d{4}[_\W]\d{2}[_\W]\d{2}[_\W])(\W)?`
4. `\W(\d{2}[_\W]\d{2}[_\W]\d{4}[_\W])(\W)?`
5. `\W(?:(?:\d{1,2})x(?:\d{1,3}))+(\W)?`

None matches: `type = "movie"`.

### 4. Year

A year `y` is accepted when `1900 < y < currentYear + 5`. These regexes are case-sensitive.

1. **A range.** The first match of `[_\W]((\d{4})[\.\s]?-[\.\s]?(\d{4}))`. When both groups 2 and 3 are accepted years: `year = group2 + "-" + group3`, `score += 1`, push `COLLECTION` to `flags`, move the positions to the match. Otherwise go to 2.
2. **A single year.** Every match of `[_\W](\d{4})(?![_\W]\d{2}[_\W]\d{2})`, left to right, without overlap. Keep those whose group 1 is an accepted year and where `input[0 .. index]` does not end with `\d{2}[_\W]\d{2}`. When some are kept, take **the last one**: `year = group1`, `score += 1`, move the positions to it.

`year` is a string.

### 5. Source, encoding, resolution, dub

For `property` in `source`, `encoding`, `resolution`, `dub`, in this order; for each `key` of `rules[property]`, in file order; for each rule of that key, in order:

- `after` is `([_\W]|$)`, preceded for `dub` by `([\.\-\s]?@?\d+(kbps)?)?`;
- `find(input, "[_\W]", rule, after)`. On a match: `score += 1` if `property` was still null, `property = key`, `valid = true`, move the positions to the match, and go to the next key (skip the other rules of this key).

Each key overwrites the one before it: **the last matching key of the file wins**, which is why the generic keys are declared first.

### 6. Flags

For each `key` of `rules.flags` that is **not** in `ambiguous.flags`; for each rule of that key:

1. `before` is empty when the rule is a string starting with `^`, `[_\W]` otherwise. `find(input, before, rule, "([_\W]|$)")`. On a match:
   - push `key` to `flags` if it is not there yet;
   - `titleEnd = min(titleEnd, index)`, except for a rule starting with `^`;
   - `groupStart = max(groupStart, end)`;
   - go to the next key.
2. Otherwise, when `key` is in `title.leadingFlags` and `find(input, "^", rule, "([_\W]|$)")` matches: push `key` if it is not there yet, `titleStart = length of the match text`, and go on with the **next rule** of the same key.

A rule that is not a valid regex is skipped (the JavaScript code logs a warning).

### 7. Languages

**First pass.** `searched` is `input` when `titleEnd = length(input)`, else `input[titleEnd ..]`, and `offset` is 0 or `titleEnd` accordingly. For each `key` of `rules.language`, for each rule: when `find(searched, "[_\W]", rule, "([_\W]|$)")` matches, push `key` to `languages`, `groupStart = max(groupStart, offset + end)`, and go to the next key. `titleEnd` does not move.

**Second pass**, only when the first found nothing. For each `key`, for each rule: when `find(input, "[_\W]", rule, "([_\W]|$)")` matches:

- if the rule is a string listed in `ambiguous.patterns` and `end < titleEnd`, go to the next key (it is a word of the title);
- otherwise push `key`, move the positions to the match, and go to the next key.

### 8. Ambiguous flags

Same loop as [Flags](#6-flags), on the keys that **are** in `ambiguous.flags`, with one more test when step 1 matches: when the rule does not start with `^`, `index < titleEnd`, `end <= titleEnd + 1`, and the match text does not contain `key` as is (case-sensitive), the match is a word of the title: go to the next key without pushing anything.

### 9. Score and language

- `flags` not empty: `score += 1`.
- `languages` not empty: `score += 1`, and `language` is:
  - the only element, when there is one;
  - otherwise `MULTi`, followed by `-VF2` when `languages` holds `TRUEFRENCH` and (`FRENCH` or `VFQ`), else `-VFF` when it holds `TRUEFRENCH`, else `-VFQ` when it holds `VFQ`.

### 10. Season and episodes

Only when `type = "tvshow"`. `pad2(n)` writes `n` in decimal on at least two digits.

1. **Season.** First match of `\WS(?:eason[_\W]?)?(\d{1,3})[e\.\-\s]`, case-insensitive: `season = group1` as a number, `groupStart = max(groupStart, end)`.
2. **Episodes**, the first of these that matches, each case-insensitive:
   1. First match of `EP?(\d+)\-(\d+)`: `episodes` = every number from group 1 to group 2, `groupStart = max(groupStart, end)`.
   2. Every match of `EP?(\d+)`: `episodes` = the group 1 of each, as numbers; `groupStart = max(groupStart, end of the last one)`.
   3. Every match of `\W?(?:(\d{1,2})x(\d{1,3}))+(\W)?`: `season` = group 1 of the first one, `episodes` = the group 2 of each; `groupStart` as above.
   4. First match of `\W(\d{4})[_\W](\d{2}[_\W]\d{2})[_\W]?`, only acted on when `year` is null or equals group 1: `episode` = group 2 with every non-digit replaced by `.` and every run of `.` by one `.`, `episodes = [episode]`, `score += 1` if `year` was null, `year = group1`, `groupStart = max(groupStart, end)`.
   5. First match of `\W(\d{2}[_\W]\d{2})[_\W](\d{4})[_\W]?`: the same, with the year in group 2 and the day in group 1.

   In 1, 2 and 3, `episode` = `episodes` written with `pad2` and joined by `-`.

### 11. Group

Take `input[max(groupStart, titleEnd) ..]` and its first match of `(?:by[\W\-])?([\w\.]+)`, case-insensitive. On a match, `score += 1` and `group` is group 1 after:

1. replace the first `'s` with `s`;
2. remove U+0300 to U+036F, then U+2000 to U+206F;
3. replace with a space U+0021 to U+0022, U+0027 to U+002F, U+003A to U+003F, U+005B to U+0060, U+007B to U+007F;
4. replace every run of `\s` with one space, trim, and keep what comes before the first space.

### 12. Title

`title` = `input[titleStart .. titleEnd]`, then in order:

1. replace every run of `.` with a space;
2. `NFD`;
3. replace the first `'s`, case-insensitive, with `s`;
4. remove every match of `\[.+\]`;
5. remove U+0300 to U+036F, then U+2000 to U+206F;
6. replace with a space U+0021, U+0022, U+0027, U+002A, U+002B, U+002C, U+002E, U+002F, then U+003A to U+003F, then U+005C, U+005E to U+0060, then U+007B to U+007F;
7. replace `Œ` with `OE`, then `œ` with `oe`.

### 13. Alternative title

Four steps, in order, each on the `title` the one before left. "Clean" a string means: remove `(` and `)`, then replace the first match of `[\.\s]-[\.\s]?` with a space. "Cut" means: remove the first occurrence of the match text from `title`, as a plain string.

1. First match of `[\.\s]aka[\.\s](.*?)$`, case-insensitive: cut, `alternativeTitle` = group 1.
2. First match of `[\.\s]\-[\.\s]?(.*?)$`: cut, then clean `title`; `alternativeTitle` = group 1, cleaned.
3. First match of `\s?\[(.+)\]?\s?`: the same.
4. First match of `\s?\((.+)\)?\s?`: the same.

### 14. Capitalization

Applied to `title`, then to `alternativeTitle` when there is one:

1. remove one `-` at the end, then one at the start;
2. replace every run of `\s` with one space, trim, `lowercase`;
3. split on spaces; a word whose `uppercase` is in `title.uppercase` becomes that `uppercase`; join with spaces;
4. `uppercase` every match of `(^([a-zA-Z]))|([ -][a-zA-Z])`;
5. `uppercase` every match of `\W([ivx]+)(\W|$)`, case-insensitive;
6. `uppercase` every match of `\W(i+)\W?`, case-insensitive.

### 15. Title fixes

In order:

1. When there is an `alternativeTitle`:
   - it matches `^\d{4}$`: `year = alternativeTitle`, drop `alternativeTitle`;
   - else `year` is null and `title` matches `^\d{4}$`: `year = title`, `title = alternativeTitle`, drop `alternativeTitle`;
   - else `title` matches `^\d+$`: `title = alternativeTitle`, drop `alternativeTitle`.
2. `title` is empty and there is an `alternativeTitle`: `title = alternativeTitle`, drop it.
3. `title` is in `title.franchises` and there is an `alternativeTitle`: the same.
4. `year` is null and `title` matches `^(\d{4})\W?(.+$)`: when an entry of `title.leadingYears` has `year` = group 1 and group 2, `lowercase`, contains its `contains`, `year` = its `release` and `title` stays; otherwise `year` = group 1 and `title` = group 2.
5. `type = "movie"` and `alternativeTitle` matches `^(\d{3,}$)`: `type = "tvshow"`, `episode = group1`, `episodes = [group1]` (a string), drop `alternativeTitle`.
6. `type = "movie"` and `title` matches `^(.+)(\d[, \-]\s?){2,}\d$`: push `COLLECTION` to `flags`, `title` = group 1, trimmed.
7. `type = "tvshow"`: remove `COLLECTION` from `flags` when it is there, otherwise remove `COMPLETE`.
8. `year = "0"`: `year` = null.

### 16. Result

`generated = stringify(payload, { flagged })`. Then, when `strict` is true and `valid` is false, throw an error whose message is `"<original>" does't follow scene release naming rules`.

The result has these keys, in this order:

```
original, language, languages, source, encoding, resolution, dub, year, flags,
season, episode, episodes, type, group, title, [alternativeTitle, completeTitle,] generated, score
```

`alternativeTitle` and `completeTitle` are there only when there is an alternative title; `completeTitle` is `title + " (" + alternativeTitle + ")"`.

`season` is a number or null. `episodes` holds numbers, or one string for a date (`"12.25"`) or a manga episode (`"123"`). `episode` is a string or null.

## stringify

`stringify(release, { flagged = true })` writes a release name back. A flag entry of `stringify.after*` is written when:

- it is a string and `release.flags` holds it;
- it is `{ flag, dubRelated }`, `release.flags` holds `flag`, and `dubRelated` equals "`release.flags` holds at least one flag of `stringify.dubRelated`". This sends a channel flag like `5.1` after the source when the release has a `DTS` or `DD5.1`, after the dub otherwise.

The parts, in order; when `flagged` is false, every `after*` group and the last line are left out:

1. `title` with every run of `\s` replaced by `.`;
2. `afterTitle`;
3. `year`, when there is one;
4. when there is a `season` or some `episodes`: `S` + `pad2(season)` when there is a season, then, when there are episodes, `E` + the episodes in `pad2` joined by `-E` if they are all made of digits, or joined by `-` otherwise; one part, with no separator inside;
5. `afterYear`;
6. `language`;
7. `afterLanguage`;
8. `resolution`, unless it is `SD`;
9. `afterResolution`;
10. `source`, unless it is `HDRip` and `flags` holds `mHD`;
11. `afterSource`;
12. `encoding`;
13. `afterEncoding`;
14. `dub`;
15. `afterDub`;
16. every flag of `release.flags`, in its order, that no `after*` entry names (for an object entry, its `flag`).

Drop the empty parts, join with `.`, and append `-` + `group`, or `-NOTEAM` when there is none.

## guess

`guess(name, options)` is `parse` with `strict = false`, then:

1. `year` is null: `year` = `currentYear` as a string.
2. `resolution` is null: `2160p` when `flags` holds `UHD`, else `1080p` when `source` is `BDSCR` or `BLURAY`, else `SD`.
3. `generated = stringify(release, options)`.

## Conformance

`tests/fixtures/` holds the expected results:

| File | Content |
|---|---|
| `releases.txt` | one release name per line, 6801 lines of which 6697 are unique |
| `accepted.json` | `{ [name]: result }`, the results judged right |
| `refused.json` | `{ [name]: result + comment }`, the results judged wrong, with what is wrong in `comment` |

Both files hold what the reference implementation returns **today**: a port matches `refused.json` too, once `comment` is dropped. A refused entry becomes accepted when a fix changes its result in the reference implementation first.

A port is conformant when, for every unique name of `releases.txt`, `parse(name, { currentYear: 2026 })` gives the result of `accepted.json` or `refused.json`, key for key, `null` and empty arrays included. The order of the keys is only checked by the JavaScript harness.

`tests/check.js` is the harness of the reference implementation (`yarn test`). It also checks that:

- `parse(name, { currentYear: 2026, strict: false })` equals `parse(name, { currentYear: 2026 })` for every name;
- an `erase` pattern removes its match;
- `currentYear` bounds the accepted years;
- `rules.json` stays in the [dialect](#regex-dialect).
