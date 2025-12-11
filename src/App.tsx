import { createSignal, createEffect, onMount } from "solid-js";
import type { ColorScheme, ColorSchemeKey } from "./types";
import { defaultColorScheme, COLOR_SCHEME_KEYS } from "./types";
import ColorPicker from "./components/ColorPicker";
import Preview from "./components/Preview";
import ExportJSON from "./components/ExportJSON";
import ImportJSON from "./components/ImportJSON";
import ConfirmDialog from "./components/ConfirmDialog";
import PresetSelector from "./components/PresetSelector";
import { processImageFile } from "./utils/imageProcessor";
import { shouldSkipConfirmation } from "./utils/confirmation";

const BASE_URL = import.meta.env["BASE_URL"];
const faviconUrl = `${BASE_URL}favicon.svg`;

const STORAGE_KEY = "chromatic-colorscheme";

const getInitialScheme = (): ColorScheme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const hasAllKeys = COLOR_SCHEME_KEYS.every((key) => key in parsed);
      if (hasAllKeys) {
        return parsed as ColorScheme;
      }
    }
  } catch (e) {
    console.error("Failed to load colorscheme from localStorage:", e);
  }
  return defaultColorScheme;
};

export default function App() {
  const [scheme, setScheme] = createSignal<ColorScheme>(getInitialScheme());
  const [showResetDialog, setShowResetDialog] = createSignal(false);
  const [showImageExtractDialog, setShowImageExtractDialog] = createSignal(false);
  const [imageExtracting, setImageExtracting] = createSignal(false);
  let imageInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    const currentScheme = scheme();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScheme));
    } catch (e) {
      console.error("Failed to save colorscheme to localStorage:", e);
    }
  });

  const getInitialTab = (): "preview" | "export" => {
    const saved = localStorage.getItem("chromatic-active-tab");
    return saved === "preview" || saved === "export" ? saved : "preview";
  };

  const [activeTab, setActiveTab] = createSignal<"preview" | "export">(getInitialTab());
  let tabGroupRef: HTMLDivElement | undefined;
  let previewTabRef: HTMLButtonElement | undefined;
  let exportTabRef: HTMLButtonElement | undefined;

  const updateTabIndicator = () => {
    if (!tabGroupRef || !previewTabRef || !exportTabRef) return;

    const activeButton = activeTab() === "preview" ? previewTabRef : exportTabRef;
    const buttonRect = activeButton.getBoundingClientRect();
    const groupRect = tabGroupRef.getBoundingClientRect();

    const width = buttonRect.width;
    let left = buttonRect.left - groupRect.left;

    const groupStyle = window.getComputedStyle(tabGroupRef);
    const paddingLeft = parseFloat(groupStyle.paddingLeft) || 4;
    const paddingRight = parseFloat(groupStyle.paddingRight) || 4;

    left = Math.max(paddingLeft, left);
    const maxWidth = groupRect.width - left - paddingRight;
    const clampedWidth = Math.min(width, maxWidth);

    tabGroupRef.style.setProperty("--indicator-width", `${clampedWidth}px`);
    tabGroupRef.style.setProperty("--indicator-left", `${left}px`);
  };

  createEffect(() => {
    activeTab();
    requestAnimationFrame(() => {
      requestAnimationFrame(updateTabIndicator);
    });
  });

  onMount(() => {
    updateTabIndicator();
    window.addEventListener("resize", updateTabIndicator);
    return () => window.removeEventListener("resize", updateTabIndicator);
  });

  const handleTabChange = (tab: "preview" | "export") => {
    setActiveTab(tab);
    localStorage.setItem("chromatic-active-tab", tab);
  };

  const handleColorChange = (key: ColorSchemeKey, value: string) => {
    setScheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetClick = () => {
    if (shouldSkipConfirmation("reset")) {
      setScheme(defaultColorScheme);
    } else {
      setShowResetDialog(true);
    }
  };

  const handleResetConfirm = () => {
    setScheme(defaultColorScheme);
    setShowResetDialog(false);
  };

  const handleImport = (importedScheme: ColorScheme) => {
    setScheme(importedScheme);
    handleTabChange("preview");
  };

  const handleImageExtractClick = () => {
    if (shouldSkipConfirmation("image")) {
      if (imageInputRef) {
        imageInputRef.click();
      }
    } else {
      setShowImageExtractDialog(true);
    }
  };

  const handleImageExtractConfirm = () => {
    setShowImageExtractDialog(false);
    if (imageInputRef) {
      imageInputRef.click();
    }
  };

  const handleImageFileSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    setImageExtracting(true);
    try {
      const colorScheme = await processImageFile(file);
      setScheme(colorScheme);
      handleTabChange("preview");
    } catch (error) {
      console.error("Failed to extract colors from image:", error);
      alert(error instanceof Error ? error.message : "Failed to extract colors from image.");
    } finally {
      setImageExtracting(false);
      if (target) {
        target.value = "";
      }
    }
  };

  return (
    <div class="font-mono bg-[#0d1117] text-[#c9d1d9] min-h-screen leading-relaxed flex flex-col">
      <header class="bg-[#161b22] py-4 border-b border-[#30363d]">
        <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-between gap-8 relative flex-wrap max-[1024px]:px-6 max-[1024px]:gap-4 max-[768px]:px-4 max-[768px]:gap-3 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-4">
          <div class="flex items-center gap-3 max-[640px]:justify-center">
            <img src={faviconUrl} alt="Chromatic" class="w-8 h-8" />
            <h1 class="text-xl font-semibold bg-gradient-to-r from-[#58a6ff] via-[#bc8cff] via-[#f85149] via-[#3fb950] to-[#58a6ff] bg-[length:200%_100%] bg-clip-text text-transparent animate-chromatic-shift tracking-wide">
              Chromatic
            </h1>
          </div>
          <div
            class="inline-flex absolute left-1/2 -translate-x-1/2 bg-[#0d1117] border border-[#30363d] rounded-md p-1 gap-0 flex-wrap justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-[1024px]:order-3 max-[1024px]:w-auto max-[1024px]:max-w-full max-[1024px]:relative max-[1024px]:left-auto max-[1024px]:translate-x-0 max-[1024px]:mt-2 max-[1024px]:mx-auto max-[640px]:order-2 max-[640px]:w-auto max-[640px]:max-w-full max-[640px]:relative max-[640px]:left-auto max-[640px]:translate-x-0 max-[640px]:mx-auto"
            data-active={activeTab()}
            ref={tabGroupRef}
            style={{
              "--indicator-left": "0.25rem",
              "--indicator-width": "100px",
            }}
          >
            <div
              class="absolute top-1 bottom-1 rounded transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] z-0 pointer-events-none bg-gradient-to-br from-[rgba(88,166,255,0.2)] to-[rgba(88,166,255,0.1)] border border-[rgba(88,166,255,0.4)] shadow-[0_0_20px_rgba(88,166,255,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                left: "var(--indicator-left, 0.25rem)",
                width: "var(--indicator-width, 100px)",
                "max-width": "calc(100% - 0.5rem)",
              }}
            />
            <button
              ref={previewTabRef}
              class={`bg-transparent border-0 py-2 px-4 text-[#8b949e] text-sm font-medium cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded relative z-[1] whitespace-nowrap flex items-center justify-center leading-none min-h-[44px] touch-manipulation ${
                activeTab() === "preview"
                  ? "text-[#58a6ff] [text-shadow:0_0_8px_rgba(88,166,255,0.5)]"
                  : "hover:text-[#c9d1d9]"
              }`}
              onClick={() => handleTabChange("preview")}
            >
              Color Palette
            </button>
            <button
              ref={exportTabRef}
              class={`bg-transparent border-0 py-2 px-4 text-[#8b949e] text-sm font-medium cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded relative z-[1] whitespace-nowrap flex items-center justify-center leading-none min-h-[44px] touch-manipulation ${
                activeTab() === "export"
                  ? "text-[#58a6ff] [text-shadow:0_0_8px_rgba(88,166,255,0.5)]"
                  : "hover:text-[#c9d1d9]"
              }`}
              onClick={() => handleTabChange("export")}
            >
              Export
            </button>
          </div>
          <div class="flex gap-4 items-center max-[640px]:order-3 max-[640px]:w-full max-[640px]:justify-center">
            <PresetSelector onSelect={setScheme} />
            <button
              onClick={handleImageExtractClick}
              class={`bg-[#21262d] rounded px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden border border-[#30363d] text-[#c9d1d9] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                imageExtracting() ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={imageExtracting()}
            >
              {imageExtracting() ? "Extracting..." : "Extract from Image"}
            </button>
            <input
              ref={imageInputRef}
              id="image-extract-input"
              type="file"
              accept="image/*"
              onChange={handleImageFileSelected}
              disabled={imageExtracting()}
              style="display: none;"
            />
            <button
              onClick={handleResetClick}
              class="bg-[#21262d] rounded px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden border border-[#30363d] text-[#c9d1d9] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </header>
      <main class="flex-1 grid grid-cols-2 gap-8 p-8 max-w-[1600px] mx-auto w-full box-border max-[1400px]:p-6 max-[1400px]:gap-6 max-[1200px]:p-5 max-[1200px]:gap-5 max-[1024px]:grid-cols-1 max-[1024px]:p-6 max-[1024px]:gap-6 max-[768px]:p-4 max-[768px]:gap-4 max-[640px]:p-3 max-[640px]:gap-3">
        <div class="flex flex-col gap-6">
          <div class="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.3)] max-h-[calc(100vh-200px)] flex flex-col overflow-y-auto relative scrollbar-custom max-[1024px]:max-h-[calc(100vh-250px)] max-[768px]:max-h-[calc(100vh-220px)]">
            {activeTab() === "preview" ? (
              <ColorPicker scheme={scheme()} onColorChange={handleColorChange} />
            ) : (
              <div class="flex flex-col gap-0">
                <ImportJSON onImport={handleImport} />
                <ExportJSON scheme={scheme()} />
              </div>
            )}
          </div>
        </div>
        <div>
          <Preview scheme={scheme()} />
        </div>
      </main>
      <ConfirmDialog
        open={showResetDialog()}
        title="Reset Colorscheme"
        message="Are you sure you want to reset all colors to default? This will discard all your changes."
        confirmText="Reset"
        cancelText="Cancel"
        storageKey="reset"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetDialog(false)}
      />
      <ConfirmDialog
        open={showImageExtractDialog()}
        title="Extract Colors from Image"
        message="This will replace your current colorscheme with colors extracted from the image. All your current changes will be lost."
        confirmText="Continue"
        cancelText="Cancel"
        storageKey="image"
        onConfirm={handleImageExtractConfirm}
        onCancel={() => setShowImageExtractDialog(false)}
      />
    </div>
  );
}
