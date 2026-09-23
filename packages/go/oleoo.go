// Package oleoo parses scene release names, following SPEC.md and rules.json of the oleoo repository.
package oleoo

import (
	"errors"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf16"

	"github.com/dlclark/regexp2"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"golang.org/x/text/unicode/norm"
)

// Release is what Parse and Guess return. A nil pointer is a null of the reference implementation.
// Episodes holds ints, or a single string for a date ("12.25") or a manga episode ("123").
type Release struct {
	Original         string   `json:"original"`
	Language         *string  `json:"language"`
	Languages        []string `json:"languages"`
	Source           *string  `json:"source"`
	Encoding         *string  `json:"encoding"`
	Resolution       *string  `json:"resolution"`
	Dub              *string  `json:"dub"`
	Year             *string  `json:"year"`
	Flags            []string `json:"flags"`
	Season           *int     `json:"season"`
	Episode          *string  `json:"episode"`
	Episodes         []any    `json:"episodes"`
	Type             string   `json:"type"`
	Group            *string  `json:"group"`
	Title            string   `json:"title"`
	AlternativeTitle string   `json:"alternativeTitle,omitempty"`
	CompleteTitle    string   `json:"completeTitle,omitempty"`
	Generated        string   `json:"generated"`
	Score            int      `json:"score"`
}

type options struct {
	strict      bool
	flagged     bool
	erase       []string
	defaults    *Release
	currentYear int
}

// Option changes how Parse, Guess or Stringify work. Stringify only reads Flagged.
type Option func(*options)

// Strict makes Parse return an error when no source, encoding, resolution nor dub is found.
func Strict(strict bool) Option { return func(o *options) { o.strict = strict } }

// Flagged places the flags in Generated, true by default.
func Flagged(flagged bool) Option { return func(o *options) { o.flagged = flagged } }

// Erase adds patterns to remove from the input, before those of rules.json. They run with no timeout: pass
// only trusted ones.
func Erase(patterns ...string) Option {
	return func(o *options) { o.erase = append(o.erase, patterns...) }
}

// Defaults gives the starting values of the release: a nil field is left to Parse.
func Defaults(release Release) Option { return func(o *options) { o.defaults = &release } }

// CurrentYear bounds the accepted years, the current year of the host by default.
func CurrentYear(year int) Option { return func(o *options) { o.currentYear = year } }

func newOptions(opts []Option) options {
	o := options{flagged: true, currentYear: time.Now().Year()}
	for _, opt := range opts {
		opt(&o)
	}
	return o
}

const ci = regexp2.ECMAScript | regexp2.IgnoreCase

var compiled sync.Map

func compile(pattern string, flags regexp2.RegexOptions) (*regexp2.Regexp, error) {
	type key struct {
		pattern string
		flags   regexp2.RegexOptions
	}

	if re, ok := compiled.Load(key{pattern, flags}); ok {
		return re.(*regexp2.Regexp), nil
	}

	re, err := regexp2.Compile(dialect(pattern), flags)
	if err != nil {
		return nil, err
	}

	compiled.Store(key{pattern, flags}, re)
	return re, nil
}

func must(pattern string, flags regexp2.RegexOptions) *regexp2.Regexp {
	return regexp2.MustCompile(dialect(pattern), flags)
}

// dialect brings a pattern back to the meaning JavaScript gives it. A class holding \W, [_\W], becomes (?:\W|[_]):
// under IgnoreCase regexp2 lowercases the ranges of \W inside a class, and U+0130 brings "i" into it. A "." outside
// a class leaves out U+2028 and U+2029, which the "." of regexp2 matches.
func dialect(pattern string) string {
	var out strings.Builder
	runes := []rune(pattern)

	for i := 0; i < len(runes); i++ {
		if runes[i] == '\\' && i+1 < len(runes) {
			out.WriteRune(runes[i])
			out.WriteRune(runes[i+1])
			i++
			continue
		}

		if runes[i] == '.' {
			out.WriteString(`[^\n\r\u2028\u2029]`)
			continue
		}

		if runes[i] != '[' {
			out.WriteRune(runes[i])
			continue
		}

		j, rest, word := i+1, "", false
		for ; j < len(runes) && runes[j] != ']'; j++ {
			if runes[j] == '\\' && j+1 < len(runes) {
				if runes[j+1] == 'W' {
					word = true
				} else {
					rest += string(runes[j : j+2])
				}
				j++
				continue
			}
			rest += string(runes[j])
		}

		switch {
		case !word || strings.HasPrefix(rest, "^") || j == len(runes):
			out.WriteString(string(runes[i:min(j+1, len(runes))]))
		case rest == "":
			out.WriteString(`(?:\W)`)
		default:
			out.WriteString(`(?:\W|[` + rest + `])`)
		}
		i = j
	}

	return out.String()
}

// text is a string as JavaScript sees it: one rune per UTF-16 code unit, so that positions count the same.
// probe is what the regexes read: under IgnoreCase regexp2 lowercases U+0130 and U+212A into the ASCII "i" and
// "k", which JavaScript does not, so both become U+E000, which every class of the dialect reads as they do.
type text struct {
	units []rune
	probe []rune
}

func newText(s string) text {
	units := utf16.Encode([]rune(s))
	t := text{make([]rune, len(units)), make([]rune, len(units))}
	for i, u := range units {
		t.units[i], t.probe[i] = rune(u), rune(u)
		if u == 0x0130 || u == 0x212a {
			t.probe[i] = 0xe000
		}
	}
	return t
}

func decode(units []rune) string {
	u := make([]uint16, len(units))
	for i, r := range units {
		u[i] = uint16(r)
	}
	return string(utf16.Decode(u))
}

func (t text) from(i int) text { return text{t.units[i:], t.probe[i:]} }

func (t text) slice(a, b int) string {
	if a >= b {
		return ""
	}
	return decode(t.units[a:b])
}

// regexp2 returns an error only past MatchTimeout, which is never set.
func (t text) first(re *regexp2.Regexp) *regexp2.Match {
	m, _ := re.FindRunesMatch(t.probe)
	return m
}

func (t text) every(re *regexp2.Regexp) []*regexp2.Match {
	var matches []*regexp2.Match
	for m, _ := re.FindRunesMatch(t.probe); m != nil; m, _ = re.FindNextMatch(m) {
		matches = append(matches, m)
	}
	return matches
}

func (t text) match(m *regexp2.Match) string { return t.slice(m.Index, end(m)) }

func (t text) group(m *regexp2.Match, i int) string {
	g := m.GroupByNumber(i)
	return t.slice(g.Index, g.Index+g.Length)
}

func match(re *regexp2.Regexp, s string) (text, *regexp2.Match) {
	t := newText(s)
	return t, t.first(re)
}

func test(re *regexp2.Regexp, s string) bool { return newText(s).first(re) != nil }

// replaceFunc replaces the first count matches, all of them when count is -1.
func replaceFunc(re *regexp2.Regexp, s string, with func(string) string, count int) string {
	t := newText(s)
	var out []rune
	last := 0
	for _, m := range t.every(re) {
		if count == 0 {
			break
		}
		out = append(out, t.units[last:m.Index]...)
		for _, u := range utf16.Encode([]rune(with(t.match(m)))) {
			out = append(out, rune(u))
		}
		last = end(m)
		count--
	}
	return decode(append(out, t.units[last:]...))
}

func replace(re *regexp2.Regexp, s, with string, count int) string {
	return replaceFunc(re, s, func(string) string { return with }, count)
}

func end(m *regexp2.Match) int { return m.Index + m.Length }

func find(t text, before string, r rule, after string) (*regexp2.Match, error) {
	re, err := compile("("+before+")"+r.pattern+after, ci)
	if err != nil {
		return nil, err
	}

	var guard *regexp2.Regexp
	if r.notAfter != "" {
		if guard, err = compile("(?:"+r.notAfter+")$", ci|regexp2.RightToLeft); err != nil {
			return nil, err
		}
	}

	for at := 0; at <= len(t.probe); {
		m, _ := re.FindRunesMatchStartingAt(t.probe, at)
		if m == nil {
			return nil, nil
		}

		if guard == nil {
			return m, nil
		}

		if ok, _ := guard.MatchRunes(t.probe[:m.Index+m.GroupByNumber(1).Length]); !ok {
			return m, nil
		}

		at = m.Index + 1
	}

	return nil, nil
}

// isSpace is the \s of ECMAScript, which String.prototype.trim also removes.
func isSpace(r rune) bool {
	switch {
	case r >= 0x09 && r <= 0x0d, r == 0x20, r == 0xa0, r == 0x1680, r >= 0x2000 && r <= 0x200a,
		r == 0x2028, r == 0x2029, r == 0x202f, r == 0x205f, r == 0x3000, r == 0xfeff:
		return true
	}
	return false
}

func trim(s string) string { return strings.TrimFunc(s, isSpace) }

func lower(s string) string { return cases.Lower(language.Und).String(s) }

func upper(s string) string { return cases.Upper(language.Und).String(s) }

func pad2(v any) string {
	s := fmt.Sprint(v)
	if n := len(utf16.Encode([]rune(s))); n < 2 {
		return strings.Repeat("0", 2-n) + s
	}
	return s
}

func present(s *string) bool { return s != nil && *s != "" }

func ptr[T any](v T) *T { return &v }

var (
	extensions = must(`\.(`+strings.Join(rules.Extensions, "|")+`)(\W.*)?$`, ci)

	tvshow = []*regexp2.Regexp{
		must(`\WS(eason[_\W])?\d{1,3}\W?(?:-?EP?\d+)*[e\.\-\s]`, ci),
		must(`\W(?:-?EP?\d+)+(\W)?`, ci),
		must(`\W(\d{4}[_\W]\d{2}[_\W]\d{2}[_\W])(\W)?`, ci),
		must(`\W(\d{2}[_\W]\d{2}[_\W]\d{4}[_\W])(\W)?`, ci),
		must(`\W(?:(?:\d{1,2})x(?:\d{1,3}))+(\W)?`, ci),
	}

	yearRange  = must(`[_\W]((\d{4})[\.\s]?-[\.\s]?(\d{4}))`, regexp2.ECMAScript)
	yearSingle = must(`[_\W](\d{4})(?![_\W]\d{2}[_\W]\d{2})`, regexp2.ECMAScript)
	endsInDate = must(`\d{2}[_\W]\d{2}$`, regexp2.ECMAScript|regexp2.RightToLeft)

	season        = must(`\WS(?:eason[_\W]?)?(\d{1,3})[e\.\-\s]`, ci)
	episodeRange  = must(`EP?(\d+)\-(\d+)`, ci)
	episodeSingle = must(`EP?(\d+)`, ci)
	episodeCross  = must(`\W?(?:(\d{1,2})x(\d{1,3}))+(\W)?`, ci)
	episodeYMD    = must(`\W(\d{4})[_\W](\d{2}[_\W]\d{2})[_\W]?`, ci)
	episodeDMY    = must(`\W(\d{2}[_\W]\d{2})[_\W](\d{4})[_\W]?`, ci)
	nonDigit      = must(`\D`, regexp2.ECMAScript)
	dots          = must(`\.+`, regexp2.ECMAScript)

	groupName = must(`(?:by[\W\-])?([\w\.]+)`, ci)

	possessive = must(`'s`, ci)
	brackets   = must(`\[.+\]`, regexp2.ECMAScript)
	aka        = must(`[\.\s]aka[\.\s](.*?)$`, ci)
	dash       = must(`[\.\s]\-[\.\s]?(.*?)$`, ci)
	square     = must(`\s?\[(.+)\]?\s?`, ci)
	round      = must(`\s?\((.+)\)?\s?`, ci)
	dashClean  = must(`[\.\s]\-[\.\s]?`, regexp2.ECMAScript)
	spaces     = must(`\s+`, regexp2.ECMAScript)
	initials   = must(`(^([a-zA-Z]))|([ -][a-zA-Z])`, regexp2.ECMAScript)
	romans     = must(`\W([ivx]+)(\W|$)`, ci)
	romanOnes  = must(`\W(i+)\W?`, ci)

	fourDigits  = must(`^\d{4}$`, regexp2.ECMAScript)
	digits      = must(`^\d+$`, regexp2.ECMAScript)
	leadingYear = must(`^(\d{4})\W?(.+$)`, regexp2.ECMAScript)
	manga       = must(`^(\d{3,}$)`, regexp2.ECMAScript)
	collection  = must(`^(.+)(\d[, \-]\s?){2,}\d$`, regexp2.ECMAScript)
)

// Parse reads a release name. It returns an error when an Erase pattern, or a rule other than a flag, is not a
// valid regex, and with Strict(true) when the name has no source, encoding, resolution nor dub.
func Parse(raw string, opts ...Option) (Release, error) {
	o := newOptions(opts)

	n := 0
	for _, r := range raw {
		n += max(utf16.RuneLen(r), 1)
	}
	if n > 1024 {
		return Release{}, fmt.Errorf("name of %d characters: more than 1024 characters", n)
	}

	s := raw
	for i, pattern := range append(slices.Clone(o.erase), rules.Erase...) {
		pattern = `[.\-]*?` + strings.ReplaceAll(pattern, `\\`, `\`) + `[.\-]*?`
		var re *regexp2.Regexp
		var err error
		if i < len(o.erase) {
			// Not cached: a caller that builds its patterns would grow the cache without bound.
			re, err = regexp2.Compile(dialect(pattern), ci)
		} else {
			re, err = compile(pattern, ci)
		}
		if err != nil {
			return Release{}, err
		}
		s = replace(re, s, "", -1)
	}
	s = trim(replace(extensions, s, "", 1))
	input := newText(s)

	r := Release{Languages: []string{}, Flags: []string{}, Episodes: []any{}}
	if d := o.defaults; d != nil {
		r.Year, r.Source, r.Encoding, r.Resolution, r.Dub = d.Year, d.Source, d.Encoding, d.Resolution, d.Dub
		r.Language, r.Season, r.Episode, r.Group = d.Language, d.Season, d.Episode, d.Group
		r.AlternativeTitle = d.AlternativeTitle
		if d.Languages != nil {
			r.Languages = slices.Clone(d.Languages)
		}
		if d.Flags != nil {
			r.Flags = slices.Clone(d.Flags)
		}
		if d.Episodes != nil {
			r.Episodes = slices.Clone(d.Episodes)
		}
	}
	valid := false

	titleStart, titleEnd, groupStart := 0, len(input.units), 0
	move := func(m *regexp2.Match) {
		titleEnd = min(titleEnd, m.Index)
		groupStart = max(groupStart, end(m))
	}
	push := func(flag string) {
		if !slices.Contains(r.Flags, flag) {
			r.Flags = append(r.Flags, flag)
		}
	}

	r.Type = "movie"
	for _, re := range tvshow {
		if m := input.first(re); m != nil {
			titleEnd, groupStart = m.Index, end(m)
			r.Type = "tvshow"
			break
		}
	}

	accepted := func(year string) bool {
		n, _ := strconv.Atoi(year)
		return n > 1900 && n < o.currentYear+5
	}
	if m := input.first(yearRange); m != nil && accepted(input.group(m, 2)) && accepted(input.group(m, 3)) {
		r.Year = ptr(input.group(m, 2) + "-" + input.group(m, 3))
		r.Score++
		r.Flags = append(r.Flags, "COLLECTION")
		move(m)
	} else {
		var kept []*regexp2.Match
		for _, m := range input.every(yearSingle) {
			if ok, _ := endsInDate.MatchRunes(input.probe[:m.Index]); !ok && accepted(input.group(m, 1)) {
				kept = append(kept, m)
			}
		}
		if len(kept) > 0 {
			m := kept[len(kept)-1]
			r.Year = ptr(input.group(m, 1))
			r.Score++
			move(m)
		}
	}

	for _, p := range []struct {
		set   ruleSet
		field **string
		after string
	}{
		{rules.Source, &r.Source, `([_\W]|$)`},
		{rules.Encoding, &r.Encoding, `([_\W]|$)`},
		{rules.Resolution, &r.Resolution, `([_\W]|$)`},
		{rules.Dub, &r.Dub, `([\.\-\s]?\@?\d+(kbps)?)?([_\W]|$)`},
	} {
		for _, k := range p.set {
			for _, rl := range k.rules {
				m, err := find(input, `[_\W]`, rl, p.after)
				if err != nil {
					return Release{}, err
				}
				if m != nil {
					if !present(*p.field) {
						r.Score++
					}
					*p.field = ptr(k.key)
					valid = true
					move(m)
					break
				}
			}
		}
	}

	flags := func(ambiguous bool) {
		for _, k := range rules.Flags {
			if slices.Contains(rules.Ambiguous.Flags, k.key) != ambiguous {
				continue
			}

			for _, rl := range k.rules {
				anchored := rl.str && strings.HasPrefix(rl.pattern, "^")
				before := `[_\W]`
				if anchored {
					before = ""
				}

				m, err := find(input, before, rl, `([_\W]|$)`)
				if err != nil {
					continue
				}

				if m != nil {
					if ambiguous && !anchored && m.Index < titleEnd && end(m) <= titleEnd+1 && !strings.Contains(input.match(m), k.key) {
						break
					}

					push(k.key)
					if !anchored {
						titleEnd = min(titleEnd, m.Index)
					}
					groupStart = max(groupStart, end(m))
					break
				}

				if slices.Contains(rules.Title.LeadingFlags, k.key) {
					if m, err := find(input, "^", rl, `([_\W]|$)`); err == nil && m != nil {
						push(k.key)
						titleStart = m.Length
					}
				}
			}
		}
	}

	flags(false)

	offset := 0
	if titleEnd != len(input.units) {
		offset = titleEnd
	}
	for _, k := range rules.Language {
		for _, rl := range k.rules {
			m, err := find(input.from(offset), `[_\W]`, rl, `([_\W]|$)`)
			if err != nil {
				return Release{}, err
			}
			if m != nil {
				r.Languages = append(r.Languages, k.key)
				groupStart = max(groupStart, offset+end(m))
				break
			}
		}
	}

	if len(r.Languages) == 0 {
		for _, k := range rules.Language {
			for _, rl := range k.rules {
				m, err := find(input, `[_\W]`, rl, `([_\W]|$)`)
				if err != nil {
					return Release{}, err
				}
				if m != nil {
					if !(rl.str && slices.Contains(rules.Ambiguous.Patterns, rl.pattern) && end(m) < titleEnd) {
						r.Languages = append(r.Languages, k.key)
						move(m)
					}
					break
				}
			}
		}
	}

	flags(true)

	if len(r.Flags) > 0 {
		r.Score++
	}

	if len(r.Languages) > 0 {
		r.Score++
		if len(r.Languages) == 1 {
			r.Language = ptr(r.Languages[0])
		} else {
			has := func(l string) bool { return slices.Contains(r.Languages, l) }
			switch {
			case has("TRUEFRENCH") && (has("FRENCH") || has("VFQ")):
				r.Language = ptr("MULTi-VF2")
			case has("TRUEFRENCH"):
				r.Language = ptr("MULTi-VFF")
			case has("VFQ"):
				r.Language = ptr("MULTi-VFQ")
			default:
				r.Language = ptr("MULTi")
			}
		}
	}

	if r.Type == "tvshow" {
		joined := func() *string {
			parts := make([]string, len(r.Episodes))
			for i, e := range r.Episodes {
				parts[i] = pad2(e)
			}
			return ptr(strings.Join(parts, "-"))
		}
		date := func(m *regexp2.Match, year, day string) {
			if !present(r.Year) || *r.Year == year {
				episode := replace(dots, replace(nonDigit, day, ".", -1), ".", -1)
				r.Episode = ptr(episode)
				r.Episodes = []any{episode}
				if !present(r.Year) {
					r.Score++
				}
				r.Year = ptr(year)
				groupStart = max(groupStart, end(m))
			}
		}

		if m := input.first(season); m != nil {
			n, _ := strconv.Atoi(input.group(m, 1))
			r.Season = ptr(n)
			groupStart = max(groupStart, end(m))
		}

		if m := input.first(episodeRange); m != nil {
			from, _ := strconv.Atoi(input.group(m, 1))
			to, err := strconv.Atoi(input.group(m, 2))
			if err != nil || (to >= from && to-from >= 9999) {
				return Release{}, fmt.Errorf("episodes %s to %s: more than 9999 episodes", input.group(m, 1), input.group(m, 2))
			}
			r.Episodes = []any{}
			for n := from; n <= to; n++ {
				r.Episodes = append(r.Episodes, n)
			}
			r.Episode = joined()
			groupStart = max(groupStart, end(m))
		} else if matches := input.every(episodeSingle); len(matches) > 0 {
			r.Episodes = []any{}
			for _, m := range matches {
				n, _ := strconv.Atoi(input.group(m, 1))
				r.Episodes = append(r.Episodes, n)
			}
			r.Episode = joined()
			groupStart = max(groupStart, end(matches[len(matches)-1]))
		} else if matches := input.every(episodeCross); len(matches) > 0 {
			n, _ := strconv.Atoi(input.group(matches[0], 1))
			r.Season = ptr(n)
			r.Episodes = []any{}
			for _, m := range matches {
				n, _ := strconv.Atoi(input.group(m, 2))
				r.Episodes = append(r.Episodes, n)
			}
			r.Episode = joined()
			groupStart = max(groupStart, end(matches[len(matches)-1]))
		} else if m := input.first(episodeYMD); m != nil {
			date(m, input.group(m, 1), input.group(m, 2))
		} else if m := input.first(episodeDMY); m != nil {
			date(m, input.group(m, 2), input.group(m, 1))
		}
	}

	rest := input.from(min(max(groupStart, titleEnd), len(input.units)))
	if m := rest.first(groupName); m != nil {
		name := strings.Replace(rest.group(m, 1), "'s", "s", 1)
		name = strings.Map(func(c rune) rune {
			switch {
			case c >= 0x0300 && c <= 0x036f, c >= 0x2000 && c <= 0x206f:
				return -1
			case c >= 0x21 && c <= 0x22, c >= 0x27 && c <= 0x2f, c >= 0x3a && c <= 0x3f, c >= 0x5b && c <= 0x60, c >= 0x7b && c <= 0x7f:
				return ' '
			}
			return c
		}, name)
		words := strings.FieldsFunc(name, isSpace)
		if len(words) == 0 {
			words = []string{""}
		}
		r.Group = ptr(words[0])
		r.Score++
	}

	title := input.slice(titleStart, titleEnd)
	title = replace(dots, title, " ", -1)
	title = norm.NFD.String(title)
	title = replace(possessive, title, "s", 1)
	title = replace(brackets, title, "", -1)
	title = strings.Map(func(c rune) rune {
		switch {
		case c >= 0x0300 && c <= 0x036f, c >= 0x2000 && c <= 0x206f:
			return -1
		case c == 0x21, c == 0x22, c == 0x27, c == 0x2a, c == 0x2b, c == 0x2c, c == 0x2e, c == 0x2f,
			c >= 0x3a && c <= 0x3f, c == 0x5c, c >= 0x5e && c <= 0x60, c >= 0x7b && c <= 0x7f:
			return ' '
		}
		return c
	}, title)
	title = strings.ReplaceAll(strings.ReplaceAll(title, "Œ", "OE"), "œ", "oe")
	r.Title = title

	clean := func(s string) string {
		return replace(dashClean, strings.NewReplacer("(", "", ")", "").Replace(s), " ", 1)
	}
	if t, m := match(aka, r.Title); m != nil {
		r.Title = strings.Replace(r.Title, t.match(m), "", 1)
		r.AlternativeTitle = t.group(m, 1)
	}
	for _, re := range []*regexp2.Regexp{dash, square, round} {
		if t, m := match(re, r.Title); m != nil {
			r.Title = clean(strings.Replace(r.Title, t.match(m), "", 1))
			r.AlternativeTitle = clean(t.group(m, 1))
		}
	}

	r.Title = capitalize(r.Title)
	if r.AlternativeTitle != "" {
		r.AlternativeTitle = capitalize(r.AlternativeTitle)

		switch {
		case test(fourDigits, r.AlternativeTitle):
			r.Year = ptr(r.AlternativeTitle)
			r.AlternativeTitle = ""
		case !present(r.Year) && test(fourDigits, r.Title):
			r.Year = ptr(r.Title)
			r.Title, r.AlternativeTitle = r.AlternativeTitle, ""
		case test(digits, r.Title):
			r.Title, r.AlternativeTitle = r.AlternativeTitle, ""
		}
	}

	if r.Title == "" && r.AlternativeTitle != "" {
		r.Title, r.AlternativeTitle = r.AlternativeTitle, ""
	}

	if slices.Contains(rules.Title.Franchises, r.Title) && r.AlternativeTitle != "" {
		r.Title, r.AlternativeTitle = r.AlternativeTitle, ""
	}

	if t, m := match(leadingYear, r.Title); !present(r.Year) && m != nil {
		i := slices.IndexFunc(rules.Title.LeadingYears, func(y struct {
			Year     string `json:"year"`
			Contains string `json:"contains"`
			Release  string `json:"release"`
		}) bool {
			return y.Year == t.group(m, 1) && strings.Contains(lower(t.group(m, 2)), y.Contains)
		})
		if i >= 0 {
			r.Year = ptr(rules.Title.LeadingYears[i].Release)
		} else {
			r.Year = ptr(t.group(m, 1))
			r.Title = t.group(m, 2)
		}
	}

	if t, m := match(manga, r.AlternativeTitle); r.Type == "movie" && r.AlternativeTitle != "" && m != nil {
		r.Type = "tvshow"
		r.Episode = ptr(t.group(m, 1))
		r.Episodes = []any{t.group(m, 1)}
		r.AlternativeTitle = ""
	}

	if t, m := match(collection, r.Title); r.Type == "movie" && m != nil {
		r.Flags = append(r.Flags, "COLLECTION")
		r.Title = trim(t.group(m, 1))
	}

	if r.Type == "tvshow" {
		if slices.Contains(r.Flags, "COLLECTION") {
			r.Flags = slices.DeleteFunc(r.Flags, func(f string) bool { return f == "COLLECTION" })
		} else if slices.Contains(r.Flags, "COMPLETE") {
			r.Flags = slices.DeleteFunc(r.Flags, func(f string) bool { return f == "COMPLETE" })
		}
	}

	if r.Year != nil && *r.Year == "0" {
		r.Year = nil
	}

	r.Generated = stringify(r, o.flagged)

	if o.strict && !valid {
		return Release{}, errors.New(`"` + s + `" does't follow scene release naming rules`)
	}

	r.Original = s
	if r.AlternativeTitle != "" {
		r.CompleteTitle = r.Title + " (" + r.AlternativeTitle + ")"
	}

	return r, nil
}

func capitalize(s string) string {
	s = strings.TrimSuffix(s, "-")
	s = strings.TrimPrefix(s, "-")
	words := strings.Split(lower(strings.Join(strings.FieldsFunc(s, isSpace), " ")), " ")
	for i, word := range words {
		if slices.Contains(rules.Title.Uppercase, upper(word)) {
			words[i] = upper(word)
		}
	}
	s = strings.Join(words, " ")

	for _, re := range []*regexp2.Regexp{initials, romans, romanOnes} {
		s = replaceFunc(re, s, upper, -1)
	}

	return s
}

// Guess is Parse without Strict, filling the year and the resolution when the name has none.
func Guess(name string, opts ...Option) (Release, error) {
	o := newOptions(opts)
	r, err := Parse(name, append(slices.Clone(opts), Strict(false))...)
	if err != nil {
		return r, err
	}

	if !present(r.Year) {
		r.Year = ptr(strconv.Itoa(o.currentYear))
	}

	if !present(r.Resolution) {
		switch {
		case slices.Contains(r.Flags, "UHD"):
			r.Resolution = ptr("2160p")
		case r.Source != nil && (*r.Source == "BDSCR" || *r.Source == "BLURAY"):
			r.Resolution = ptr("1080p")
		default:
			r.Resolution = ptr("SD")
		}
	}

	r.Generated = stringify(r, o.flagged)
	return r, nil
}

// Stringify writes a release name back from its fields.
func Stringify(release Release, opts ...Option) string {
	return stringify(release, newOptions(opts).flagged)
}

func stringify(r Release, flagged bool) string {
	has := func(flag string) bool { return slices.Contains(r.Flags, flag) }
	dubRelated := slices.ContainsFunc(rules.Stringify.DubRelated, has)

	// A dub channel flag like 5.1 goes after the source when the release has a dub related flag, after the dub otherwise.
	place := func(e entry) string {
		if (!e.object || e.dubRelated == dubRelated) && has(e.flag) {
			return e.flag
		}
		return ""
	}

	var parts []string
	add := func(values ...string) { parts = append(parts, values...) }
	after := func(entries []entry) {
		if flagged {
			for _, e := range entries {
				add(place(e))
			}
		}
	}

	add(replace(spaces, r.Title, ".", -1))
	after(rules.Stringify.AfterTitle)
	if present(r.Year) {
		add(*r.Year)
	}
	if (r.Season != nil && *r.Season != 0) || len(r.Episodes) > 0 {
		part := ""
		if r.Season != nil && *r.Season != 0 {
			part = "S" + pad2(*r.Season)
		}
		if len(r.Episodes) > 0 {
			numeric := !slices.ContainsFunc(r.Episodes, func(e any) bool { return !test(digits, fmt.Sprint(e)) })
			episodes := make([]string, len(r.Episodes))
			for i, e := range r.Episodes {
				episodes[i] = pad2(e)
			}
			if numeric {
				part += "E" + strings.Join(episodes, "-E")
			} else {
				part += strings.Join(episodes, "-")
			}
		}
		add(part)
	}
	after(rules.Stringify.AfterYear)
	if present(r.Language) {
		add(*r.Language)
	}
	after(rules.Stringify.AfterLanguage)
	if present(r.Resolution) && *r.Resolution != "SD" {
		add(*r.Resolution)
	}
	after(rules.Stringify.AfterResolution)
	if present(r.Source) && !(*r.Source == "HDRip" && has("mHD")) {
		add(*r.Source)
	}
	after(rules.Stringify.AfterSource)
	if present(r.Encoding) {
		add(*r.Encoding)
	}
	after(rules.Stringify.AfterEncoding)
	if present(r.Dub) {
		add(*r.Dub)
	}
	after(rules.Stringify.AfterDub)

	if flagged {
		var placed []string
		for _, entries := range [][]entry{
			rules.Stringify.AfterTitle, rules.Stringify.AfterYear, rules.Stringify.AfterLanguage, rules.Stringify.AfterResolution,
			rules.Stringify.AfterSource, rules.Stringify.AfterEncoding, rules.Stringify.AfterDub,
		} {
			for _, e := range entries {
				if e.object {
					placed = append(placed, place(e))
				} else {
					placed = append(placed, e.flag)
				}
			}
		}
		for _, flag := range r.Flags {
			if !slices.Contains(placed, flag) {
				add(flag)
			}
		}
	}

	parts = slices.DeleteFunc(parts, func(p string) bool { return p == "" })
	group := "NOTEAM"
	if present(r.Group) {
		group = *r.Group
	}

	return strings.Join(parts, ".") + "-" + group
}
