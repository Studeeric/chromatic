import { createSignal } from "solid-js";
import type { ColorScheme } from "../types";

interface ExportJSONProps {
  scheme: ColorScheme;
}

export default function ExportJSON(props: ExportJSONProps) {
  const [copiedJson, setCopiedJson] = createSignal(false);
  const [copiedCommand, setCopiedCommand] = createSignal(false);

  const handleExport = () => {
    const json = JSON.stringify(props.scheme, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "colorscheme.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const json = JSON.stringify(props.scheme, null, 2);
    await navigator.clipboard.writeText(json);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1200);
  };

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText("chromatic colorscheme.json --all");
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 1200);
  };

  return (
    <div class="export-json">
      <h2>Export Colorscheme</h2>
      <p class="export-description">
        Export your colorscheme as JSON and use it with the Chromatic CLI tool to configure your
        applications automatically.
      </p>
      <div class="export-json-actions">
        <button onClick={handleExport} class="export-btn">
          Download JSON
        </button>
        <button onClick={handleCopy} class={`copy-btn ${copiedJson() ? "copied" : ""}`}>
          {copiedJson() ? "Copied!" : "Copy JSON"}
        </button>
      </div>
      <div class="cli-divider"></div>
      <div class="cli-section">
        <h2>Chromatic CLI</h2>
        <p class="cli-install-note">
          Use the Chromatic CLI tool to configure your applications automatically. Make sure you
          have it installed somewhere. Download it from the{" "}
          <a
            href="https://github.com/xlc-dev/chromatic/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub releases page
          </a>
          .
        </p>
        <div class="cli-example">
          <code>chromatic colorscheme.json --all</code>
          <button
            onClick={handleCopyCommand}
            class={`copy-command-btn ${copiedCommand() ? "copied" : ""}`}
            title="Copy command"
          >
            {copiedCommand() ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
