import { For, createSignal, Show, createEffect } from "solid-js";
import type { ColorScheme, ColorSchemeKey } from "../types";
import { colorNames } from "../types";

interface ColorPickerProps {
  scheme: ColorScheme;
  onColorChange: (key: ColorSchemeKey, value: string) => void;
}

const terminalColorNumbers: Record<ColorSchemeKey, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  brightBlack: 8,
  brightRed: 9,
  brightGreen: 10,
  brightYellow: 11,
  brightBlue: 12,
  brightMagenta: 13,
  brightCyan: 14,
  brightWhite: 15,
  background: -1,
  foreground: -1,
  activeBorder: -1,
  inactiveBorder: -1,
  urgentBorder: -1,
};

interface PickerState {
  key: ColorSchemeKey;
  x: number;
  y: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result && result[1] && result[2] && result[3]
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;

  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export default function ColorPicker(props: ColorPickerProps) {
  const [pickerState, setPickerState] = createSignal<PickerState | null>(null);
  const [hsv, setHsv] = createSignal({ h: 0, s: 100, v: 100 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragType, setDragType] = createSignal<"spectrum" | "brightness" | "hue" | null>(null);

  const handleColorClick = (key: ColorSchemeKey, e: MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const popupWidth = 300;
    const estimatedPopupHeight = 450;
    const gap = 10;
    const padding = 20;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const halfPopupWidth = popupWidth / 2;
    const maxPopupHeight = viewportHeight - padding * 2;

    let x = rect.left + rect.width / 2;
    if (x - halfPopupWidth < padding) {
      x = padding + halfPopupWidth;
    } else if (x + halfPopupWidth > viewportWidth - padding) {
      x = viewportWidth - padding - halfPopupWidth;
    }

    let y: number;
    const spaceBelow = viewportHeight - rect.bottom - gap - padding;
    const spaceAbove = rect.top - gap - padding;
    const popupHeight = Math.min(estimatedPopupHeight, maxPopupHeight);

    if (spaceBelow >= popupHeight) {
      y = rect.bottom + gap;
    } else if (spaceAbove >= popupHeight) {
      y = rect.top - popupHeight - gap;
    } else {
      if (spaceBelow > spaceAbove) {
        y = viewportHeight - popupHeight - padding;
      } else {
        y = padding;
      }
    }
    y = Math.max(padding, Math.min(y, viewportHeight - popupHeight - padding));

    const currentHex = props.scheme[key];
    const rgb = hexToRgb(currentHex);
    const hsvValue = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsv({ h: hsvValue.h, s: hsvValue.s * 100, v: hsvValue.v * 100 });

    setPickerState({ key, x, y });
  };

  const updateColor = (newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s / 100, newHsv.v / 100);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const state = pickerState();
    if (state) {
      props.onColorChange(state.key, hex);
    }
  };

  const handleSpectrumClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const current = hsv();
    updateColor({ h: current.h, s: x * 100, v: (1 - y) * 100 });
  };

  const handleHueClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));

    const current = hsv();
    updateColor({ h, s: current.s, v: current.v });
  };

  const handleMouseDown = (type: "spectrum" | "brightness" | "hue") => {
    setIsDragging(true);
    setDragType(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    if (dragType() === "spectrum") {
      const spectrumEl = document.querySelector(".color-spectrum") as HTMLElement;
      if (spectrumEl) {
        const rect = spectrumEl.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const current = hsv();
        updateColor({ h: current.h, s: x * 100, v: (1 - y) * 100 });
      }
    } else if (dragType() === "brightness") {
      const brightnessEl = document.querySelector(".color-brightness") as HTMLElement;
      if (brightnessEl) {
        const rect = brightnessEl.getBoundingClientRect();
        const v = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
        const current = hsv();
        updateColor({ h: current.h, s: current.s, v });
      }
    } else if (dragType() === "hue") {
      const hueEl = document.querySelector(".color-hue") as HTMLElement;
      if (hueEl) {
        const rect = hueEl.getBoundingClientRect();
        const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        const current = hsv();
        updateColor({ h, s: current.s, v: current.v });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  createEffect(() => {
    if (isDragging()) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  const closePicker = () => {
    setPickerState(null);
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePicker();
    }
  };

  const getSpectrumGradient = () => {
    const current = hsv();
    return `linear-gradient(to bottom,
      hsl(${current.h}, 100%, 100%),
      hsl(${current.h}, 100%, 50%),
      hsl(${current.h}, 100%, 0%)
    ),
    linear-gradient(to right,
      hsla(${current.h}, 0%, 50%, 0),
      hsl(${current.h}, 100%, 50%)
    )`;
  };

  const getHueGradient = () => {
    const hues = [];
    for (let i = 0; i <= 360; i += 30) {
      hues.push(`hsl(${i}, 100%, 50%)`);
    }
    return `linear-gradient(to right, ${hues.join(", ")})`;
  };

  return (
    <>
      <div class="color-picker">
        <div class="color-section">
          <h3 class="color-section-title">Terminal Colors</h3>
          <div class="color-grid">
            <For each={colorNames}>
              {(color) => {
                const colorNum = terminalColorNumbers[color.key];
                return (
                  <div
                    class="color-swatch"
                    style={{ "background-color": props.scheme[color.key] }}
                    onClick={(e) => handleColorClick(color.key, e)}
                  >
                    <div class="color-swatch-content">
                      <div class="color-label-row">
                        <span class="color-number">{colorNum}</span>
                        <span class="color-label">{color.label}</span>
                      </div>
                      <span class="color-hex">{props.scheme[color.key]}</span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>

        <div class="color-section">
          <h3 class="color-section-title">Base Colors</h3>
          <div class="color-grid color-grid-special">
            <div
              class="color-swatch color-swatch-special"
              style={{ "background-color": props.scheme.background }}
              onClick={(e) => handleColorClick("background", e)}
            >
              <div class="color-swatch-content">
                <span class="color-label">Background</span>
                <span class="color-hex">{props.scheme.background}</span>
              </div>
            </div>
            <div
              class="color-swatch color-swatch-special"
              style={{ "background-color": props.scheme.foreground }}
              onClick={(e) => handleColorClick("foreground", e)}
            >
              <div class="color-swatch-content">
                <span class="color-label">Foreground</span>
                <span class="color-hex">{props.scheme.foreground}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="color-section">
          <h3 class="color-section-title">Window Borders</h3>
          <div class="color-grid color-grid-border">
            <div
              class="color-swatch color-swatch-border"
              style={{ "background-color": props.scheme.activeBorder }}
              onClick={(e) => handleColorClick("activeBorder", e)}
            >
              <div class="color-swatch-content">
                <span class="color-label">Active</span>
                <span class="color-hex">{props.scheme.activeBorder}</span>
              </div>
            </div>
            <div
              class="color-swatch color-swatch-border"
              style={{ "background-color": props.scheme.inactiveBorder }}
              onClick={(e) => handleColorClick("inactiveBorder", e)}
            >
              <div class="color-swatch-content">
                <span class="color-label">Inactive</span>
                <span class="color-hex">{props.scheme.inactiveBorder}</span>
              </div>
            </div>
            <div
              class="color-swatch color-swatch-border"
              style={{ "background-color": props.scheme.urgentBorder }}
              onClick={(e) => handleColorClick("urgentBorder", e)}
            >
              <div class="color-swatch-content">
                <span class="color-label">Urgent</span>
                <span class="color-hex">{props.scheme.urgentBorder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Show when={pickerState()}>
        {(state) => {
          return (
            <div class="color-picker-backdrop" onClick={handleBackdropClick}>
              <div
                class="color-picker-popup"
                style={{
                  left: `${state().x}px`,
                  top: `${state().y}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div class="color-picker-header">
                  <span class="color-picker-title">Pick Color</span>
                  <button class="color-picker-close" onClick={closePicker}>
                    ×
                  </button>
                </div>
                <div class="color-picker-content">
                  <div class="color-picker-main">
                    <div class="color-picker-spectrum-container">
                      {(() => {
                        const current = hsv();
                        return (
                          <>
                            <div
                              class="color-spectrum"
                              style={{ background: getSpectrumGradient() }}
                              onClick={handleSpectrumClick}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown("spectrum");
                              }}
                            >
                              <div
                                class="color-spectrum-marker"
                                style={{
                                  left: `${current.s}%`,
                                  top: `${100 - current.v}%`,
                                }}
                              />
                            </div>
                            <div
                              class="color-hue"
                              style={{ background: getHueGradient() }}
                              onClick={handleHueClick}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown("hue");
                              }}
                            >
                              <div
                                class="color-hue-marker"
                                style={{
                                  left: `${(current.h / 360) * 100}%`,
                                }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div class="color-picker-inputs">
                    {(() => {
                      const current = hsv();
                      const rgb = hsvToRgb(current.h, current.s / 100, current.v / 100);
                      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                      return (
                        <>
                          <div class="color-picker-preview" style={{ "background-color": hex }} />
                          <div class="color-picker-hex">
                            <label>Hex:</label>
                            <div class="color-picker-hex-wrapper">
                              <span class="color-picker-hex-prefix">#</span>
                              <input
                                type="text"
                                value={hex.substring(1)}
                                onInput={(e) => {
                                  let value = e.currentTarget.value;
                                  value = value.replace(/[^0-9A-Fa-f]/g, "");
                                  if (value.length > 6) {
                                    value = value.substring(0, 6);
                                  }
                                  e.currentTarget.value = value;

                                  if (/^[0-9A-Fa-f]{6}$/.test(value)) {
                                    const fullHex = "#" + value;
                                    const rgbVal = hexToRgb(fullHex);
                                    const hsvValue = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b);
                                    setHsv({
                                      h: hsvValue.h,
                                      s: hsvValue.s * 100,
                                      v: hsvValue.v * 100,
                                    });
                                    props.onColorChange(state().key, fullHex);
                                  }
                                }}
                                class="color-picker-hex-input"
                              />
                            </div>
                          </div>
                          <div class="color-picker-rgb">
                            <div class="color-picker-rgb-item">
                              <label>R:</label>
                              <div class="color-picker-number-input">
                                <input
                                  type="text"
                                  value={rgb.r}
                                  onInput={(e) => {
                                    let value = e.currentTarget.value.replace(/[^0-9]/g, "");
                                    if (value === "") {
                                      value = "0";
                                    }
                                    const r = Math.max(0, Math.min(255, parseInt(value) || 0));
                                    const newRgb = { r, g: rgb.g, b: rgb.b };
                                    const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                    setHsv({
                                      h: hsvValue.h,
                                      s: hsvValue.s * 100,
                                      v: hsvValue.v * 100,
                                    });
                                    props.onColorChange(
                                      state().key,
                                      rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const r = Math.max(
                                      0,
                                      Math.min(255, parseInt(e.currentTarget.value) || 0)
                                    );
                                    e.currentTarget.value = r.toString();
                                  }}
                                  class="color-picker-rgb-input"
                                />
                                <div class="color-picker-number-buttons">
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const r = Math.min(255, rgb.r + 1);
                                      const newRgb = { r, g: rgb.g, b: rgb.b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const r = Math.max(0, rgb.r - 1);
                                      const newRgb = { r, g: rgb.g, b: rgb.b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div class="color-picker-rgb-item">
                              <label>G:</label>
                              <div class="color-picker-number-input">
                                <input
                                  type="text"
                                  value={rgb.g}
                                  onInput={(e) => {
                                    let value = e.currentTarget.value.replace(/[^0-9]/g, "");
                                    if (value === "") {
                                      value = "0";
                                    }
                                    const g = Math.max(0, Math.min(255, parseInt(value) || 0));
                                    const newRgb = { r: rgb.r, g, b: rgb.b };
                                    const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                    setHsv({
                                      h: hsvValue.h,
                                      s: hsvValue.s * 100,
                                      v: hsvValue.v * 100,
                                    });
                                    props.onColorChange(
                                      state().key,
                                      rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const g = Math.max(
                                      0,
                                      Math.min(255, parseInt(e.currentTarget.value) || 0)
                                    );
                                    e.currentTarget.value = g.toString();
                                  }}
                                  class="color-picker-rgb-input"
                                />
                                <div class="color-picker-number-buttons">
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const g = Math.min(255, rgb.g + 1);
                                      const newRgb = { r: rgb.r, g, b: rgb.b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const g = Math.max(0, rgb.g - 1);
                                      const newRgb = { r: rgb.r, g, b: rgb.b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div class="color-picker-rgb-item">
                              <label>B:</label>
                              <div class="color-picker-number-input">
                                <input
                                  type="text"
                                  value={rgb.b}
                                  onInput={(e) => {
                                    let value = e.currentTarget.value.replace(/[^0-9]/g, "");
                                    if (value === "") {
                                      value = "0";
                                    }
                                    const b = Math.max(0, Math.min(255, parseInt(value) || 0));
                                    const newRgb = { r: rgb.r, g: rgb.g, b };
                                    const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                    setHsv({
                                      h: hsvValue.h,
                                      s: hsvValue.s * 100,
                                      v: hsvValue.v * 100,
                                    });
                                    props.onColorChange(
                                      state().key,
                                      rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const b = Math.max(
                                      0,
                                      Math.min(255, parseInt(e.currentTarget.value) || 0)
                                    );
                                    e.currentTarget.value = b.toString();
                                  }}
                                  class="color-picker-rgb-input"
                                />
                                <div class="color-picker-number-buttons">
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const b = Math.min(255, rgb.b + 1);
                                      const newRgb = { r: rgb.r, g: rgb.g, b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    class="color-picker-number-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const b = Math.max(0, rgb.b - 1);
                                      const newRgb = { r: rgb.r, g: rgb.g, b };
                                      const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                                      setHsv({
                                        h: hsvValue.h,
                                        s: hsvValue.s * 100,
                                        v: hsvValue.v * 100,
                                      });
                                      props.onColorChange(
                                        state().key,
                                        rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                                      );
                                    }}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Show>
    </>
  );
}
