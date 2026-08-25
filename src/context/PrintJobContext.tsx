import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AuditLogEntry, MerchantProfile, OperationalSettings, PrintJob } from '../types';
import { defaultLogs, defaultMerchantProfile, defaultSettings, demoJobs } from '../data/defaults';

type Ctx = {
  profile: MerchantProfile;
  settings: OperationalSettings;
  jobs: PrintJob[];
  logs: AuditLogEntry[];
  updateProfile: (profile: MerchantProfile) => void;
  updateSettings: (settings: OperationalSettings) => void;
  addJob: (job: Omit<PrintJob, 'id' | 'createdAt' | 'status' | 'progress'>) => PrintJob;
  updateJobStatus: (id: string, status: PrintJob['status']) => void;
  qrUrl: string;
};

const Context = createContext<Ctx | undefined>(undefined);
const keys = { profile: 'qrprint.profile.v2', settings: 'qrprint.settings.v2', jobs: 'qrprint.jobs.v2', logs: 'qrprint.logs.v2' };

function load<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

export function PrintJobProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(() => load(keys.profile, defaultMerchantProfile));
  const [settings, setSettings] = useState(() => load(keys.settings, defaultSettings));
  const [jobs, setJobs] = useState(() => load(keys.jobs, demoJobs));
  const [logs, setLogs] = useState(() => load(keys.logs, defaultLogs));

  useEffect(() => localStorage.setItem(keys.profile, JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem(keys.settings, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(keys.jobs, JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem(keys.logs, JSON.stringify(logs)), [logs]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', settings.accentColor);
    root.classList.toggle('dark', settings.theme === 'dark' || (settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches));
  }, [settings]);

  const appendLog = (message: string, level: AuditLogEntry['level'] = 'info') => {
    setLogs(prev => [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), level, message }, ...prev].slice(0, 200));
  };

  const value = useMemo<Ctx>(() => ({
    profile,
    settings,
    jobs,
    logs,
    updateProfile: (next) => { setProfile(next); appendLog(`Merchant profile updated for ${next.shopName}.`); },
    updateSettings: (next) => { setSettings(next); appendLog('Operational settings updated from merchant web interface.'); },
    addJob: (job) => {
      const created: PrintJob = { ...job, id: `QP-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: new Date().toISOString(), status: 'queued', progress: 0 };
      setJobs(prev => [created, ...prev]);
      appendLog(`New customer job ${created.id} queued without merchant file browsing.`);
      return created;
    },
    updateJobStatus: (id, status) => { setJobs(prev => prev.map(job => job.id === id ? { ...job, status, progress: status === 'completed' ? 100 : job.progress } : job)); appendLog(`Job ${id} moved to ${status}.`); },
    qrUrl: `http://127.0.0.1:${profile.port}/customer`,
  }), [profile, settings, jobs, logs]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePrintJob() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('usePrintJob must be used within PrintJobProvider');
  return ctx;
}
