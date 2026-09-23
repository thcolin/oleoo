// Expected values come from packages/js/src/index.js, the reference implementation.
use oleoo::{Defaults, Error, Options, guess, parse};
use serde_json::{Value, json};

fn options() -> Options {
    Options {
        current_year: Some(2026),
        ..Options::default()
    }
}

fn value<T: serde::Serialize>(release: T) -> Value {
    serde_json::to_value(release).unwrap()
}

#[test]
fn erase_removes_its_match() {
    let options = Options {
        erase: vec![r"\\[www.*?\\]".to_owned()],
        ..options()
    };
    assert_eq!(
        parse("Foo.2010.1080p.BluRay.x264-GRP.[www.site.com]", &options)
            .unwrap()
            .original,
        "Foo.2010.1080p.BluRay.x264-GRP"
    );
}

#[test]
fn current_year_bounds_the_accepted_years() {
    assert_eq!(
        parse("Foo.2031.1080p.BluRay.x264-GRP", &options())
            .unwrap()
            .year,
        None
    );
    let options = Options {
        current_year: Some(2027),
        ..options()
    };
    assert_eq!(
        parse("Foo.2031.1080p.BluRay.x264-GRP", &options)
            .unwrap()
            .year
            .as_deref(),
        Some("2031")
    );
}

#[test]
fn rules() {
    let release = |name| parse(name, &options()).unwrap();
    assert_eq!(
        release("Le.Cœur.des.Œuvres.Œdipe.2010.1080p.BluRay.x264-GRP").title,
        "Le Coeur Des Oeuvres Oedipe"
    );
    assert_eq!(
        release("Foo.2010.AD.CH. 720p.HDTV.x264-GRP").languages,
        ["CHiNESE"]
    );
    assert!(
        release("Foo.2010.DTS.5.1.CH. 720p.x264-GRP")
            .languages
            .is_empty()
    );
}

#[test]
fn defaults_start_the_payload() {
    let defaults = Defaults {
        languages: vec!["ENGLiSH".to_owned()],
        group: Some("X".to_owned()),
        ..Defaults::default()
    };
    let release = parse(
        "Foo.2010.1080p.BluRay.x264.FRENCH-GRP",
        &Options {
            defaults,
            ..options()
        },
    )
    .unwrap();
    assert_eq!(release.languages, ["ENGLiSH", "FRENCH"]);
    assert_eq!(release.language.as_deref(), Some("MULTi"));
    assert_eq!(release.group.as_deref(), Some("GRP"));
    assert_eq!(release.score, 6);
}

#[test]
fn flagged_leaves_the_flags_out() {
    let options = Options {
        flagged: false,
        ..options()
    };
    assert_eq!(
        parse("Movie.Title.PROPER.1080p.BluRay.x264.DD5.1-GRP", &options)
            .unwrap()
            .generated,
        "Movie.Title.1080p.BLURAY.x264-GRP"
    );
}

#[test]
fn strict_fails_without_source_encoding_resolution_nor_dub() {
    let options = Options {
        strict: true,
        ..options()
    };
    let error = parse("Just some words", &options).unwrap_err();
    assert!(matches!(error, Error::Strict(_)));
    assert_eq!(
        error.to_string(),
        r#""Just some words" does't follow scene release naming rules"#
    );
    assert!(guess("Just some words", &options).is_ok());
}

#[test]
fn guess_fills_the_year_and_the_resolution() {
    assert_eq!(
        value(guess("Some.Show.S02E03.FRENCH.UHD.x265.DTS.5.1", &options()).unwrap()),
        json!({"original":"Some.Show.S02E03.FRENCH.UHD.x265.DTS.5.1","language":"FRENCH","languages":["FRENCH"],"source":null,"encoding":"x265","resolution":"2160p","dub":null,"year":"2026","flags":["DTS","UHD","5.1"],"season":2,"episode":"03","episodes":[3],"type":"tvshow","group":null,"title":"Some Show","generated":"Some.Show.2026.S02E03.FRENCH.2160p.UHD.DTS.5.1.x265-NOTEAM","score":4})
    );
    let options = Options {
        flagged: false,
        ..options()
    };
    let release = guess("Movie.Title.BluRay.x264", &options).unwrap();
    assert_eq!(
        (release.resolution.as_deref(), release.generated.as_str()),
        (Some("1080p"), "Movie.Title.2026.1080p.BLURAY.x264-NOTEAM")
    );
}

#[test]
fn an_alternative_title_emptied_by_the_capitalization_still_moves_the_year() {
    for name in ["2010 - -", "2010.-.-"] {
        assert_eq!(
            value(parse(name, &options()).unwrap()),
            json!({"original":name,"language":null,"languages":[],"source":null,"encoding":null,"resolution":null,"dub":null,"year":"2010","flags":[],"season":null,"episode":null,"episodes":[],"type":"movie","group":null,"title":"","generated":"2010-NOTEAM","score":0})
        );
    }
}

#[test]
fn an_episode_range_of_more_than_9999_episodes_fails() {
    for name in ["Show.S01E1-10000.720p", "Show.E1-99999999999999999999.720p"] {
        assert!(matches!(
            parse(name, &options()),
            Err(Error::EpisodeRange(..))
        ));
    }
    assert_eq!(
        value(parse("Show.E1-3.720p", &options()).unwrap().episodes),
        json!([1, 2, 3])
    );
    assert_eq!(
        parse("Show.S01E1-9999.720p", &options())
            .unwrap()
            .episodes
            .len(),
        9999
    );
}

#[test]
fn current_year_does_not_overflow() {
    let options = Options {
        current_year: Some(i32::MAX),
        ..options()
    };
    assert_eq!(
        parse("Foo.2031.1080p.BluRay.x264-GRP", &options)
            .unwrap()
            .year
            .as_deref(),
        Some("2031")
    );
}
