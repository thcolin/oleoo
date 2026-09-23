//! Scene/P2P release name parser. Port of the JavaScript `oleoo`, written from `SPEC.md` and `rules.json` at the root of the repository.

mod regex;
mod rules;

use std::{
    fmt,
    time::{SystemTime, UNIX_EPOCH},
};

use fancy_regex::Captures;
use serde::Serialize;
use unicode_normalization::UnicodeNormalization;

use crate::regex::{is_space, regex};
use crate::rules::{Entry, RULES, Rule};

const AFTER: &str = r"([_\W]|$)";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Movie,
    Tvshow,
}

/// An episode number, or a string for a date (`"12.25"`) or a manga episode (`"123"`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(untagged)]
pub enum Episode {
    Number(u64),
    Text(String),
}

impl Episode {
    fn pad2(&self) -> String {
        match self {
            Episode::Number(number) => format!("{number:02}"),
            Episode::Text(text) => format!("{text:0>2}"),
        }
    }

    fn is_digits(&self) -> bool {
        match self {
            Episode::Number(_) => true,
            Episode::Text(text) => is_digits(text),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    pub original: String,
    pub language: Option<String>,
    pub languages: Vec<String>,
    pub source: Option<String>,
    pub encoding: Option<String>,
    pub resolution: Option<String>,
    pub dub: Option<String>,
    pub year: Option<String>,
    pub flags: Vec<String>,
    pub season: Option<u32>,
    pub episode: Option<String>,
    pub episodes: Vec<Episode>,
    #[serde(rename = "type")]
    pub kind: Kind,
    pub group: Option<String>,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alternative_title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub complete_title: Option<String>,
    pub generated: String,
    pub score: u32,
}

#[derive(Debug, Clone, Default)]
pub struct Defaults {
    pub year: Option<String>,
    pub source: Option<String>,
    pub encoding: Option<String>,
    pub resolution: Option<String>,
    pub dub: Option<String>,
    pub language: Option<String>,
    pub season: Option<u32>,
    pub episode: Option<String>,
    pub group: Option<String>,
    pub languages: Vec<String>,
    pub episodes: Vec<Episode>,
    pub flags: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct Options {
    pub strict: bool,
    /// Place the flags in `generated`.
    pub flagged: bool,
    pub erase: Vec<String>,
    pub defaults: Defaults,
    /// A year is accepted up to `current_year + 4`, and `guess` falls back to it. Defaults to the current UTC year.
    pub current_year: Option<i32>,
}

impl Default for Options {
    fn default() -> Self {
        Options {
            strict: false,
            flagged: true,
            erase: Vec::new(),
            defaults: Defaults::default(),
            current_year: None,
        }
    }
}

#[derive(Debug)]
#[non_exhaustive]
pub enum Error {
    Regex(fancy_regex::Error),
    /// `strict` is set and the name has no source, encoding, resolution nor dub.
    Strict(String),
    /// An episode range longer than an ECMAScript array can be, which the reference implementation rejects too.
    EpisodeRange(u64, u64),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Regex(error) => error.fmt(f),
            Error::Strict(input) => {
                write!(f, "\"{input}\" does't follow scene release naming rules")
            }
            Error::EpisodeRange(from, to) => {
                write!(f, "episodes {from} to {to}: invalid array length")
            }
        }
    }
}

impl std::error::Error for Error {}

impl From<fancy_regex::Error> for Error {
    fn from(error: fancy_regex::Error) -> Self {
        Error::Regex(error)
    }
}

// Byte offsets in the input: they are compared, never counted, so they give the order character positions give.
struct Positions {
    title_start: usize,
    title_end: usize,
    group_start: usize,
}

impl Positions {
    fn move_to(&mut self, index: usize, end: usize) {
        self.title_end = self.title_end.min(index);
        self.reach(end);
    }

    fn reach(&mut self, end: usize) {
        self.group_start = self.group_start.max(end);
    }
}

pub fn parse(raw: &str, options: &Options) -> Result<Release, Error> {
    let current_year = options.current_year.unwrap_or_else(host_year);
    let mut input = raw.to_owned();

    for pattern in options.erase.iter().chain(&RULES.erase) {
        let pattern = pattern.replace(r"\\", r"\");
        input = regex(&format!(r"[\.\-]*?{pattern}[\.\-]*?"), true)?
            .try_replacen(&input, 0, "")?
            .into_owned();
    }

    let input = regex(
        &format!(r"\.({})(\W.*)?$", RULES.extensions.join("|")),
        true,
    )?
    .try_replacen(&input, 1, "")?;
    let input = trim(&input).to_owned();
    let input = input.as_str();

    let defaults = &options.defaults;
    let mut release = Release {
        original: input.to_owned(),
        language: defaults.language.clone(),
        languages: defaults.languages.clone(),
        source: defaults.source.clone(),
        encoding: defaults.encoding.clone(),
        resolution: defaults.resolution.clone(),
        dub: defaults.dub.clone(),
        year: defaults.year.clone(),
        flags: defaults.flags.clone(),
        season: defaults.season,
        episode: defaults.episode.clone(),
        episodes: defaults.episodes.clone(),
        kind: Kind::Movie,
        group: defaults.group.clone(),
        title: String::new(),
        alternative_title: None,
        complete_title: None,
        generated: String::new(),
        score: 0,
    };
    let mut valid = false;
    let mut at = Positions {
        title_start: 0,
        title_end: input.len(),
        group_start: 0,
    };

    for pattern in [
        r"\WS(eason[_\W])?\d{1,3}\W?(?:-?EP?\d+)*[e\.\-\s]",
        r"\W(?:-?EP?\d+)+(\W)?",
        r"\W(\d{4}[_\W]\d{2}[_\W]\d{2}[_\W])(\W)?",
        r"\W(\d{2}[_\W]\d{2}[_\W]\d{4}[_\W])(\W)?",
        r"\W(?:(?:\d{1,2})x(?:\d{1,3}))+(\W)?",
    ] {
        if let Some(found) = regex(pattern, true)?.find(input)? {
            at.title_end = found.start();
            at.group_start = found.end();
            release.kind = Kind::Tvshow;
            break;
        }
    }

    let accepted = |year: &str| {
        year.parse::<i32>()
            .is_ok_and(|year| year > 1900 && year < current_year.saturating_add(5))
    };
    let range = regex(r"[_\W]((\d{4})[\.\s]?-[\.\s]?(\d{4}))", false)?.captures(input)?;

    if let Some(range) =
        range.filter(|range| accepted(group(range, 2)) && accepted(group(range, 3)))
    {
        let found = range.get(0).unwrap();
        release.year = Some(format!("{}-{}", group(&range, 2), group(&range, 3)));
        release.score += 1;
        release.flags.push("COLLECTION".to_owned());
        at.move_to(found.start(), found.end());
    } else {
        let date = regex(r"\d{2}[_\W]\d{2}$", false)?;
        let mut last = None;

        for year in regex(r"[_\W](\d{4})(?![_\W]\d{2}[_\W]\d{2})", false)?.captures_iter(input) {
            let year = year?;
            let found = year.get(0).unwrap();

            if accepted(group(&year, 1)) && !date.is_match(&input[..found.start()])? {
                last = Some((found.start(), found.end(), group(&year, 1).to_owned()));
            }
        }

        if let Some((index, end, year)) = last {
            release.year = Some(year);
            release.score += 1;
            at.move_to(index, end);
        }
    }

    let after_dub = format!(r"([\.\-\s]?@?\d+(kbps)?)?{AFTER}");

    for (keys, property, after) in [
        (&RULES.source, &mut release.source, AFTER),
        (&RULES.encoding, &mut release.encoding, AFTER),
        (&RULES.resolution, &mut release.resolution, AFTER),
        (&RULES.dub, &mut release.dub, after_dub.as_str()),
    ] {
        for (key, rules) in keys {
            for rule in rules {
                if let Some((index, end)) = find(input, r"[_\W]", rule, after)? {
                    release.score += if present(property).is_some() { 0 } else { 1 };
                    *property = Some(key.clone());
                    valid = true;
                    at.move_to(index, end);
                    break;
                }
            }
        }
    }

    flags(input, false, &mut release.flags, &mut at)?;

    let offset = if at.title_end == input.len() {
        0
    } else {
        at.title_end
    };

    for (key, rules) in &RULES.language {
        for rule in rules {
            if let Some((_, end)) = find(&input[offset..], r"[_\W]", rule, AFTER)? {
                release.languages.push(key.clone());
                at.reach(offset + end);
                break;
            }
        }
    }

    if release.languages.is_empty() {
        for (key, rules) in &RULES.language {
            for rule in rules {
                if let Some((index, end)) = find(input, r"[_\W]", rule, AFTER)? {
                    if matches!(rule, Rule::Pattern(pattern) if RULES.ambiguous.patterns.contains(pattern))
                        && end < at.title_end
                    {
                        break;
                    }

                    release.languages.push(key.clone());
                    at.move_to(index, end);
                    break;
                }
            }
        }
    }

    flags(input, true, &mut release.flags, &mut at)?;

    if !release.flags.is_empty() {
        release.score += 1;
    }

    if !release.languages.is_empty() {
        let has = |language: &str| release.languages.iter().any(|l| l == language);
        release.score += 1;
        release.language = Some(match release.languages.as_slice() {
            [language] => language.clone(),
            _ if has("TRUEFRENCH") && (has("FRENCH") || has("VFQ")) => "MULTi-VF2".to_owned(),
            _ if has("TRUEFRENCH") => "MULTi-VFF".to_owned(),
            _ if has("VFQ") => "MULTi-VFQ".to_owned(),
            _ => "MULTi".to_owned(),
        });
    }

    if release.kind == Kind::Tvshow {
        if let Some(season) =
            regex(r"\WS(?:eason[_\W]?)?(\d{1,3})[e\.\-\s]", true)?.captures(input)?
        {
            release.season = Some(group(&season, 1).parse().unwrap());
            at.reach(season.get(0).unwrap().end());
        }

        let episodes = regex(r"EP?(\d+)", true)?
            .captures_iter(input)
            .collect::<Result<Vec<_>, _>>()?;
        let crossed = regex(r"\W?(?:(\d{1,2})x(\d{1,3}))+(\W)?", true)?
            .captures_iter(input)
            .collect::<Result<Vec<_>, _>>()?;

        if let Some(range) = regex(r"EP?(\d+)\-(\d+)", true)?.captures(input)? {
            let (from, to) = (number(group(&range, 1)), number(group(&range, 2)));

            if to >= from && to - from >= u64::from(u32::MAX) {
                return Err(Error::EpisodeRange(from, to));
            }

            release.episodes = (from..=to).map(Episode::Number).collect();
            release.episode = Some(join(&release.episodes));
            at.reach(range.get(0).unwrap().end());
        } else if let Some(last) = episodes.last() {
            release.episodes = episodes
                .iter()
                .map(|episode| Episode::Number(number(group(episode, 1))))
                .collect();
            release.episode = Some(join(&release.episodes));
            at.reach(last.get(0).unwrap().end());
        } else if let Some(last) = crossed.last() {
            release.season = Some(group(&crossed[0], 1).parse().unwrap());
            release.episodes = crossed
                .iter()
                .map(|episode| Episode::Number(number(group(episode, 2))))
                .collect();
            release.episode = Some(join(&release.episodes));
            at.reach(last.get(0).unwrap().end());
        } else if let Some(date) =
            regex(r"\W(\d{4})[_\W](\d{2}[_\W]\d{2})[_\W]?", true)?.captures(input)?
        {
            dated(
                &mut release,
                group(&date, 1),
                group(&date, 2),
                date.get(0).unwrap().end(),
                &mut at,
            );
        } else if let Some(date) =
            regex(r"\W(\d{2}[_\W]\d{2})[_\W](\d{4})[_\W]?", true)?.captures(input)?
        {
            dated(
                &mut release,
                group(&date, 2),
                group(&date, 1),
                date.get(0).unwrap().end(),
                &mut at,
            );
        }
    }

    if let Some(found) = regex(r"(?:by[\W\-])?([\w\.]+)", true)?
        .captures(&input[at.group_start.max(at.title_end)..])?
    {
        let group: String = apostrophe_s(group(&found, 1), false)
            .chars()
            .filter_map(|c| match c {
                '\u{300}'..='\u{36F}' | '\u{2000}'..='\u{206F}' => None,
                '!'..='"' | '\''..='/' | ':'..='?' | '['..='`' | '{'..='\u{7F}' => Some(' '),
                c => Some(c),
            })
            .collect();
        release.group = Some(
            trim(&collapse(&group, is_space, " "))
                .split(' ')
                .next()
                .unwrap()
                .to_owned(),
        );
        release.score += 1;
    }

    let title = collapse(
        input.get(at.title_start..at.title_end).unwrap_or(""),
        |c| c == '.',
        " ",
    );
    let title = apostrophe_s(&title.nfd().collect::<String>(), true);
    let title: String = regex(r"\[.+\]", false)?
        .try_replacen(&title, 0, "")?
        .chars()
        .filter_map(|c| match c {
            '\u{300}'..='\u{36F}' | '\u{2000}'..='\u{206F}' => None,
            '!'
            | '"'
            | '\''
            | '*'
            | '+'
            | ','
            | '.'
            | '/'
            | ':'..='?'
            | '\\'
            | '^'..='`'
            | '{'..='\u{7F}' => Some(' '),
            c => Some(c),
        })
        .collect();
    let mut title = title.replace('Œ', "OE").replace('œ', "oe");
    let mut alternative = None;

    if let Some(aka) = regex(r"[\.\s]aka[\.\s](.*?)$", true)?.captures(title.as_str())? {
        let (whole, inner) = (group(&aka, 0).to_owned(), group(&aka, 1).to_owned());
        title = title.replacen(&whole, "", 1);
        alternative = Some(inner);
    }

    for pattern in [
        r"[\.\s]\-[\.\s]?(.*?)$",
        r"\s?\[(.+)\]?\s?",
        r"\s?\((.+)\)?\s?",
    ] {
        if let Some(found) = regex(pattern, true)?.captures(title.as_str())? {
            let (whole, inner) = (group(&found, 0).to_owned(), group(&found, 1).to_owned());
            title = clean(&title.replacen(&whole, "", 1))?;
            alternative = Some(clean(&inner)?);
        }
    }

    title = capitalize(&title)?;
    alternative = alternative
        .filter(|alternative| !alternative.is_empty())
        .map(|alternative| capitalize(&alternative))
        .transpose()?;

    if let Some(alternate) = alternative.clone() {
        if is_digits(&alternate) && alternate.len() == 4 {
            release.year = Some(alternate);
            alternative = None;
        } else if present(&release.year).is_none() && is_digits(&title) && title.len() == 4 {
            release.year = Some(std::mem::replace(&mut title, alternate));
            alternative = None;
        } else if is_digits(&title) {
            title = alternate;
            alternative = None;
        }
    }

    alternative = alternative.filter(|alternative| !alternative.is_empty());

    if title.is_empty() && alternative.is_some() {
        title = alternative.take().unwrap();
    }

    if RULES.title.franchises.contains(&title) && alternative.is_some() {
        title = alternative.take().unwrap();
    }

    // Year at the beginning of the title ("2002 - The Movie" for example)
    if present(&release.year).is_none()
        && let Some(found) = regex(r"^(\d{4})\W?(.+$)", false)?.captures(title.as_str())?
    {
        let (year, rest) = (group(&found, 1).to_owned(), group(&found, 2).to_owned());

        if let Some(exception) = RULES
            .title
            .leading_years
            .iter()
            .find(|e| e.year == year && rest.to_lowercase().contains(&e.contains))
        {
            release.year = Some(exception.release.clone());
        } else {
            release.year = Some(year);
            title = rest;
        }
    }

    // Manga episode ("One Piece - 123" for example)
    if release.kind == Kind::Movie
        && let Some(episode) =
            alternative.take_if(|alternative| is_digits(alternative) && alternative.len() >= 3)
    {
        release.kind = Kind::Tvshow;
        release.episodes = vec![Episode::Text(episode.clone())];
        release.episode = Some(episode);
    }

    // Undetected Collection of Movies ("The Movie - 1, 2, 3" for example)
    if release.kind == Kind::Movie
        && let Some(found) = regex(r"^(.+)(\d[, \-]\s?){2,}\d$", false)?.captures(title.as_str())?
    {
        let name = trim(group(&found, 1)).to_owned();
        release.flags.push("COLLECTION".to_owned());
        title = name;
    }

    if release.kind == Kind::Tvshow {
        let dropped = if release.flags.iter().any(|flag| flag == "COLLECTION") {
            "COLLECTION"
        } else {
            "COMPLETE"
        };
        release.flags.retain(|flag| flag != dropped);
    }

    if release.year.as_deref() == Some("0") {
        release.year = None;
    }

    if let Some(alternative) = alternative {
        release.complete_title = Some(format!("{title} ({alternative})"));
        release.alternative_title = Some(alternative);
    }

    release.title = title;
    release.generated = stringify(&release, options.flagged);

    if options.strict && !valid {
        return Err(Error::Strict(input.to_owned()));
    }

    Ok(release)
}

pub fn guess(name: &str, options: &Options) -> Result<Release, Error> {
    let mut release = parse(
        name,
        &Options {
            strict: false,
            ..options.clone()
        },
    )?;

    if present(&release.year).is_none() {
        release.year = Some(options.current_year.unwrap_or_else(host_year).to_string());
    }

    if present(&release.resolution).is_none() {
        release.resolution = Some(
            if release.flags.iter().any(|flag| flag == "UHD") {
                "2160p"
            } else if matches!(release.source.as_deref(), Some("BDSCR" | "BLURAY")) {
                "1080p"
            } else {
                "SD"
            }
            .to_owned(),
        );
    }

    release.generated = stringify(&release, options.flagged);
    Ok(release)
}

pub fn stringify(release: &Release, flagged: bool) -> String {
    let order = &RULES.stringify;
    let has = |flag: &str| release.flags.iter().any(|f| f == flag);
    let dub_related = order.dub_related.iter().any(|flag| has(flag));
    // A dub channel flag like 5.1 goes after the source when the release has a dub related flag, after the dub otherwise.
    let written = |entry: &'static Entry| match entry {
        Entry::Flag(flag) => has(flag).then_some(flag.as_str()),
        Entry::Placed {
            flag,
            dub_related: placed,
        } => (*placed == dub_related && has(flag)).then_some(flag.as_str()),
    };
    let after = |parts: &mut Vec<String>, entries: &'static [Entry]| {
        if flagged {
            parts.extend(entries.iter().filter_map(written).map(str::to_owned));
        }
    };
    let mut parts = vec![collapse(&release.title, is_space, ".")];

    after(&mut parts, &order.after_title);
    parts.extend(present(&release.year).map(str::to_owned));

    let season = release.season.filter(|&season| season != 0);

    if season.is_some() || !release.episodes.is_empty() {
        let mut part = season.map_or_else(String::new, |season| format!("S{season:02}"));

        if !release.episodes.is_empty() {
            let digits = release.episodes.iter().all(Episode::is_digits);
            let episodes: Vec<_> = release.episodes.iter().map(Episode::pad2).collect();
            part += if digits { "E" } else { "" };
            part += &episodes.join(if digits { "-E" } else { "-" });
        }

        parts.push(part);
    }

    after(&mut parts, &order.after_year);
    parts.extend(present(&release.language).map(str::to_owned));
    after(&mut parts, &order.after_language);
    parts.extend(
        present(&release.resolution)
            .filter(|&resolution| resolution != "SD")
            .map(str::to_owned),
    );
    after(&mut parts, &order.after_resolution);
    parts.extend(
        present(&release.source)
            .filter(|&source| !(source == "HDRip" && has("mHD")))
            .map(str::to_owned),
    );
    after(&mut parts, &order.after_source);
    parts.extend(present(&release.encoding).map(str::to_owned));
    after(&mut parts, &order.after_encoding);
    parts.extend(present(&release.dub).map(str::to_owned));
    after(&mut parts, &order.after_dub);

    if flagged {
        let groups = [
            &order.after_title,
            &order.after_year,
            &order.after_language,
            &order.after_resolution,
            &order.after_source,
            &order.after_encoding,
            &order.after_dub,
        ];
        let named = |flag: &str| {
            groups
                .iter()
                .flat_map(|entries| entries.iter())
                .any(|entry| match entry {
                    Entry::Flag(named) => named == flag,
                    Entry::Placed { .. } => written(entry) == Some(flag),
                })
        };
        parts.extend(release.flags.iter().filter(|flag| !named(flag)).cloned());
    }

    parts.retain(|part| !part.is_empty());
    format!(
        "{}-{}",
        parts.join("."),
        present(&release.group).unwrap_or("NOTEAM")
    )
}

// The first match of a rule in string, as byte offsets of its start and end.
fn find(
    string: &str,
    before: &str,
    rule: &Rule,
    after: &str,
) -> Result<Option<(usize, usize)>, Error> {
    let pattern = regex(&format!("({before}){}{after}", rule.pattern()), true)?;
    let mut from = 0;

    while let Some(found) = pattern.captures_from_pos(string, from)? {
        let (index, end) = (found.get(0).unwrap().start(), found.get(0).unwrap().end());
        let before_len = found
            .get(1)
            .map_or(0, |before| before.end() - before.start());

        match rule.not_after() {
            Some(not_after)
                if regex(&format!("(?:{not_after})$"), true)?
                    .is_match(&string[..index + before_len])? => {}
            _ => return Ok(Some((index, end))),
        }

        from = index + string[index..].chars().next().map_or(1, char::len_utf8);

        if from > string.len() {
            break;
        }
    }

    Ok(None)
}

fn flags(
    input: &str,
    ambiguous: bool,
    flags: &mut Vec<String>,
    at: &mut Positions,
) -> Result<(), Error> {
    for (key, rules) in RULES
        .flags
        .iter()
        .filter(|(key, _)| RULES.ambiguous.flags.contains(key) == ambiguous)
    {
        for rule in rules {
            let anchored = rule.anchored();

            let Some(found) = compiled(find(
                input,
                if anchored { "" } else { r"[_\W]" },
                rule,
                AFTER,
            ))?
            else {
                continue;
            };

            if let Some((index, end)) = found {
                // The match is a word of the title: an ambiguous flag reaching at most one character past its end.
                let next = input[at.title_end..]
                    .chars()
                    .next()
                    .map_or(1, char::len_utf8);

                if ambiguous
                    && !anchored
                    && index < at.title_end
                    && end <= at.title_end + next
                    && !input[index..end].contains(key.as_str())
                {
                    break;
                }

                if !flags.contains(key) {
                    flags.push(key.clone());
                }

                if !anchored {
                    at.title_end = at.title_end.min(index);
                }

                at.reach(end);
                break;
            } else if RULES.title.leading_flags.contains(key)
                && let Some(Some((_, end))) = compiled(find(input, "^", rule, AFTER))?
            {
                if !flags.contains(key) {
                    flags.push(key.clone());
                }

                at.title_start = end;
            }
        }
    }

    Ok(())
}

// A flag rule that is not a valid regex is skipped, as the reference implementation does; an error while matching is not.
fn compiled<T>(result: Result<T, Error>) -> Result<Option<T>, Error> {
    match result {
        Ok(value) => Ok(Some(value)),
        Err(Error::Regex(
            fancy_regex::Error::ParseError(..) | fancy_regex::Error::CompileError(_),
        )) => Ok(None),
        Err(error) => Err(error),
    }
}

fn dated(release: &mut Release, year: &str, day: &str, end: usize, at: &mut Positions) {
    if present(&release.year).is_some_and(|found| found != year) {
        return;
    }

    let day: String = day
        .chars()
        .map(|c| if c.is_ascii_digit() { c } else { '.' })
        .collect();
    let day = collapse(&day, |c| c == '.', ".");
    release.score += if present(&release.year).is_some() {
        0
    } else {
        1
    };
    release.year = Some(year.to_owned());
    release.episodes = vec![Episode::Text(day.clone())];
    release.episode = Some(day);
    at.reach(end);
}

fn clean(string: &str) -> Result<String, Error> {
    let string = string.replace(['(', ')'], "");
    Ok(regex(r"[\.\s]\-[\.\s]?", false)?
        .try_replacen(&string, 1, " ")?
        .into_owned())
}

fn capitalize(string: &str) -> Result<String, Error> {
    let string = string.strip_suffix('-').unwrap_or(string);
    let string = string.strip_prefix('-').unwrap_or(string);
    let string = trim(&collapse(string, is_space, " ")).to_lowercase();
    let string = string
        .split(' ')
        .map(|word| {
            let upper = word.to_uppercase();
            if RULES.title.uppercase.contains(&upper) {
                upper
            } else {
                word.to_owned()
            }
        })
        .collect::<Vec<_>>()
        .join(" ");
    let upper = |found: &Captures<'_, str>| group(found, 0).to_uppercase();
    let string = regex(r"(^([a-zA-Z]))|([ -][a-zA-Z])", false)?.try_replacen(&string, 0, upper)?;
    // Roman numbers (XVI, III)
    let string = regex(r"\W([ivx]+)(\W|$)", true)?.try_replacen(&string, 0, upper)?;
    let string = regex(r"\W(i+)\W?", true)?.try_replacen(&string, 0, upper)?;
    Ok(string.into_owned())
}

fn group<'t>(captures: &Captures<'t, str>, index: usize) -> &'t str {
    captures.get(index).map_or("", |group| group.as_str())
}

fn join(episodes: &[Episode]) -> String {
    episodes
        .iter()
        .map(Episode::pad2)
        .collect::<Vec<_>>()
        .join("-")
}

// Saturates: \d+ may not fit in a u64.
fn number(digits: &str) -> u64 {
    digits.parse().unwrap_or(u64::MAX)
}

fn is_digits(string: &str) -> bool {
    !string.is_empty() && string.bytes().all(|b| b.is_ascii_digit())
}

// A value is present when it is not null nor empty.
fn present(value: &Option<String>) -> Option<&str> {
    value.as_deref().filter(|value| !value.is_empty())
}

fn trim(string: &str) -> &str {
    string.trim_matches(is_space)
}

fn collapse(string: &str, run: impl Fn(char) -> bool, replacement: &str) -> String {
    let mut output = String::with_capacity(string.len());
    let mut inside = false;

    for c in string.chars() {
        if run(c) {
            if !inside {
                output.push_str(replacement);
            }
            inside = true;
        } else {
            output.push(c);
            inside = false;
        }
    }

    output
}

fn apostrophe_s(string: &str, insensitive: bool) -> String {
    let lower = string.find("'s");
    let found = if insensitive {
        lower.into_iter().chain(string.find("'S")).min()
    } else {
        lower
    };

    match found {
        Some(index) => format!("{}s{}", &string[..index], &string[index + 2..]),
        None => string.to_owned(),
    }
}

// The current year in UTC, from the days since 1970-01-01 (Howard Hinnant's civil_from_days).
fn host_year() -> i32 {
    let days = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_secs() / 86_400) as i64
        + 719_468;
    let era = days.div_euclid(146_097);
    let day_of_era = days.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month = (5 * day_of_year + 2) / 153;
    (year_of_era + era * 400 + i64::from(month >= 10)) as i32
}
