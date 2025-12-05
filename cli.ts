import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createInterface } from "readline";
import { execSync } from "child_process";
import type { ColorScheme } from "./src/types";

interface Config {
  applications?: {
    vim?: boolean;
    foot?: boolean;
    alacritty?: boolean;
    kitty?: boolean;
    xresources?: boolean;
    i3?: boolean;
    sway?: boolean;
    river?: boolean;
  };
}

type FootColorKey =
  | "background"
  | "foreground"
  | "cursor"
  | "regular0"
  | "regular1"
  | "regular2"
  | "regular3"
  | "regular4"
  | "regular5"
  | "regular6"
  | "regular7"
  | "bright0"
  | "bright1"
  | "bright2"
  | "bright3"
  | "bright4"
  | "bright5"
  | "bright6"
  | "bright7";

type ConfigUpdate = {
  pattern: RegExp;
  line: string;
};

function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function readConfigFile(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
}

function writeConfigFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf-8");
}

function updateOrAppendLine(content: string, linePattern: RegExp, newLine: string): string {
  const lines = content.split("\n");
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && linePattern.test(line)) {
      lines[i] = newLine;
      found = true;
      break;
    }
  }

  if (!found) {
    const trimmed = content.trimEnd();
    return trimmed + (trimmed ? "\n" : "") + newLine + "\n";
  }

  return lines.join("\n");
}

function updateConfigFile(
  configPath: string,
  configDir: string | null,
  updates: ConfigUpdate[],
  appName: string,
  preprocess?: (content: string) => string
): void {
  if (configDir) {
    ensureDir(configDir);
  }

  let content = readConfigFile(configPath);

  if (preprocess) {
    content = preprocess(content);
  }

  for (const { pattern, line } of updates) {
    content = updateOrAppendLine(content, pattern, line);
  }

  writeConfigFile(configPath, content);
  console.log(`✓ Configured ${appName}`);
}

function stripHash(hex: string): string {
  return hex.startsWith("#") ? hex.slice(1) : hex;
}

function hexToRiverFormat(hex: string): string {
  const clean = stripHash(hex);
  return `0x${clean}ff`;
}

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

function configureVim(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*let g:terminal_color_0\s*=/m,
      line: `let g:terminal_color_0  = '${scheme.black}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_1\s*=/m,
      line: `let g:terminal_color_1  = '${scheme.red}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_2\s*=/m,
      line: `let g:terminal_color_2  = '${scheme.green}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_3\s*=/m,
      line: `let g:terminal_color_3  = '${scheme.yellow}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_4\s*=/m,
      line: `let g:terminal_color_4  = '${scheme.blue}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_5\s*=/m,
      line: `let g:terminal_color_5  = '${scheme.magenta}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_6\s*=/m,
      line: `let g:terminal_color_6  = '${scheme.cyan}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_7\s*=/m,
      line: `let g:terminal_color_7  = '${scheme.white}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_8\s*=/m,
      line: `let g:terminal_color_8  = '${scheme.brightBlack}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_9\s*=/m,
      line: `let g:terminal_color_9  = '${scheme.brightRed}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_10\s*=/m,
      line: `let g:terminal_color_10 = '${scheme.brightGreen}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_11\s*=/m,
      line: `let g:terminal_color_11 = '${scheme.brightYellow}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_12\s*=/m,
      line: `let g:terminal_color_12 = '${scheme.brightBlue}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_13\s*=/m,
      line: `let g:terminal_color_13 = '${scheme.brightMagenta}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_14\s*=/m,
      line: `let g:terminal_color_14 = '${scheme.brightCyan}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_15\s*=/m,
      line: `let g:terminal_color_15 = '${scheme.brightWhite}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_background\s*=/m,
      line: `let g:terminal_color_background = '${scheme.background}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_foreground\s*=/m,
      line: `let g:terminal_color_foreground = '${scheme.foreground}'`,
    },
  ];

  updateConfigFile(join(homedir(), ".vimrc"), null, updates, "Vim");
}

function configureFoot(scheme: ColorScheme): void {
  const footConfigDir = join(homedir(), ".config", "foot");
  const footConfigPath = join(footConfigDir, "foot.ini");

  ensureDir(footConfigDir);

  const colorMap: Record<FootColorKey, string> = {
    background: stripHash(scheme.background),
    foreground: stripHash(scheme.foreground),
    cursor: `${stripHash(scheme.background)} ${stripHash(scheme.foreground)}`,
    regular0: stripHash(scheme.black),
    regular1: stripHash(scheme.red),
    regular2: stripHash(scheme.green),
    regular3: stripHash(scheme.yellow),
    regular4: stripHash(scheme.blue),
    regular5: stripHash(scheme.magenta),
    regular6: stripHash(scheme.cyan),
    regular7: stripHash(scheme.white),
    bright0: stripHash(scheme.brightBlack),
    bright1: stripHash(scheme.brightRed),
    bright2: stripHash(scheme.brightGreen),
    bright3: stripHash(scheme.brightYellow),
    bright4: stripHash(scheme.brightBlue),
    bright5: stripHash(scheme.brightMagenta),
    bright6: stripHash(scheme.brightCyan),
    bright7: stripHash(scheme.brightWhite),
  };

  let footConfig = readConfigFile(footConfigPath);
  if (footConfig) {
    footConfig = footConfig.replace(
      /(\[colors\][^\n]*\n)([\s\S]*?)(?=\n\[|$)/g,
      (_match, header, sectionContent) => {
        const lines = sectionContent.split("\n");
        const updatedLines = lines.map((line: string) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("#") || trimmed === "") {
            return line;
          }
          const keyMatch = trimmed.match(/^([^=]+)=(.+)$/);
          if (keyMatch && keyMatch[1]) {
            const key = keyMatch[1].trim() as FootColorKey;
            if (key in colorMap) {
              return `${key}=${colorMap[key]}`;
            }
          }
          return line;
        });

        const existingKeys = new Set(
          lines
            .map((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("#") || trimmed === "") return null;
              const keyMatch = trimmed.match(/^([^=]+)=/);
              return keyMatch && keyMatch[1] ? keyMatch[1].trim() : null;
            })
            .filter((key: string | null): key is FootColorKey => key !== null && key in colorMap)
        );

        const missingKeys = Object.keys(colorMap).filter(
          (key): key is FootColorKey => !existingKeys.has(key as FootColorKey)
        );
        const additions =
          missingKeys.length > 0
            ? "\n" + missingKeys.map((key: FootColorKey) => `${key}=${colorMap[key]}`).join("\n")
            : "";

        return header + updatedLines.join("\n") + additions;
      }
    );

    if (!footConfig.includes("[colors]")) {
      const colorsConfig = `[colors]
${Object.entries(colorMap)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;
      footConfig = footConfig + "\n" + colorsConfig;
    }
  } else {
    const colorsConfig = `[colors]
${Object.entries(colorMap)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;
    footConfig = colorsConfig;
  }

  writeConfigFile(footConfigPath, footConfig);
  console.log("✓ Configured Foot");
}

function configureAlacritty(scheme: ColorScheme): void {
  const configDir = join(homedir(), ".config", "alacritty");
  const configPath = join(configDir, "alacritty.toml");

  ensureDir(configDir);
  let config = readConfigFile(configPath);

  if (!config.includes("[colors]")) config += "\n[colors]\n";
  if (!config.includes("[colors.normal]")) config += "\n[colors.normal]\n";
  if (!config.includes("[colors.bright]")) config += "\n[colors.bright]\n";

  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*primary\.background\s*=\s*'[^']+'/m,
      line: `primary.background = '${scheme.background}'`,
    },
    {
      pattern: /^\s*primary\.foreground\s*=\s*'[^']+'/m,
      line: `primary.foreground = '${scheme.foreground}'`,
    },
    { pattern: /^\s*cursor\.text\s*=\s*'[^']+'/m, line: `cursor.text = '${scheme.background}'` },
    {
      pattern: /^\s*cursor\.cursor\s*=\s*'[^']+'/m,
      line: `cursor.cursor = '${scheme.foreground}'`,
    },
  ];

  for (const { pattern, line } of updates) {
    config = updateOrAppendLine(config, pattern, line);
  }

  const normalSectionMatch = config.match(/\[colors\.normal\]([\s\S]*?)(?=\[|$)/);
  if (normalSectionMatch && normalSectionMatch[1]) {
    let normalSection = normalSectionMatch[1];
    const normalUpdates: ConfigUpdate[] = [
      { pattern: /^\s*black\s*=\s*'[^']+'/m, line: `black = '${scheme.black}'` },
      { pattern: /^\s*red\s*=\s*'[^']+'/m, line: `red = '${scheme.red}'` },
      { pattern: /^\s*green\s*=\s*'[^']+'/m, line: `green = '${scheme.green}'` },
      { pattern: /^\s*yellow\s*=\s*'[^']+'/m, line: `yellow = '${scheme.yellow}'` },
      { pattern: /^\s*blue\s*=\s*'[^']+'/m, line: `blue = '${scheme.blue}'` },
      { pattern: /^\s*magenta\s*=\s*'[^']+'/m, line: `magenta = '${scheme.magenta}'` },
      { pattern: /^\s*cyan\s*=\s*'[^']+'/m, line: `cyan = '${scheme.cyan}'` },
      { pattern: /^\s*white\s*=\s*'[^']+'/m, line: `white = '${scheme.white}'` },
    ];
    for (const { pattern, line } of normalUpdates) {
      normalSection = updateOrAppendLine(normalSection, pattern, line);
    }
    config = config.replace(
      /\[colors\.normal\]([\s\S]*?)(?=\[|$)/,
      `[colors.normal]${normalSection}`
    );
  }

  const brightSectionMatch = config.match(/\[colors\.bright\]([\s\S]*?)(?=\[|$)/);
  if (brightSectionMatch && brightSectionMatch[1]) {
    let brightSection = brightSectionMatch[1];
    const brightUpdates: ConfigUpdate[] = [
      { pattern: /^\s*black\s*=\s*'[^']+'/m, line: `black = '${scheme.brightBlack}'` },
      { pattern: /^\s*red\s*=\s*'[^']+'/m, line: `red = '${scheme.brightRed}'` },
      { pattern: /^\s*green\s*=\s*'[^']+'/m, line: `green = '${scheme.brightGreen}'` },
      { pattern: /^\s*yellow\s*=\s*'[^']+'/m, line: `yellow = '${scheme.brightYellow}'` },
      { pattern: /^\s*blue\s*=\s*'[^']+'/m, line: `blue = '${scheme.brightBlue}'` },
      { pattern: /^\s*magenta\s*=\s*'[^']+'/m, line: `magenta = '${scheme.brightMagenta}'` },
      { pattern: /^\s*cyan\s*=\s*'[^']+'/m, line: `cyan = '${scheme.brightCyan}'` },
      { pattern: /^\s*white\s*=\s*'[^']+'/m, line: `white = '${scheme.brightWhite}'` },
    ];
    for (const { pattern, line } of brightUpdates) {
      brightSection = updateOrAppendLine(brightSection, pattern, line);
    }
    config = config.replace(
      /\[colors\.bright\]([\s\S]*?)(?=\[|$)/,
      `[colors.bright]${brightSection}`
    );
  }

  writeConfigFile(configPath, config);
  console.log("✓ Configured Alacritty");
}

function configureKitty(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\s*foreground\s+/m, line: `foreground ${scheme.foreground}` },
    { pattern: /^\s*background\s+/m, line: `background ${scheme.background}` },
    { pattern: /^\s*cursor\s+/m, line: `cursor ${scheme.foreground}` },
    { pattern: /^\s*color0\s+/m, line: `color0 ${scheme.black}` },
    { pattern: /^\s*color1\s+/m, line: `color1 ${scheme.red}` },
    { pattern: /^\s*color2\s+/m, line: `color2 ${scheme.green}` },
    { pattern: /^\s*color3\s+/m, line: `color3 ${scheme.yellow}` },
    { pattern: /^\s*color4\s+/m, line: `color4 ${scheme.blue}` },
    { pattern: /^\s*color5\s+/m, line: `color5 ${scheme.magenta}` },
    { pattern: /^\s*color6\s+/m, line: `color6 ${scheme.cyan}` },
    { pattern: /^\s*color7\s+/m, line: `color7 ${scheme.white}` },
    { pattern: /^\s*color8\s+/m, line: `color8 ${scheme.brightBlack}` },
    { pattern: /^\s*color9\s+/m, line: `color9 ${scheme.brightRed}` },
    { pattern: /^\s*color10\s+/m, line: `color10 ${scheme.brightGreen}` },
    { pattern: /^\s*color11\s+/m, line: `color11 ${scheme.brightYellow}` },
    { pattern: /^\s*color12\s+/m, line: `color12 ${scheme.brightBlue}` },
    { pattern: /^\s*color13\s+/m, line: `color13 ${scheme.brightMagenta}` },
    { pattern: /^\s*color14\s+/m, line: `color14 ${scheme.brightCyan}` },
    { pattern: /^\s*color15\s+/m, line: `color15 ${scheme.brightWhite}` },
  ];

  const configDir = join(homedir(), ".config", "kitty");
  updateConfigFile(join(configDir, "kitty.conf"), configDir, updates, "Kitty");
}

function configureXresources(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\*\.foreground:\s+/m, line: `*.foreground: ${scheme.foreground}` },
    { pattern: /^\*\.background:\s+/m, line: `*.background: ${scheme.background}` },
    { pattern: /^\*\.cursorColor:\s+/m, line: `*.cursorColor: ${scheme.foreground}` },
    { pattern: /^\*\.color0:\s+/m, line: `*.color0: ${scheme.black}` },
    { pattern: /^\*\.color8:\s+/m, line: `*.color8: ${scheme.brightBlack}` },
    { pattern: /^\*\.color1:\s+/m, line: `*.color1: ${scheme.red}` },
    { pattern: /^\*\.color9:\s+/m, line: `*.color9: ${scheme.brightRed}` },
    { pattern: /^\*\.color2:\s+/m, line: `*.color2: ${scheme.green}` },
    { pattern: /^\*\.color10:\s+/m, line: `*.color10: ${scheme.brightGreen}` },
    { pattern: /^\*\.color3:\s+/m, line: `*.color3: ${scheme.yellow}` },
    { pattern: /^\*\.color11:\s+/m, line: `*.color11: ${scheme.brightYellow}` },
    { pattern: /^\*\.color4:\s+/m, line: `*.color4: ${scheme.blue}` },
    { pattern: /^\*\.color12:\s+/m, line: `*.color12: ${scheme.brightBlue}` },
    { pattern: /^\*\.color5:\s+/m, line: `*.color5: ${scheme.magenta}` },
    { pattern: /^\*\.color13:\s+/m, line: `*.color13: ${scheme.brightMagenta}` },
    { pattern: /^\*\.color6:\s+/m, line: `*.color6: ${scheme.cyan}` },
    { pattern: /^\*\.color14:\s+/m, line: `*.color14: ${scheme.brightCyan}` },
    { pattern: /^\*\.color7:\s+/m, line: `*.color7: ${scheme.white}` },
    { pattern: /^\*\.color15:\s+/m, line: `*.color15: ${scheme.brightWhite}` },
  ];

  updateConfigFile(join(homedir(), ".Xresources"), null, updates, "Xresources");
}

function configureWindowManager(scheme: ColorScheme, wmName: "i3" | "sway"): void {
  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*client\.focused\s+/m,
      line: `client.focused ${scheme.activeBorder} ${scheme.activeBorder} ${scheme.activeBorder}`,
    },
    {
      pattern: /^\s*client\.focused_inactive\s+/m,
      line: `client.focused_inactive ${scheme.inactiveBorder} ${scheme.inactiveBorder} ${scheme.inactiveBorder}`,
    },
    {
      pattern: /^\s*client\.unfocused\s+/m,
      line: `client.unfocused ${scheme.inactiveBorder} ${scheme.inactiveBorder} ${scheme.inactiveBorder}`,
    },
    {
      pattern: /^\s*client\.urgent\s+/m,
      line: `client.urgent ${scheme.urgentBorder} ${scheme.urgentBorder} ${scheme.urgentBorder}`,
    },
  ];

  const configDir = join(homedir(), ".config", wmName);
  updateConfigFile(join(configDir, "config"), configDir, updates, wmName);
}

function configureI3(scheme: ColorScheme): void {
  configureWindowManager(scheme, "i3");
}

function configureSway(scheme: ColorScheme): void {
  configureWindowManager(scheme, "sway");
}

function configureRiver(scheme: ColorScheme): void {
  const backgroundColor = hexToRiverFormat(scheme.background);
  const focusedColor = hexToRiverFormat(scheme.activeBorder);
  const unfocusedColor = hexToRiverFormat(scheme.inactiveBorder);
  const urgentColor = hexToRiverFormat(scheme.urgentBorder);

  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*riverctl background-color\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl background-color ${backgroundColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-focused\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-focused ${focusedColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-unfocused\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-unfocused ${unfocusedColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-urgent\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-urgent ${urgentColor}`,
    },
  ];

  const configDir = join(homedir(), ".config", "river");
  updateConfigFile(join(configDir, "init"), configDir, updates, "River");

  try {
    execSync(`riverctl background-color ${backgroundColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-focused ${focusedColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-unfocused ${unfocusedColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-urgent ${urgentColor}`, { stdio: "ignore" });
  } catch (error) {}
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Chromatic CLI - Configure Linux Colorschemes

Usage:
  chromatic <colorscheme.json> [options]

Options:
  --help, -h     Show this help message
  --yes, -y      Skip confirmation prompt
  --all          Configure all supported applications
  --vim          Configure Vim
  --foot         Configure Foot terminal
  --alacritty    Configure Alacritty
  --kitty        Configure Kitty
  --xresources   Configure Xresources
  --i3           Configure i3 window manager borders
  --sway         Configure Sway window manager borders
  --river        Configure River window manager

Examples:
  chromatic colorscheme.json --all
  chromatic colorscheme.json --vim --foot
  chromatic colorscheme.json --foot --yes
  cat colorscheme.json | chromatic -
`);
    process.exit(0);
  }

  const jsonPath = args[0];
  if (!jsonPath) {
    console.error("Error: No colorscheme file provided");
    process.exit(1);
  }
  let jsonContent: string;

  if (jsonPath === "-") {
    jsonContent = readFileSync(0, "utf-8");
  } else {
    jsonContent = readFileSync(jsonPath, "utf-8");
  }

  const data: ColorScheme & Config = JSON.parse(jsonContent);
  const { applications, ...scheme } = data;

  const appFlags = [
    "--vim",
    "--foot",
    "--alacritty",
    "--kitty",
    "--xresources",
    "--i3",
    "--sway",
    "--river",
  ];
  const hasExplicitFlags = args.some((arg) => appFlags.includes(arg));
  const configAll = args.includes("--all") || (!hasExplicitFlags && !applications);
  const shouldConfigure = (flag: string, appFlag?: boolean): boolean =>
    configAll || args.includes(flag) || (appFlag ?? false);

  const configs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--vim", applications?.vim ?? false), () => configureVim(scheme), "Vim"],
    [shouldConfigure("--foot", applications?.foot ?? false), () => configureFoot(scheme), "Foot"],
    [
      shouldConfigure("--alacritty", applications?.alacritty ?? false),
      () => configureAlacritty(scheme),
      "Alacritty",
    ],
    [
      shouldConfigure("--kitty", applications?.kitty ?? false),
      () => configureKitty(scheme),
      "Kitty",
    ],
    [
      shouldConfigure("--xresources", applications?.xresources ?? false),
      () => configureXresources(scheme),
      "Xresources",
    ],
    [shouldConfigure("--i3", applications?.i3 ?? false), () => configureI3(scheme), "i3"],
    [shouldConfigure("--sway", applications?.sway ?? false), () => configureSway(scheme), "Sway"],
    [
      shouldConfigure("--river", applications?.river ?? false),
      () => configureRiver(scheme),
      "River",
    ],
  ];

  const appsToConfigure = configs.filter(([shouldRun]) => shouldRun).map(([, , name]) => name);

  if (appsToConfigure.length === 0) {
    console.log("No applications to configure.");
    process.exit(0);
  }

  const skipConfirmation = args.includes("--yes") || args.includes("-y");

  if (!skipConfirmation) {
    console.log("The following applications will be configured:");
    appsToConfigure.forEach((app) => console.log(`  - ${app}`));
    console.log();

    const confirmed = await promptConfirmation(
      "This will overwrite existing configuration. Continue? (y/N): "
    );
    if (!confirmed) {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  console.log("Configuring colorscheme...\n");
  configs.forEach(([shouldRun, configure]) => shouldRun && configure());

  console.log("\n✓ Colorscheme configured successfully!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
