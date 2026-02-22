import { useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { useAuth } from '../lib/auth';
import { getProfile, upsertProfile, type UserProfile } from '../server/profile';
import { DASHBOARD } from '../content/dashboard';
import type { UnitSystem } from '../lib/units';
import { kgToLbs, lbsToKg, cmToFtIn, ftInToCm } from '../lib/units';

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
  const [weight, setWeight] = useState('');          // display units (lbs or kg)
  const [heightCm, setHeightCm] = useState('');      // metric height
  const [heightFt, setHeightFt] = useState('');       // imperial feet
  const [heightIn, setHeightIn] = useState('');       // imperial inches
  const [restingHr, setRestingHr] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [saunaType, setSaunaType] = useState<UserProfile['saunaType']>(null);
  const [rltEnabled, setRltEnabled] = useState(true);
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [equipmentMode, setEquipmentMode] = useState<'pulse' | 'other' | null>(null);

  /** Convert DB-metric profile values to the current display units */
  const populateForm = useCallback((p: UserProfile) => {
    const sys = p.unitPreference;
    setUnits(sys);
    setGender(p.gender);
    setAge(p.age != null ? String(p.age) : '');
    // Weight
    if (p.weightKg != null) {
      setWeight(sys === 'imperial' ? String(kgToLbs(p.weightKg)) : String(p.weightKg));
    } else {
      setWeight('');
    }
    // Height
    if (p.heightCm != null) {
      if (sys === 'imperial') {
        const { ft, inches } = cmToFtIn(p.heightCm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      } else {
        setHeightCm(String(p.heightCm));
      }
    } else {
      setHeightCm('');
      setHeightFt('');
      setHeightIn('');
    }
    setRestingHr(p.restingHr != null ? String(p.restingHr) : '');
    setBodyFatPct(p.bodyFatPct != null ? String(p.bodyFatPct) : '');
    setSaunaType(p.saunaType);
    setRltEnabled(p.rltEnabled);
    // Pulse Sauna = finnish + rlt; otherwise custom ("other")
    if (p.saunaType === 'finnish' && p.rltEnabled) {
      setEquipmentMode('pulse');
    } else if (p.saunaType != null) {
      setEquipmentMode('other');
    } else {
      setEquipmentMode(null);
    }
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

  /** Switch units and re-convert the existing weight / height values */
  const handleUnitChange = (next: UnitSystem) => {
    if (next === units) return;
    // Convert weight
    const rawW = parseNum(weight);
    if (rawW != null) {
      setWeight(
        next === 'imperial'
          ? String(kgToLbs(rawW))   // was kg → now lbs
          : String(lbsToKg(rawW)),  // was lbs → now kg
      );
    }
    // Convert height
    if (next === 'imperial') {
      const cm = parseNum(heightCm);
      if (cm != null) {
        const { ft, inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      }
    } else {
      const ft = parseNum(heightFt);
      const inches = parseNum(heightIn);
      if (ft != null) {
        setHeightCm(String(ftInToCm(ft, inches ?? 0)));
      }
    }
    setUnits(next);
  };

  // Save handler — always convert back to metric for DB storage
  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    setToast(null);
    try {
      // Convert display weight → kg
      const rawWeight = parseNum(weight);
      const weightKg = rawWeight != null && units === 'imperial' ? lbsToKg(rawWeight) : rawWeight;

      // Convert display height → cm
      let heightCmVal: number | null;
      if (units === 'imperial') {
        const ft = parseNum(heightFt);
        const inches = parseNum(heightIn);
        heightCmVal = ft != null ? ftInToCm(ft, inches ?? 0) : null;
      } else {
        heightCmVal = parseNum(heightCm);
      }

      const updated: UserProfile = {
        gender,
        age: parseNum(age),
        weightKg,
        heightCm: heightCmVal,
        restingHr: parseNum(restingHr),
        bodyFatPct: parseNum(bodyFatPct),
        saunaType,
        rltEnabled,
        rltPanel: profile?.rltPanel ?? null,
        unitPreference: units,
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
        {/* Units toggle */}
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="profile-units">{DASHBOARD.profileUnitsLabel}</FieldLabel>
          <div id="profile-units" className="mt-1.5 flex gap-2">
            <Pill label={DASHBOARD.profileUnitsImperial} active={units === 'imperial'} onClick={() => handleUnitChange('imperial')} />
            <Pill label={DASHBOARD.profileUnitsMetric} active={units === 'metric'} onClick={() => handleUnitChange('metric')} />
          </div>
        </div>

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
          <FieldLabel htmlFor="profile-weight">
            {units === 'imperial' ? DASHBOARD.profileWeightLabelImperial : DASHBOARD.profileWeightLabel}
          </FieldLabel>
          <FieldInput
            id="profile-weight"
            type="number"
            placeholder={units === 'imperial' ? DASHBOARD.profileWeightPlaceholderImperial : DASHBOARD.profileWeightPlaceholder}
            value={weight}
            onChange={setWeight}
            min="1"
            max={units === 'imperial' ? '1540' : '699'}
            step="0.1"
          />
        </div>

        {/* Height */}
        <div>
          <FieldLabel htmlFor="profile-height">
            {units === 'imperial' ? DASHBOARD.profileHeightLabelImperial : DASHBOARD.profileHeightLabel}
          </FieldLabel>
          {units === 'imperial' ? (
            <div className="mt-1 flex gap-2">
              <FieldInput id="profile-height" type="number" placeholder={DASHBOARD.profileHeightFtPlaceholder} value={heightFt} onChange={setHeightFt} min="0" max="9" />
              <FieldInput id="profile-height-in" type="number" placeholder={DASHBOARD.profileHeightInPlaceholder} value={heightIn} onChange={setHeightIn} min="0" max="11" />
            </div>
          ) : (
            <FieldInput id="profile-height" type="number" placeholder={DASHBOARD.profileHeightPlaceholder} value={heightCm} onChange={setHeightCm} min="1" max="299" step="0.1" />
          )}
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

        {/* ── Equipment preset (mirrors mobile first-run) ── */}
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="profile-equipment">{DASHBOARD.profileEquipmentLabel}</FieldLabel>
          <div id="profile-equipment" className="mt-2 grid gap-3 sm:grid-cols-2">
            {/* Pulse Sauna card */}
            <button
              type="button"
              onClick={() => { setSaunaType('finnish'); setRltEnabled(true); setEquipmentMode('pulse'); }}
              className={`rounded-xl border p-4 text-left transition-colors ${
                equipmentMode === 'pulse'
                  ? 'border-heat bg-heat-subtle'
                  : 'border-edge bg-canvas hover:border-fg-subtle'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <div>
                  <span className={`text-sm font-semibold ${equipmentMode === 'pulse' ? 'text-fg' : 'text-fg-muted'}`}>{DASHBOARD.profilePresetPulse}</span>
                  <span className="ml-1.5 text-xs text-fg-subtle">{DASHBOARD.profilePresetPulseBy}</span>
                </div>
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-fg-muted">
                <li>{DASHBOARD.profilePresetPulseSpec1}</li>
                <li>{DASHBOARD.profilePresetPulseSpec2}</li>
              </ul>
            </button>

            {/* Other Sauna card */}
            <button
              type="button"
              onClick={() => setEquipmentMode('other')}
              className={`rounded-xl border p-4 text-left transition-colors ${
                equipmentMode === 'other'
                  ? 'border-heat bg-heat-subtle'
                  : 'border-edge bg-canvas hover:border-fg-subtle'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <div>
                  <span className={`text-sm font-semibold ${equipmentMode === 'other' ? 'text-fg' : 'text-fg-muted'}`}>{DASHBOARD.profilePresetOther}</span>
                  <span className="ml-1.5 text-xs text-fg-subtle">{DASHBOARD.profilePresetOtherBy}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── "Other" expanded: sauna type + RLT ── */}
        {equipmentMode === 'other' && (
          <>
            <div>
              <FieldLabel htmlFor="profile-sauna">{DASHBOARD.profileSaunaTypeLabel}</FieldLabel>
              <div id="profile-sauna" className="mt-1.5 flex gap-2">
                <Pill label={DASHBOARD.profileSaunaFinnish} active={saunaType === 'finnish'} onClick={() => setSaunaType('finnish')} />
                <Pill label={DASHBOARD.profileSaunaInfrared} active={saunaType === 'infrared'} onClick={() => setSaunaType('infrared')} />
                <Pill label={DASHBOARD.profileSaunaSteam} active={saunaType === 'steam'} onClick={() => setSaunaType('steam')} />
              </div>
            </div>

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
          </>
        )}
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
