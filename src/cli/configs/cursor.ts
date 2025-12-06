import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { writeTheme } from "./vscode";

export function configureCursor(scheme: ColorScheme): void {
  // Cursor uses the same theme format as VSCode, stored as an extension
  const extensionDir = join(homedir(), ".cursor", "extensions", "chromatic-color-theme");
  writeTheme(scheme, extensionDir, "Cursor");
}
