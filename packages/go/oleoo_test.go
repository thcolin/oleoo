package oleoo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"regexp"
	"slices"
	"sort"
	"strings"
	"testing"
)

func fixture(t *testing.T, name string) []byte {
	t.Helper()
	b, err := os.ReadFile("../../tests/fixtures/" + name)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func normalize(t *testing.T, v any) map[string]any {
	t.Helper()
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	var m map[string]any
	if err := json.Unmarshal(b, &m); err != nil {
		t.Fatal(err)
	}
	return m
}

func diff(expected, actual map[string]any) []string {
	keys := map[string]bool{}
	for k := range expected {
		keys[k] = true
	}
	for k := range actual {
		keys[k] = true
	}

	var lines []string
	for k := range keys {
		if !reflect.DeepEqual(expected[k], actual[k]) {
			e, _ := json.Marshal(expected[k])
			a, _ := json.Marshal(actual[k])
			lines = append(lines, fmt.Sprintf("    %s: %s -> %s", k, e, a))
		}
	}
	sort.Strings(lines)
	return lines
}

// Pins the year window so the fixtures give the same result on any date.
func TestFixtures(t *testing.T) {
	var accepted, refused map[string]map[string]any
	if err := json.Unmarshal(fixture(t, "accepted.json"), &accepted); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(fixture(t, "refused.json"), &refused); err != nil {
		t.Fatal(err)
	}

	var names []string
	for _, name := range regexp.MustCompile(`\r?\n`).Split(string(fixture(t, "releases.txt")), -1) {
		if name != "" && !slices.Contains(names, name) {
			names = append(names, name)
		}
	}

	failures := 0
	for _, name := range names {
		release, err := Parse(name, CurrentYear(2026))
		if err != nil {
			t.Errorf("%s\n    %v", name, err)
			failures++
			continue
		}

		expected, ok := accepted[name]
		if !ok {
			if expected, ok = refused[name]; ok {
				delete(expected, "comment")
			}
		}
		if !ok {
			t.Errorf("[unknown] %s\n    neither accepted nor refused", name)
			failures++
			continue
		}

		if lines := diff(expected, normalize(t, release)); len(lines) > 0 {
			t.Errorf("%s\n%s", name, strings.Join(lines, "\n"))
			failures++
		}
	}

	t.Logf("%d releases, %d accepted, %d refused, %d to review", len(names), len(accepted), len(refused), failures)
}

func TestRulesCopy(t *testing.T) {
	root, err := os.ReadFile("../../rules.json")
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(root, rulesJSON) {
		t.Error("rules.json differs from ../../rules.json, run `go generate`")
	}
}

func TestRulesCompile(t *testing.T) {
	for _, set := range []ruleSet{rules.Source, rules.Encoding, rules.Resolution, rules.Dub, rules.Language, rules.Flags} {
		for _, k := range set {
			for _, r := range k.rules {
				for _, pattern := range []string{r.pattern, r.notAfter} {
					if _, err := compile(pattern, ci); err != nil {
						t.Errorf("%s: %s: %v", k.key, pattern, err)
					}
				}
			}
		}
	}
}

func TestOptions(t *testing.T) {
	if r, _ := Parse("Foo.2010.1080p.BluRay.x264-GRP.[www.site.com]", CurrentYear(2026), Erase(`\[www.*?\]`)); r.Original != "Foo.2010.1080p.BluRay.x264-GRP" {
		t.Errorf("erase does not remove its match: %q", r.Original)
	}

	if _, err := Parse("Foo.2010.1080p.BluRay.x264-GRP", Erase(`(`)); err == nil {
		t.Error("an erase pattern that is not a regex gives no error")
	}

	before, _ := Parse("Foo.2031.1080p.BluRay.x264-GRP", CurrentYear(2026))
	after, _ := Parse("Foo.2031.1080p.BluRay.x264-GRP", CurrentYear(2027))
	if before.Year != nil || after.Year == nil || *after.Year != "2031" {
		t.Error("currentYear does not bound the accepted years")
	}

	defaults := Release{Flags: []string{"COLLECTION", "PROPER"}}
	Parse("Foo.S01E01.720p.HDTV.x264-GRP", CurrentYear(2026), Defaults(defaults))
	if !slices.Equal(defaults.Flags, []string{"COLLECTION", "PROPER"}) {
		t.Errorf("parse writes into the defaults it is given: %q", defaults.Flags)
	}

	for _, name := range []string{"Show.S01E1-10000.720p", "Show.E1-99999999999999999999.720p"} {
		if _, err := Parse(name, CurrentYear(2026)); err == nil || !strings.HasSuffix(err.Error(), "more than 9999 episodes") {
			t.Errorf("%s gives %v", name, err)
		}
	}
	if r, err := Parse("Show.S01E1-9999.720p", CurrentYear(2026)); err != nil || len(r.Episodes) != 9999 {
		t.Errorf("an episode range of 9999 episodes gives %v", err)
	}

	if _, err := Parse(strings.Repeat("a", 1025)); err == nil || err.Error() != "name of 1025 characters: more than 1024 characters" {
		t.Errorf("a name of 1025 characters gives %v", err)
	}
	if _, err := Parse(strings.Repeat("a", 1024), CurrentYear(2026)); err != nil {
		t.Errorf("a name of 1024 characters gives %v", err)
	}

	if _, err := Parse("Foo Bar", Strict(true)); err == nil || err.Error() != `"Foo Bar" does't follow scene release naming rules` {
		t.Errorf("strict gives %v", err)
	}

	if r, _ := Parse("Foo.2010.1080p.BluRay.x264.DTS-GRP", CurrentYear(2026), Flagged(false)); r.Generated != "Foo.2010.1080p.BLURAY.x264-GRP" {
		t.Errorf("flagged false gives %q", r.Generated)
	}

	if r, _ := Guess("Foo.BluRay.x264-GRP", CurrentYear(2026)); *r.Year != "2026" || *r.Resolution != "1080p" || r.Generated != "Foo.2026.1080p.BLURAY.x264-GRP" {
		t.Errorf("guess gives %s, %s, %q", *r.Year, *r.Resolution, r.Generated)
	}
}

// Expected values are those of packages/js/src/index.js, except U+FFFD: JavaScript keeps the lone surrogate.
func TestJavaScriptStrings(t *testing.T) {
	for _, c := range []struct{ name, title, group, generated string }{
		{"Kelvin\u212a1080p.BluRay.x264-GRP", "Kelvin", "GRP", "Kelvin.1080p.BLURAY.x264-GRP"},
		{"Film.2010.1080p.WEB.x264-\u0130stanbul", "Film", "stanbul", "Film.2010.1080p.WEB-DL.x264-stanbul"},
		{"Foo.S01\U0001f600E01.720p.HDTV.x264-GRP", "Foo S01\ufffd", "GRP", "Foo.S01\ufffd.E01.720p.HDTV.x264-GRP"},
		{"Foo.2010.mkv\u2028a\u2028b", "Foo", "mkv", "Foo.2010-mkv"},
	} {
		r, err := Parse(c.name, CurrentYear(2026))
		if err != nil || r.Title != c.title || r.Group == nil || *r.Group != c.group || r.Generated != c.generated {
			t.Errorf("%+q gives %+q, %v, %+q, %v", c.name, r.Title, r.Group, r.Generated, err)
		}
	}
}
