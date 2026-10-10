"use client";
import { useActionState, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { saveProfileAction, changePasswordAction } from "../actions/portalActions";
import type { HospitalProfile, SettingsState } from "../types/hospitalPortal";

const initial: SettingsState = {};
function Result({ state }: { state: SettingsState }) {
  return state.message ? <p role={state.success ? "status" : "alert"} className={`rounded-xl p-3 text-sm ${state.success ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{state.message}{state.fieldErrors?.non_field_errors && ` ${state.fieldErrors.non_field_errors}`}</p> : null;
}
function PasswordSettings() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const [values, setValues] = useState({ current_password: "", new_password: "", confirm_password: "" });
  return <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold">Change password</h2><p className="mt-1 text-sm text-muted">Confirm your current password to update your credentials. You will be signed out after saving.</p>
    <form action={action} noValidate className="mt-5 space-y-4"><Result state={state} />
      {(["current_password", "new_password", "confirm_password"] as const).map((name) => <TextField key={name} name={name} label={{ current_password: "Current password", new_password: "New password", confirm_password: "Confirm new password" }[name]} type="password" autoComplete={name === "current_password" ? "current-password" : "new-password"} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} error={state.fieldErrors?.[name]} disabled={pending} maxLength={128} />)}
      <Button type="submit" isLoading={pending}>Update password</Button>
    </form></Card>;
}
export function HospitalSettings({ profile }: { profile: HospitalProfile }) {
  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [values, setValues] = useState(profile);
  const [state, action, pending] = useActionState(saveProfileAction, initial);
  const fields = [
    ["name", "Hospital / clinic name"], ["email", "Sign-in email"], ["telephone", "Contact telephone"],
    ["website", "Website"], ["address", "Address"], ["state", "State"], ["district", "District"], ["pincode", "Pincode"],
  ] as const;
  return <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
    <div><div role="tablist" aria-label="Hospital settings" className="mb-5 flex gap-1 rounded-xl border border-line bg-surface p-1">
      {(["profile", "security"] as const).map((name) => <button key={name} type="button" role="tab" id={`settings-${name}`} aria-controls={`panel-${name}`} aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "profile" : event.key === "End" ? "security" : tab === "profile" ? "security" : "profile"; setTab(next); document.getElementById(`settings-${next}`)?.focus(); } }} onClick={() => setTab(name)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand ${tab === name ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas"}`}>{name === "profile" ? "Hospital profile" : "Security & credentials"}</button>)}
    </div>
    <div id="panel-profile" role="tabpanel" aria-labelledby="settings-profile" hidden={tab !== "profile"}>
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold">Hospital details</h2><p className="mt-1 text-sm text-muted">Keep your information accurate for patients and your care team.</p>
        <form action={action} noValidate className="mt-5 space-y-5"><Result state={state} /><div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label]) => <TextField key={name} label={label} name={name} type={name === "email" ? "email" : name === "telephone" ? "tel" : "text"} autoComplete={name === "email" ? "email" : undefined} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} error={state.fieldErrors?.[name]} disabled={pending} maxLength={name === "name" || name === "telephone" ? 255 : name === "email" ? 254 : name === "address" ? 2000 : name === "website" ? 500 : name === "pincode" ? 20 : 100} />)}
          <div className="flex flex-col gap-1.5"><label htmlFor="hospital-category" className="text-sm font-medium">Category</label><select id="hospital-category" name="category" value={values.category} onChange={(event) => setValues({ ...values, category: event.target.value as HospitalProfile["category"] })} disabled={pending} aria-invalid={!!state.fieldErrors?.category} className="h-11 rounded-lg border border-line bg-surface px-3 text-sm focus:outline-brand"><option>Hospital</option><option>Clinic</option></select>{state.fieldErrors?.category && <p className="text-sm text-danger">{state.fieldErrors.category}</p>}</div>
        </div><div className="flex justify-end border-t border-line pt-4"><Button type="submit" isLoading={pending}>Save changes</Button></div></form>
      </Card>
    </div>
    <div id="panel-security" role="tabpanel" aria-labelledby="settings-security" hidden={tab !== "security"}><PasswordSettings /></div>
    </div>
    <aside><Card className="bg-brand-soft/50 p-6"><div className="mb-4 grid size-12 place-items-center rounded-xl bg-surface text-xl font-semibold text-brand">{profile.name.slice(0, 1)}</div><h2 className="break-words font-semibold">{profile.name}</h2><p className="mt-1 text-sm text-muted">{profile.category} account</p><p className="mt-4 break-all text-sm text-brand">{profile.email}</p><p className="mt-5 border-t border-brand/10 pt-4 text-xs leading-5 text-muted">Profile changes update your public hospital directory entry. Your sign-in email can be edited here; your password is managed under Security & credentials.</p></Card></aside>
  </div>;
}
