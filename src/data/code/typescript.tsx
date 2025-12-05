// @ts-nocheck
import { createSignal, createEffect } from "solid-js";
import type { ColorScheme } from "./types";

interface AppProps {
  initialScheme?: ColorScheme;
}

export default function App(props: AppProps) {
  const [scheme, setScheme] = createSignal<ColorScheme>(props.initialScheme ?? defaultColorScheme);

  createEffect(() => {
    localStorage.setItem("scheme", JSON.stringify(scheme()));
  });

  return (
    <div class="app">
      <Preview scheme={scheme()} />
    </div>
  );
}
