import { Show, createSignal } from "solid-js";
import { setSkipConfirmation, type ConfirmationAction } from "../utils/confirmation";
import ToggleSwitch from "./ToggleSwitch";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  storageKey?: ConfirmationAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const [dontAskAgain, setDontAskAgain] = createSignal(false);

  const handleConfirm = () => {
    if (props.storageKey && dontAskAgain()) {
      setSkipConfirmation(props.storageKey, true);
    }
    props.onConfirm();
    setDontAskAgain(false);
  };

  const handleCancel = () => {
    setDontAskAgain(false);
    props.onCancel();
  };

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
        onClick={handleCancel}
      >
        <div
          class="bg-[#161b22] rounded-lg p-8 border border-[#30363d] max-w-[400px] w-[90%] relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-[640px]:w-[95%] max-[640px]:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 class="text-sm font-semibold text-[#c9d1d9] mb-4">{props.title}</h3>
          <p class="text-[#8b949e] mb-6 leading-relaxed">{props.message}</p>
          {props.storageKey && (
            <div class="flex items-center gap-3 mb-6 cursor-pointer text-[#8b949e] text-sm select-none">
              <ToggleSwitch
                checked={dontAskAgain()}
                onChange={setDontAskAgain}
                label="Don't ask again"
              />
            </div>
          )}
          <div class="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              class="px-5 py-2 rounded border border-[#30363d] cursor-pointer text-xs font-medium bg-[#21262d] text-[#c9d1d9] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
            >
              {props.cancelText || "Cancel"}
            </button>
            <button
              onClick={handleConfirm}
              class="px-5 py-2 rounded border border-[#30363d] cursor-pointer text-xs font-medium bg-[#21262d] text-[#c9d1d9] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
            >
              {props.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
