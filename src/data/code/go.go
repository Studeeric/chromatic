// @ts-nocheck
package main

import (
    "encoding/json"
    "fmt"
)

type ColorScheme struct {
    Background string `json:"background"`
    Foreground string `json:"foreground"`
    Red        string `json:"red"`
}

func NewColorScheme() *ColorScheme {
    return &ColorScheme{
        Background: "#0c0c0c",
        Foreground: "#cccccc",
        Red:        "#cd3131",
    }
}

func (cs *ColorScheme) ToJSON() ([]byte, error) {
    return json.Marshal(cs)
}
