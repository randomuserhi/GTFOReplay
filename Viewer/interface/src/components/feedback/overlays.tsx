import { appendLog } from "../../logs";
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { t } from '../../i18n';
import { FileDialog } from '../dialogs/FileDialog';

const manager = Toast.createToastManager();
export function notify(message: string, type: 'error' | 'success' | 'info' | 'warning' = 'error') {
    if (!message) return;
    appendLog(type === "error" ? "error" : type === "warning" ? "warn" : "info", message);
    manager.add({ id: `${type}:${message}`, description: message, type, timeout: type === 'error' ? 9000 : 4500, priority: type === 'error' ? 'high' : 'low' });
}
function Notifications() {
    const { toasts } = Toast.useToastManager();
    return <Toast.Portal><Toast.Viewport className="replay-interface toast-viewport">{toasts.map(toast => <Toast.Root key={toast.id} toast={toast} className="toast" data-kind={toast.type}>
        {toast.type === 'error' ? <CircleAlert size={19} /> : toast.type === 'success' ? <CheckCircle2 size={19} /> : <Info size={19} />}
        <Toast.Content><Toast.Description /></Toast.Content><Toast.Close aria-label={t('close')}><X size={16} /></Toast.Close>
    </Toast.Root>)}</Toast.Viewport></Toast.Portal>;
}
// RHU and React share one tooltip host, so profile controls use the same delay,
// placement and keyboard behavior without mounting a React root per tooltip.
function Tooltips() {
    const [tip, setTip] = useState<{ text: string; x: number; y: number; below: boolean }>();
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>, target: HTMLElement | null = null;
        const hide = () => { clearTimeout(timer); target?.removeAttribute('aria-describedby'); target = null; setTip(undefined); };
        const show = (event: Event) => {
            const next = (event.target as Element)?.closest<HTMLElement>('[data-tooltip]');
            if (next === target) return;
            hide(); if (!next || !next.dataset.tooltip) return;
            target = next;
            timer = setTimeout(() => {
                if (!next.isConnected) return;
                const r = next.getBoundingClientRect(); next.setAttribute('aria-describedby', 'replay-tooltip');
                setTip({ text: next.dataset.tooltip!, x: Math.max(160, Math.min(innerWidth - 160, r.left + r.width / 2)), y: r.top > 90 ? r.top - 8 : r.bottom + 8, below: r.top <= 90 });
            }, event.type === 'focusin' ? 100 : 550);
        };
        const leave = (event: Event) => { if (target && event instanceof PointerEvent && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return; hide(); };
        const key = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
        document.addEventListener('pointerover', show); document.addEventListener('focusin', show);
        document.addEventListener('pointerout', leave); document.addEventListener('focusout', hide);
        document.addEventListener('pointerdown', hide); document.addEventListener('keydown', key);
        window.addEventListener('resize', hide); window.addEventListener('scroll', hide, true);
        return () => { hide(); document.removeEventListener('pointerover', show); document.removeEventListener('focusin', show); document.removeEventListener('pointerout', leave); document.removeEventListener('focusout', hide); document.removeEventListener('pointerdown', hide); document.removeEventListener('keydown', key); window.removeEventListener('resize', hide); window.removeEventListener('scroll', hide, true); };
    }, []);
    return tip && <div id="replay-tooltip" role="tooltip" className="replay-interface app-tooltip" style={{ left: tip.x, top: tip.y, transform: tip.below ? 'translateX(-50%)' : 'translate(-50%,-100%)' }}>{tip.text}</div>;
}
function mount() {
    const host = document.createElement('div'); host.id = 'app-overlays'; document.body.append(host);
    createRoot(host).render(<Toast.Provider toastManager={manager} limit={3}><Notifications /><Tooltips /><FileDialog /></Toast.Provider>);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
