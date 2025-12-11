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
    <label class="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={handleChange}
        class="absolute opacity-0 w-0 h-0"
      />
      <span
        class={`relative w-11 h-6 bg-[#21262d] border border-[#30363d] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#58a6ff33] before:to-[#bc8cff33] before:opacity-0 before:transition-opacity before:duration-300 ${
          props.checked
            ? "bg-[#58a6ff] border-[#58a6ff] shadow-[0_0_12px_rgba(88,166,255,0.4)] before:opacity-100"
            : ""
        } hover:border-[#58a6ff] hover:shadow-[0_0_8px_rgba(88,166,255,0.2)] ${
          props.checked ? "hover:shadow-[0_0_16px_rgba(88,166,255,0.6)] hover:scale-105" : ""
        }`}
      >
        <span
          class={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-[#c9d1d9] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${
            props.checked
              ? "left-[calc(100%-20px)] bg-white shadow-[0_2px_8px_rgba(88,166,255,0.5)]"
              : ""
          }`}
        ></span>
      </span>
      {props.label && (
        <span class="text-[#8b949e] text-sm transition-colors duration-200 group-hover:text-[#c9d1d9]">
          {props.label}
        </span>
      )}
    </label>
  );
}
