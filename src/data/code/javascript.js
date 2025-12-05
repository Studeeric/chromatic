// @ts-nocheck
import { createSignal } from "solid-js";

function createColorScheme(name, colors) {
  return {
    name,
    ...colors,
    createdAt: new Date()
  };
}

function App() {
  const [scheme, setScheme] = createSignal(defaultColorScheme);

  const handleColorChange = (key, value) => {
    setScheme(prev => ({ ...prev, [key]: value }));
  };

  return <Preview scheme={scheme()} />;
}
