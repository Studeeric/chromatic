# @ts-nocheck
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class ColorScheme:
    background: str
    foreground: str
    red: str
    green: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "background": self.background,
            "foreground": self.foreground,
        }

def create_default_scheme() -> ColorScheme:
    return ColorScheme(
        background="#0c0c0c",
        foreground="#cccccc"
    )
