// @ts-nocheck
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ColorScheme {
    pub background: String,
    pub foreground: String,
    pub red: String,
}

impl ColorScheme {
    pub fn new() -> Self {
        Self {
            background: "#0c0c0c".to_string(),
            foreground: "#cccccc".to_string(),
            red: "#cd3131".to_string(),
        }
    }

    pub fn to_hashmap(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        map.insert("background".to_string(), self.background.clone());
        map
    }
}
