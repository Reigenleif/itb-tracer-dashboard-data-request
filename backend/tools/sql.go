package tools

import (
    "regexp"
)

// isSelectOnly checks that the SQL starts with SELECT or WITH and contains no forbidden statements.
func IsSelectOnly(query string) bool {
    // Allow leading whitespace and comments
    trimmed := regexp.MustCompile(`(?i)^\s*`).ReplaceAllString(query, "")
    // Must start with SELECT or WITH
    match, _ := regexp.MatchString(`(?i)^(WITH|SELECT)`, trimmed)
    if !match {
        return false
    }
    // Disallow semicolons to avoid multiple statements
    if regexp.MustCompile(`;`).MatchString(query) {
        return false
    }
    return true
}