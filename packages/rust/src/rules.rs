use std::sync::LazyLock;

use serde::{Deserialize, Deserializer, de::Error as _};
use serde_json::{Map, Value};

pub static RULES: LazyLock<Rules> = LazyLock::new(|| {
    serde_json::from_str(include_str!(concat!(env!("OUT_DIR"), "/rules.json")))
        .expect("rules.json does not follow SPEC.md")
});

// A rule is a pattern, or { pattern, notAfter } when the match must not follow notAfter: it stands in for a lookbehind.
#[derive(Deserialize)]
#[serde(untagged)]
pub enum Rule {
    Pattern(String),
    Guarded {
        pattern: String,
        #[serde(rename = "notAfter")]
        not_after: String,
    },
}

impl Rule {
    pub fn pattern(&self) -> &str {
        match self {
            Rule::Pattern(pattern) | Rule::Guarded { pattern, .. } => pattern,
        }
    }

    pub fn not_after(&self) -> Option<&str> {
        match self {
            Rule::Pattern(_) => None,
            Rule::Guarded { not_after, .. } => Some(not_after),
        }
    }

    pub fn anchored(&self) -> bool {
        matches!(self, Rule::Pattern(pattern) if pattern.starts_with('^'))
    }
}

// The keys of source, encoding, resolution, dub, language and flags, in file order: the last matching key wins.
pub type Keys = Vec<(String, Vec<Rule>)>;

#[derive(Deserialize)]
pub struct Rules {
    #[serde(deserialize_with = "ordered")]
    pub source: Keys,
    #[serde(deserialize_with = "ordered")]
    pub encoding: Keys,
    #[serde(deserialize_with = "ordered")]
    pub resolution: Keys,
    #[serde(deserialize_with = "ordered")]
    pub dub: Keys,
    #[serde(deserialize_with = "ordered")]
    pub language: Keys,
    #[serde(deserialize_with = "ordered")]
    pub flags: Keys,
    pub erase: Vec<String>,
    pub extensions: Vec<String>,
    pub ambiguous: Ambiguous,
    pub title: Title,
    pub stringify: Order,
}

#[derive(Deserialize)]
pub struct Ambiguous {
    pub flags: Vec<String>,
    pub patterns: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Title {
    pub uppercase: Vec<String>,
    pub leading_flags: Vec<String>,
    pub franchises: Vec<String>,
    pub leading_years: Vec<LeadingYear>,
}

#[derive(Deserialize)]
pub struct LeadingYear {
    pub year: String,
    pub contains: String,
    pub release: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub dub_related: Vec<String>,
    pub after_title: Vec<Entry>,
    pub after_year: Vec<Entry>,
    pub after_language: Vec<Entry>,
    pub after_resolution: Vec<Entry>,
    pub after_source: Vec<Entry>,
    pub after_encoding: Vec<Entry>,
    pub after_dub: Vec<Entry>,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum Entry {
    Flag(String),
    Placed {
        flag: String,
        #[serde(rename = "dubRelated")]
        dub_related: bool,
    },
}

fn ordered<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Keys, D::Error> {
    Map::<String, Value>::deserialize(deserializer)?
        .into_iter()
        .map(|(key, rules)| {
            Ok((
                key,
                serde_json::from_value(rules).map_err(D::Error::custom)?,
            ))
        })
        .collect()
}
