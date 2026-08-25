import React, { FormEvent, useState } from 'react';
import { CheckCircle2, KeyRound, LockKeyhole, Monitor, ShieldCheck, Wifi } from 'lucide-react';
import { usePrintJob } from '../../context/PrintJobContext';

interface MerchantAccessGateProps {
  onAuthenticated: () => void;
}

/** Local-only unlock screen. Production deployments must validate this server-side. */
export const MerchantAccessGate: React.FC<MerchantAccessGateProps> = ({ onAuthenticated }) => {
  const { merchantSettings } = usePrintJob();
  const [shopId, setShopId] = useState(merchantSettings.shopId);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const needsPasscode = merchantSettings.passcodeProtectedDashboard;
    if (shopId.trim() !== merchantSettings.shopId || (needsPasscode && passcode !== merchantSettings.dashboardPasscode)) {
      setError('That shop ID or local access code does not match this installed daemon.');
      return;
    }
    sessionStorage.setItem('printspool-local-unlocked', 'true');
    onAuthenticated();
  };

  return (
    <div className="min-h-[calc(100vh-145px)] bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_.85fr] overflow-hidden rounded-3xl shadow-2xl border border-slate-700 bg-slate-900">
        <section className="p-8 sm:p-12 text-white bg-[radial-gradient(circle_at_top_left,_#4f46e5,_transparent_43%),linear-gradient(135deg,#111827,#020617)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> LOCALHOST ONLY</div>
          <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-lg"><Monitor className="h-7 w-7" /></div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Your shop. Your queue.<br />Your local control room.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Sign in to the merchant console on the computer that runs the PrintSpool daemon. Incoming cloud orders are encrypted, claimed by this shop ID, and released to your local print queue.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3 text-xs">
            {[[LockKeyhole, 'Loopback bound', 'No public dashboard'], [Wifi, 'Polling active', 'Orders every 10 sec'], [ShieldCheck, 'IPP ready', 'Network printer flow']].map(([Icon, title, subtitle]) => { const I = Icon as React.ElementType; return <div key={title as string} className="rounded-xl border border-white/10 bg-white/5 p-3"><I className="h-4 w-4 text-indigo-300" /><p className="mt-3 font-bold">{title as string}</p><p className="mt-1 text-slate-400">{subtitle as string}</p></div>; })}
          </div>
        </section>
        <section className="bg-white p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Merchant verification</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Open local console</h2>
          <p className="mt-2 text-sm text-slate-500">This browser is connected to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">localhost:3000</code>.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm font-bold text-slate-700">Shop ID<input value={shopId} onChange={(e) => setShopId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-mono text-sm outline-none ring-indigo-500 focus:ring-2" autoComplete="username" /></label>
            {merchantSettings.passcodeProtectedDashboard && <label className="block text-sm font-bold text-slate-700">Local access code<input value={passcode} onChange={(e) => setPasscode(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none ring-indigo-500 focus:ring-2" type="password" autoComplete="current-password" /></label>}
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500" type="submit"><KeyRound className="h-4 w-4" /> Verify this shop</button>
          </form>
          <div className="mt-7 flex gap-2 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />Shop ID identifies the endpoint; it is not a password. The local daemon token validates API requests.</div>
        </section>
      </div>
    </div>
  );
};
