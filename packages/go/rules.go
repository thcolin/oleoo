package oleoo

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
)

//go:generate cp ../../rules.json rules.json
//go:embed rules.json
var rulesJSON []byte

// A rule is a pattern, or { pattern, notAfter } when the match must not follow notAfter: it stands in for a lookbehind.
type rule struct {
	pattern  string
	notAfter string
	str      bool
}

func (r *rule) UnmarshalJSON(b []byte) error {
	if len(b) > 0 && b[0] == '"' {
		r.str = true
		return json.Unmarshal(b, &r.pattern)
	}

	var o struct {
		Pattern  string `json:"pattern"`
		NotAfter string `json:"notAfter"`
	}
	err := json.Unmarshal(b, &o)
	r.pattern, r.notAfter = o.Pattern, o.NotAfter
	return err
}

type ruleKey struct {
	key   string
	rules []rule
}

// ruleSet keeps the keys in file order: when several keys match, the last declared one wins.
type ruleSet []ruleKey

func (s *ruleSet) UnmarshalJSON(b []byte) error {
	dec := json.NewDecoder(bytes.NewReader(b))

	if _, err := dec.Token(); err != nil {
		return err
	}

	for dec.More() {
		token, err := dec.Token()
		if err != nil {
			return err
		}

		key, ok := token.(string)
		if !ok {
			return fmt.Errorf("expected a key, got %v", token)
		}

		var rules []rule
		if err := dec.Decode(&rules); err != nil {
			return err
		}
		*s = append(*s, ruleKey{key, rules})
	}

	return nil
}

// entry is a flag of stringify.after*: a flag name, or { flag, dubRelated }.
type entry struct {
	flag       string
	dubRelated bool
	object     bool
}

func (e *entry) UnmarshalJSON(b []byte) error {
	if len(b) > 0 && b[0] == '"' {
		return json.Unmarshal(b, &e.flag)
	}

	var o struct {
		Flag       string `json:"flag"`
		DubRelated bool   `json:"dubRelated"`
	}
	err := json.Unmarshal(b, &o)
	e.flag, e.dubRelated, e.object = o.Flag, o.DubRelated, true
	return err
}

type ruleFile struct {
	Source     ruleSet  `json:"source"`
	Encoding   ruleSet  `json:"encoding"`
	Resolution ruleSet  `json:"resolution"`
	Dub        ruleSet  `json:"dub"`
	Language   ruleSet  `json:"language"`
	Flags      ruleSet  `json:"flags"`
	Erase      []string `json:"erase"`
	Extensions []string `json:"extensions"`
	Ambiguous  struct {
		Flags    []string `json:"flags"`
		Patterns []string `json:"patterns"`
	} `json:"ambiguous"`
	Title struct {
		Uppercase    []string `json:"uppercase"`
		LeadingFlags []string `json:"leadingFlags"`
		Franchises   []string `json:"franchises"`
		LeadingYears []struct {
			Year     string `json:"year"`
			Contains string `json:"contains"`
			Release  string `json:"release"`
		} `json:"leadingYears"`
	} `json:"title"`
	Stringify struct {
		DubRelated      []string `json:"dubRelated"`
		AfterTitle      []entry  `json:"afterTitle"`
		AfterYear       []entry  `json:"afterYear"`
		AfterLanguage   []entry  `json:"afterLanguage"`
		AfterResolution []entry  `json:"afterResolution"`
		AfterSource     []entry  `json:"afterSource"`
		AfterEncoding   []entry  `json:"afterEncoding"`
		AfterDub        []entry  `json:"afterDub"`
	} `json:"stringify"`
}

// A package-level initializer, not init(): the regexes of oleoo.go read the rules when they are declared.
var rules = func() (r ruleFile) {
	if err := json.Unmarshal(rulesJSON, &r); err != nil {
		panic("oleoo: rules.json: " + err.Error())
	}
	return r
}()
