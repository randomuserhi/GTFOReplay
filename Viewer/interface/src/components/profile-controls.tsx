import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@base-ui/react/switch';
import { Languages, Radio } from 'lucide-react';
import { Select } from './ui/select';
import { Modal } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import i18n from '../i18n';
import { notify } from './feedback/overlays';

export type SelectProps = Parameters<typeof Select>[0];
type SettingsProps = SelectProps & { content?: HTMLElement };
function SettingsControl({ content, open, onOpenChange, ...profile }: SettingsProps) {
    const { t } = useTranslation();
    const descriptions: Record<string, string> = { vanilla: 'profileVanilla', template: 'profileTemplate', mindcontrol: 'profileMindControl' };
    return <>
        <Modal open={!!open} onClose={() => onOpenChange?.(false)} title={t('settings')} className="app-settings">
            <section className="settings-profile">
                <h2>{t('profile')}</h2>
                <p className="muted">{t('profileHint')}</p>
                <Select {...profile} label={t('profile')} />
                <p>{t(descriptions[profile.value] ?? 'profileCustom')}</p>
                <p className="muted">{t('profileSwitchHint')}</p>
            </section>
            {content ? <div className="settings-display" ref={node => { if (node && content.parentElement !== node) node.replaceChildren(content); }} /> : <p className="settings-profile muted">{t('profileDisplayHint')}</p>}
        </Modal>
    </>;
}
export function mountSettings(element: HTMLElement, props: SettingsProps) {
    const root = createRoot(element);
    const update = (next: SettingsProps) => root.render(<div className="replay-interface control-host"><SettingsControl {...next} /></div>);
    update(props); return { update, unmount: () => root.unmount() };
}
export function mountSelect(element: HTMLElement, props: SelectProps) {
    const root = createRoot(element);
    const update = (next: SelectProps) => root.render(<div className="replay-interface control-host"><Select {...next} /></div>);
    update(props); return { update, unmount: () => root.unmount() };
}
export function mountSwitch(element: HTMLElement, checked: boolean, onChange: (value: boolean) => void, label: string) {
    const root = createRoot(element);
    const update = (value: boolean, text: string) => root.render(<div className="replay-interface control-host"><Switch.Root className="ui-switch" checked={value} onCheckedChange={onChange} aria-label={text}><Switch.Thumb className="ui-switch-thumb" /></Switch.Root></div>);
    update(checked, label); return { update, unmount: () => root.unmount() };
}
function LanguageSelect() {
    const { t } = useTranslation();
    return <Select variant="toolbar" icon={<Languages size={16} aria-hidden="true" />} label={t('language')} value={i18n.language} onChange={value => void i18n.changeLanguage(value)} options={[{ value: 'en', label: 'English' }, { value: 'zh-CN', label: i18n.t('languageName', { lng: 'zh-CN' }) }]} />;
}
export function mountLanguage(element: HTMLElement) { const root = createRoot(element); root.render(<div className="replay-interface control-host"><LanguageSelect /></div>); return () => root.unmount(); }
function Connection({ connect, status }: { connect(id: string): Promise<void>; status: string }) {
    const { t } = useTranslation(); const [open, setOpen] = useState(false), [id, setId] = useState(''), [busy, setBusy] = useState(false);
    return <><Button variant="ghost" onClick={() => setOpen(true)}><Radio />{t('live')}</Button><Modal open={open} onClose={() => setOpen(false)} title={t('live')} description={t('liveHint')}>
        <form className="dialog-content" noValidate onSubmit={e => { e.preventDefault(); if (!/^\d{17}$/.test(id.trim())) { notify(t('invalidSteamId')); return; } setBusy(true); void connect(id.trim()).catch(error => notify(String(error))).finally(() => setBusy(false)); }}>
            <div className="connection-row">
                <label className="setting-field">Steam ID<Input value={id} onChange={e => setId(e.target.value)} autoComplete="off" placeholder="7656…" /></label>
                <p className="connection-status" role="status">{status}</p>
                <Button disabled={busy} type="submit">{t('connect')}</Button>
            </div>
        </form></Modal></>;
}
export function mountConnection(element: HTMLElement, connect: (id: string) => Promise<void>, status: string) {
    const root = createRoot(element); const update = (value: string) => root.render(<div className="replay-interface control-host"><Connection connect={connect} status={value} /></div>);
    update(status); return { update, unmount: () => root.unmount() };
}
