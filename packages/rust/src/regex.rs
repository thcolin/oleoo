use std::{cell::RefCell, collections::HashMap, rc::Rc};

use fancy_regex::Regex;

use crate::Error;

// \s of ECMAScript, as a class body: Rust reads \s as Unicode White_Space, which differs.
const SPACE: &str =
    r"\t-\r \x{A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}";

// Per thread: a parse looks up hundreds of patterns, a shared lock would serialize the threads.
thread_local! {
    static CACHE: RefCell<HashMap<String, Rc<Regex>>> = RefCell::default();
}

pub fn is_space(c: char) -> bool {
    matches!(c, '\t'..='\r' | ' ' | '\u{A0}' | '\u{1680}' | '\u{2000}'..='\u{200A}' | '\u{2028}' | '\u{2029}' | '\u{202F}' | '\u{205F}' | '\u{3000}' | '\u{FEFF}')
}

pub fn regex(pattern: &str, insensitive: bool) -> Result<Rc<Regex>, Error> {
    let source = if insensitive {
        format!("(?i){}", translate(pattern))
    } else {
        translate(pattern)
    };

    if let Some(regex) = CACHE.with_borrow(|cache| cache.get(&source).cloned()) {
        return Ok(regex);
    }

    let regex = Rc::new(Regex::new(&source)?);
    CACHE.with_borrow_mut(|cache| cache.insert(source, regex.clone()));
    Ok(regex)
}

// Gives \d, \w, \W, \s and . their ECMAScript meaning, and escapes what opens a nested class or a class operation in Rust.
// Without the u flag, ECMAScript does not fold the case of \w and \W: they stay out of (?i), which also keeps them cheap to compile.
fn translate(pattern: &str) -> String {
    let mut output = String::with_capacity(pattern.len());
    // Where the class being read starts in output, whether it holds \w or \W, whether it holds a letter.
    let mut class: Option<(usize, bool, bool)> = None;
    let mut chars = pattern.chars();

    while let Some(c) = chars.next() {
        match (c, &mut class) {
            ('\\', _) => match (chars.next(), &mut class) {
                (Some('d'), Some(_)) => output.push_str("0-9"),
                (Some('d'), None) => output.push_str("[0-9]"),
                (Some('w'), Some((_, word, _))) => {
                    *word = true;
                    output.push_str("A-Za-z0-9_");
                }
                (Some('w'), None) => output.push_str("(?-i:[A-Za-z0-9_])"),
                (Some('W'), Some((_, word, _))) => {
                    *word = true;
                    output.push_str("[^A-Za-z0-9_]");
                }
                (Some('W'), None) => output.push_str("(?-i:[^A-Za-z0-9_])"),
                (Some('s'), Some(_)) => output.push_str(SPACE),
                (Some('s'), None) => output.push_str(&format!("[{SPACE}]")),
                (Some(c), _) => {
                    output.push('\\');
                    output.push(c);
                }
                (None, _) => output.push('\\'),
            },
            ('[' | '&' | '~', Some(_)) => {
                output.push('\\');
                output.push(c);
            }
            ('[', None) => {
                class = Some((output.len(), false, false));
                output.push(c);
            }
            (']', Some((start, word, letters))) => {
                output.push(c);

                if *word && !*letters {
                    output.insert_str(*start, "(?-i:");
                    output.push(')');
                }

                class = None;
            }
            ('.', None) => output.push_str(r"[^\n\r\x{2028}\x{2029}]"),
            (c, Some((_, _, letters))) => {
                *letters |= c.is_alphabetic();
                output.push(c);
            }
            (c, None) => output.push(c),
        }
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classes_have_their_ecmascript_meaning() {
        assert!(regex(r"^[_\W]$", false).unwrap().is_match("é").unwrap());
        assert!(!regex(r"^[_\W]$", false).unwrap().is_match("a").unwrap());
        assert!(!regex(r"^\d$", false).unwrap().is_match("٣").unwrap());
        assert!(regex(r"^\s$", false).unwrap().is_match("\u{FEFF}").unwrap());
        assert!(!regex(r"^\s$", false).unwrap().is_match("\u{85}").unwrap());
        assert!(!regex(r"^.$", false).unwrap().is_match("\r").unwrap());
        assert!(regex(r"^[a\[&]+$", false).unwrap().is_match("a[&").unwrap());
        assert!(
            regex(r"int[ée]grale?", true)
                .unwrap()
                .is_match("INTÉGRALE")
                .unwrap()
        );
        assert!(regex(r"^[a\W]$", true).unwrap().is_match("A").unwrap());
        assert!(regex(r"^\W$", true).unwrap().is_match("\u{17F}").unwrap());
        assert!(!regex(r"^\w$", true).unwrap().is_match("\u{212A}").unwrap());
    }
}
