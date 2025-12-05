import { createSignal } from "solid-js";
import type { ColorScheme } from "../types";
import { COLOR_SCHEME_KEYS } from "../types";

interface ImportJSONProps {
  onImport: (scheme: ColorScheme) => void;
}

const validateColorScheme = (data: unknown): data is ColorScheme => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return COLOR_SCHEME_KEYS.every(
    (key) => key in data && typeof (data as Record<string, unknown>)[key] === "string"
  );
};

export default function ImportJSON(props: ImportJSONProps) {
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);
  const [jsonText, setJsonText] = createSignal("");

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (validateColorScheme(parsed)) {
        props.onImport(parsed);
        setSuccess(true);
        setJsonText("");
        setTimeout(() => setSuccess(false), 2000);
        target.value = "";
      } else {
        setError("Invalid colorscheme format. Missing required color fields.");
        target.value = "";
      }
    } catch (e) {
      setError("Failed to parse JSON file. Please ensure it's valid JSON.");
      target.value = "";
    }
  };

  const handlePaste = () => {
    setError(null);
    setSuccess(false);

    try {
      const text = jsonText().trim();
      if (!text) {
        setError("Please paste JSON content first.");
        return;
      }

      const parsed = JSON.parse(text);

      if (validateColorScheme(parsed)) {
        props.onImport(parsed);
        setSuccess(true);
        setJsonText("");
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError("Invalid colorscheme format. Missing required color fields.");
      }
    } catch (e) {
      setError("Failed to parse JSON. Please ensure it's valid JSON.");
    }
  };

  const handleTextChange = (value: string) => {
    setJsonText(value);
    setError(null);
    setSuccess(false);
  };

  return (
    <div class="import-json">
      <h2>Import Colorscheme</h2>
      <p class="import-description">
        Import a colorscheme from a JSON file or paste JSON content to load it into the editor.
      </p>

      <div class="import-json-actions">
        <label for="file-upload" class="import-file-btn">
          Upload JSON File
          <input
            id="file-upload"
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            style="display: none;"
          />
        </label>
      </div>

      <div class="import-divider">
        <span>or</span>
      </div>

      <div class="import-paste-section">
        <label for="json-paste" class="import-label">
          Paste JSON:
        </label>
        <textarea
          id="json-paste"
          class="import-textarea"
          placeholder='{"black": "#000000", "red": "#cd3131", ...}'
          value={jsonText()}
          onInput={(e) => handleTextChange(e.currentTarget.value)}
        />
        <button onClick={handlePaste} class={`import-paste-btn ${success() ? "success" : ""}`}>
          {success() ? "Imported!" : "Import from Text"}
        </button>
      </div>

      {error() && <div class="import-error">{error()}</div>}
    </div>
  );
}
