import { create } from 'zustand';
import { Comparable, SubjectProperty } from '../types';

interface NewCMAState {
  subject: SubjectProperty | null;
  comps: Comparable[];
  clientName: string;
  clientEmail: string;
  setSubject: (subject: SubjectProperty, clientName: string, clientEmail: string) => void;
  setComps: (comps: Comparable[]) => void;
  toggleComp: (id: string) => void;
  updateCompAdjustment: (id: string, adjustment: number, notes?: string) => void;
  reset: () => void;
}

export const useNewCMAStore = create<NewCMAState>((set) => ({
  subject: null,
  comps: [],
  clientName: '',
  clientEmail: '',
  setSubject: (subject, clientName, clientEmail) => set({ subject, clientName, clientEmail }),
  setComps: (comps) => set({ comps }),
  toggleComp: (id) =>
    set((state) => ({
      comps: state.comps.map((c) => (c.id === id ? { ...c, included: !c.included } : c)),
    })),
  updateCompAdjustment: (id, adjustment, notes) =>
    set((state) => ({
      comps: state.comps.map((c) =>
        c.id === id ? { ...c, adjustment, adjustment_notes: notes } : c
      ),
    })),
  reset: () => set({ subject: null, comps: [], clientName: '', clientEmail: '' }),
}));
