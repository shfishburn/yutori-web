import { useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { useAuth } from '../lib/auth';
import { getProfile, upsertProfile, type UserProfile } from '../server/profile';
import { DASHBOARD } from '../content/dashboard';

/* ── Tiny helpers ──────────────────────────────────────────────── */

function parseNum(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/* ── Reusable field wrappers ───────────────────────────────────── */

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-widest text-fg-subtle"
    >
      {children}
    </label>
  );
}

function FieldInput({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      inputMode={type === 'number' ? 'decimal' : undefined}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className="mt-1 w-full rounded-lg border border-edge bg-canvas px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    />
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-heat text-accent-fg'
          : 'border border-edge bg-canvas text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  );
}

/* ── ProfileEditor ─────────────────────────────────────────────── */

export function ProfileEditor() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Local form state (strings for inputs)
  const [gender, setGender] = useState<UserProfile['gender']>(null);
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [restingHr, setRestingHr] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [saunaType, setSaunaType] = useState<UserProfile['saunaType']>(null);
  const [rltEnabled, setRltEnabled] = useState(true);

  const populateForm = useCallback((p: UserProfile) => {
    setGender(p.gender);
    setAge(p.age != null ? String(p.age) : '');
    setWeightKg(p.weightKg != null ? String(p.weightKg) : '');
    setHeightCm(p.heightCm != null ? String(p.heightCm) : '');
    setRestingHr(p.restingHr != null ? String(p.restingHr) : '');
    setBodyFatPct(p.bodyFatPct != null ? String(p.bodyFatPct) : '');
    setSaunaType(p.saunaType);
    setRltEnabled(p.rltEnabled);
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (!session?.accessToken) return;
    let active = true;
    setLoading(true);

    getProfile({ data: { accessToken: session.accessToken } })
      .then((p) => {
        if (!active) return;
        setProfile(p);
        populateForm(p);
      })
      .catch(() => {
        if (active) setToast({ type: 'err', msg: DASHBOARD.profileLoadError });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [session?.accessToken, populateForm]);

  // Save handler
  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    setToast(null);
    try {
      const updated: UserProfile = {
        gender,
        age: parseNum(age),
        weightKg: parseNum(weightKg),
        heightCm: parseNum(heightCm),
        restingHr: parseNum(restingHr),
        bodyFatPct: parseNum(bodyFatPct),
        saunaType,
        rltEnabled,
        rltPanel: profile?.rltPanel ?? null,
      };
      const saved = await upsertProfile({
        data: { accessToken: session.accessToken, profile: updated },
      });
      setProfile(saved);
      populateForm(saved);
      setToast({ type: 'ok', msg: DASHBOARD.profileSaved });
    } catch {
      setToast({ type: 'err', msg: DASHBOARD.profileSaveError });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-32 rounded-full bg-edge" />
        <div className="h-10 rounded-lg bg-edge" />
        <div className="h-10 rounded-lg bg-edge" />
        <div className="h-10 rounded-lg bg-edge" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Icon name="user" className="h-6 w-6 text-fg-muted" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-bold text-fg">{DASHBOARD.profileHeading}</h2>
          <p className="mt-1 text-sm text-fg-muted">{DASHBOARD.profileDescription}</p>
        </div>
      </div>

      {/* Toast */}
      {toast ? (
        <div
          className={`mt-4 rounded-xl px-4 py-2 text-sm font-medium ${
            toast.type === 'ok'
              ? 'border border-success-border bg-success-subtle text-success'
              : 'border border-danger-border bg-danger-subtle text-danger'
          }`}
        >
          {toast.msg}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Gender */}
        <div>
          <FieldLabel htmlFor="profile-gender">{DASHBOARD.profileGenderLabel}</FieldLabel>
          <div id="profile-gender" className="mt-1.5 flex gap-2">
            <Pill label={DASHBOARD.profileGenderMale} active={gender === 'male'} onClick={() => setGender('male')} />
            <Pill label={DASHBOARD.profileGenderFemale} active={gender === 'female'} onClick={() => setGender('female')} />
            <Pill label={DASHBOARD.profileGenderOther} active={gender === 'other'} onClick={() => setGender('other')} />
          </div>
        </div>

        {/* Age */}
        <div>
          <FieldLabel htmlFor="profile-age">{DASHBOARD.profileAgeLabel}</FieldLabel>
          <FieldInput id="profile-age" type="number" placeholder={DASHBOARD.profileAgePlaceholder} value={age} onChange={setAge} min="1" max="199" />
        </div>

        {/* Weight */}
        <div>
          <FieldLabel htmlFor="profile-weight">{DASHBOARD.profileWeightLabel}</FieldLabel>
          <FieldInput id="profile-weight" type="number" placeholder={DASHBOARD.profileWeightPlaceholder} value={weightKg} onChange={setWeightKg} min="1" max="699" step="0.1" />
        </div>

        {/* Height */}
        <div>
          <FieldLabel htmlFor="profile-height">{DASHBOARD.profileHeightLabel}</FieldLabel>
          <FieldInput id="profile-height" type="number" placeholder={DASHBOARD.profileHeightPlaceholder} value={heightCm} onChange={setHeightCm} min="1" max="299" step="0.1" />
        </div>

        {/* Resting HR */}
        <div>
          <FieldLabel htmlFor="profile-hr">{DASHBOARD.profileRestingHrLabel}</FieldLabel>
          <FieldInput id="profile-hr" type="number" placeholder={DASHBOARD.profileRestingHrPlaceholder} value={restingHr} onChange={setRestingHr} min="21" max="249" />
        </div>

        {/* Body fat */}
        <div>
          <FieldLabel htmlFor="profile-fat">{DASHBOARD.profileBodyFatLabel}</FieldLabel>
          <FieldInput id="profile-fat" type="number" placeholder={DASHBOARD.profileBodyFatPlaceholder} value={bodyFatPct} onChange={setBodyFatPct} min="0" max="100" step="0.1" />
        </div>

        {/* Sauna type */}
        <div>
          <FieldLabel htmlFor="profile-sauna">{DASHBOARD.profileSaunaTypeLabel}</FieldLabel>
          <div id="profile-sauna" className="mt-1.5 flex gap-2">
            <Pill label={DASHBOARD.profileSaunaFinnish} active={saunaType === 'finnish'} onClick={() => setSaunaType('finnish')} />
            <Pill label={DASHBOARD.profileSaunaInfrared} active={saunaType === 'infrared'} onClick={() => setSaunaType('infrared')} />
            <Pill label={DASHBOARD.profileSaunaSteam} active={saunaType === 'steam'} onClick={() => setSaunaType('steam')} />
          </div>
        </div>

        {/* RLT toggle */}
        <div>
          <FieldLabel htmlFor="profile-rlt">{DASHBOARD.profileRltEnabledLabel}</FieldLabel>
          <div className="mt-1.5 flex items-center gap-3">
            <button
              id="profile-rlt"
              type="button"
              role="switch"
              aria-checked={rltEnabled}
              onClick={() => setRltEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface ${
                rltEnabled ? 'bg-heat' : 'bg-edge'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                  rltEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-fg-muted">{DASHBOARD.profileRltEnabledDescription}</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-heat px-6 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? DASHBOARD.profileSaving : DASHBOARD.profileSave}
        </button>
      </div>
    </div>
  );
}
