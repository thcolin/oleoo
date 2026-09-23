use std::{collections::HashSet, fs};

use oleoo::{Options, parse};
use serde_json::{Map, Value};

fn fixture(file: &str) -> String {
    let path = format!("{}/../../tests/fixtures/{file}", env!("CARGO_MANIFEST_DIR"));
    fs::read_to_string(&path).unwrap_or_else(|e| panic!("cannot read {path}: {e}"))
}

fn object(file: &str) -> Map<String, Value> {
    serde_json::from_str(&fixture(file)).unwrap()
}

// Pins the year window so the fixtures give the same result on any date.
fn options() -> Options {
    Options {
        current_year: Some(2026),
        ..Options::default()
    }
}

#[test]
fn fixtures() {
    let releases = fixture("releases.txt");
    let mut seen = HashSet::new();
    let names: Vec<_> = releases
        .lines()
        .filter(|name| !name.is_empty() && seen.insert(*name))
        .collect();
    let accepted = object("accepted.json");
    let refused = object("refused.json");
    let mut failures = Vec::new();

    for name in &names {
        let actual = serde_json::to_value(parse(name, &options()).unwrap()).unwrap();
        let (label, expected) = match (accepted.get(*name), refused.get(*name)) {
            (Some(expected), _) => ("accepted", expected.clone()),
            (None, Some(expected)) => {
                let mut expected = expected.clone();
                expected.as_object_mut().unwrap().remove("comment");
                ("refused", expected)
            }
            (None, None) => {
                failures.push(format!("[unknown] {name}"));
                continue;
            }
        };
        let (expected, actual) = (expected.as_object().unwrap(), actual.as_object().unwrap());
        let lines: Vec<_> = expected
            .keys()
            .chain(actual.keys().filter(|key| !expected.contains_key(*key)))
            .filter(|key| expected.get(*key) != actual.get(*key))
            .map(|key| {
                format!(
                    "    {key}: {} -> {}",
                    show(expected.get(key)),
                    show(actual.get(key))
                )
            })
            .collect();

        if !lines.is_empty() {
            failures.push(format!("[{label}] {name}\n{}", lines.join("\n")));
        }
    }

    assert!(
        failures.is_empty(),
        "{} of {} releases differ\n\n{}",
        failures.len(),
        names.len(),
        failures.join("\n\n")
    );
}

fn show(value: Option<&Value>) -> String {
    value.map_or("(none)".to_owned(), Value::to_string)
}
