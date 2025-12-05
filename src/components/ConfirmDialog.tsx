interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

import { Show } from "solid-js";

export default function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Show when={props.open}>
      <div class="dialog-overlay" onClick={props.onCancel}>
        <div class="dialog" onClick={(e) => e.stopPropagation()}>
          <h3 class="dialog-title">{props.title}</h3>
          <p class="dialog-message">{props.message}</p>
          <div class="dialog-actions">
            <button onClick={props.onCancel} class="dialog-btn dialog-btn-cancel">
              {props.cancelText || "Cancel"}
            </button>
            <button onClick={props.onConfirm} class="dialog-btn dialog-btn-confirm">
              {props.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
