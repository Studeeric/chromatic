interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function ToggleSwitch(props: ToggleSwitchProps) {
  const handleChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    props.onChange(target.checked);
  };

  return (
    <label class="toggle-switch">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={handleChange}
        class="toggle-switch-input"
      />
      <span class={`toggle-switch-slider ${props.checked ? "checked" : ""}`}>
        <span class="toggle-switch-thumb"></span>
      </span>
      {props.label && <span class="toggle-switch-label">{props.label}</span>}
    </label>
  );
}
