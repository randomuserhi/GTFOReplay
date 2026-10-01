import { Select as Primitive } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export function Select({ label, value, options, onChange, placeholder, disabled, open, onOpenChange, icon, variant = 'field' }: {
    label: string; value: string; options: { value: string; label: string }[];
    onChange(value: string): void; placeholder?: string; disabled?: boolean;
    open?: boolean; onOpenChange?(open: boolean): void;
    icon?: ReactNode;
    variant?: 'field' | 'toolbar';
}) {
    return <Primitive.Root items={options} value={value || null} onValueChange={v => { if (v !== null) onChange(v); }} disabled={disabled}
        open={open} onOpenChange={onOpenChange}>
        <Primitive.Trigger className="ui-select" data-variant={variant} aria-label={label}>{icon}<Primitive.Value className="ui-select-value" placeholder={placeholder ?? label} /><Primitive.Icon><ChevronDown size={15} /></Primitive.Icon></Primitive.Trigger>
        <Primitive.Portal><Primitive.Positioner className="replay-interface select-positioner" sideOffset={6} align="start" alignItemWithTrigger={false}>
            <Primitive.Popup className="select-popup"><Primitive.List>{options.map(option => <Primitive.Item className="select-option" key={option.value} value={option.value}>
                <Primitive.ItemText>{option.label}</Primitive.ItemText><Primitive.ItemIndicator><Check size={15} /></Primitive.ItemIndicator>
            </Primitive.Item>)}</Primitive.List></Primitive.Popup>
        </Primitive.Positioner></Primitive.Portal>
    </Primitive.Root>;
}
