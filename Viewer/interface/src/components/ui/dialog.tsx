import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { t } from '../../i18n';

export function Modal({ open, onClose, title, description, children, className = '' }: {
    open: boolean; onClose(): void; title: string; description?: string; children: ReactNode; className?: string;
}) {
    return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}>
        <Dialog.Portal><Dialog.Backdrop className="dialog-backdrop" /><Dialog.Popup className={`replay-interface dialog-popup ${className}`}>
            <header className="dialog-header"><div><Dialog.Title>{title}</Dialog.Title>{description && <Dialog.Description>{description}</Dialog.Description>}</div>
                <Button variant="ghost" size="icon" aria-label={t('close')} onClick={onClose}><X /></Button></header>
            {children}
        </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>;
}
