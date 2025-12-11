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
    <div class="p-8 pt-8 relative max-[768px]:p-6 max-[640px]:p-4 max-[640px]:pt-4">
      <h2 class="mb-4 text-[#c9d1d9] text-sm font-semibold">Export Colorscheme</h2>
      <p class="text-[#8b949e] text-xs mb-8 leading-relaxed">
        Export your colorscheme as JSON and use it with the Chromatic CLI tool to configure your
        applications automatically.
      </p>
      <div class="flex gap-4 mb-8 max-[640px]:flex-col">
        <button
          onClick={handleExport}
          class="flex-1 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded px-4 py-3 cursor-pointer text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
        >
          Download JSON
        </button>
        <button
          onClick={handleCopy}
          class={`flex-1 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded px-4 py-3 cursor-pointer text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5 ${
            copiedJson()
              ? "bg-[#58a6ff] text-white border-[#58a6ff] hover:bg-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_20px_rgba(88,166,255,0.4),0_4px_12px_rgba(88,166,255,0.2)]"
              : ""
          }`}
        >
          {copiedJson() ? "Copied!" : "Copy JSON"}
        </button>
      </div>
      <div class="flex items-center text-center my-8 text-[#8b949e] text-xs before:content-[''] before:flex-1 before:border-b before:border-[#30363d] after:content-[''] after:flex-1 after:border-b after:border-[#30363d]">
        <span class="px-4">or</span>
      </div>
      <div>
        <h2 class="mb-4 text-[#c9d1d9] text-sm font-semibold">Chromatic CLI</h2>
        <p class="text-[#8b949e] text-xs mb-4 leading-relaxed">
          Use the Chromatic CLI tool to configure your applications automatically. Make sure you
          have it installed somewhere. Download it from the{" "}
          <a
            href="https://github.com/xlc-dev/chromatic/releases"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#58a6ff] no-underline transition-colors duration-200 hover:text-[#79c0ff] hover:underline"
          >
            GitHub releases page
          </a>
          .
        </p>
        <div class="bg-[#0d1117] border border-[#30363d] rounded px-5 py-5 flex items-center justify-between gap-4">
          <code class="text-[#58a6ff] font-mono text-sm flex-1">
            chromatic colorscheme.json --all
          </code>
          <button
            onClick={handleCopyCommand}
            class={`bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded px-3 py-1.5 cursor-pointer text-xs font-medium transition-all duration-200 font-mono hover:bg-[#30363d] hover:border-[#58a6ff] hover:text-[#58a6ff] ${
              copiedCommand()
                ? "bg-[#58a6ff] text-white border-[#58a6ff] hover:bg-[#58a6ff] hover:border-[#58a6ff]"
                : ""
            }`}
            title="Copy command"
          >
            {copiedCommand() ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
