export interface ColorScheme {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
  background: string;
  foreground: string;
  activeBorder: string;
  inactiveBorder: string;
  urgentBorder: string;
}

export type ColorSchemeKey = keyof ColorScheme;

export const COLOR_SCHEME_KEYS: ColorSchemeKey[] = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
  "background",
  "foreground",
  "activeBorder",
  "inactiveBorder",
  "urgentBorder",
] as const;

export const defaultColorScheme: ColorScheme = {
  black: "#000000",
  red: "#cd3131",
  green: "#0dbc79",
  yellow: "#e5e510",
  blue: "#2472c8",
  magenta: "#bc3fbc",
  cyan: "#11a8cd",
  white: "#e5e5e5",
  brightBlack: "#666666",
  brightRed: "#f14c4c",
  brightGreen: "#23d18b",
  brightYellow: "#f5f543",
  brightBlue: "#3b8eea",
  brightMagenta: "#d670d6",
  brightCyan: "#29b8db",
  brightWhite: "#e5e5e5",
  background: "#0c0c0c",
  foreground: "#cccccc",
  activeBorder: "#58a6ff",
  inactiveBorder: "#30363d",
  urgentBorder: "#f85149",
};

export interface ColorName {
  key: ColorSchemeKey;
  label: string;
}

export const colorNames: ColorName[] = [
  { key: "black", label: "Black" },
  { key: "red", label: "Red" },
  { key: "green", label: "Green" },
  { key: "yellow", label: "Yellow" },
  { key: "blue", label: "Blue" },
  { key: "magenta", label: "Magenta" },
  { key: "cyan", label: "Cyan" },
  { key: "white", label: "White" },
  { key: "brightBlack", label: "Bright Black" },
  { key: "brightRed", label: "Bright Red" },
  { key: "brightGreen", label: "Bright Green" },
  { key: "brightYellow", label: "Bright Yellow" },
  { key: "brightBlue", label: "Bright Blue" },
  { key: "brightMagenta", label: "Bright Magenta" },
  { key: "brightCyan", label: "Bright Cyan" },
  { key: "brightWhite", label: "Bright White" },
];
