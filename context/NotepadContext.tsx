'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PedidoItem {
    sku: string;
    qty: number;
    nota: string;
}

interface NotepadContextType {
    agenda: PedidoItem[];
    isOpen: boolean;
    addItem: (sku: string) => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, fields: Partial<PedidoItem>) => void;
    openNotepad: () => void;
    closeNotepad: () => void;
    toggleNotepad: () => void;
}

const NotepadContext = createContext<NotepadContextType | null>(null);

export function NotepadProvider({ children }: { children: React.ReactNode }) {
    const [agenda, setAgenda] = useState<PedidoItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Cargar desde localStorage solo en el cliente
    useEffect(() => {
        const saved = localStorage.getItem('motta_agenda_pro');
        if (saved) {
            try {
                setAgenda(JSON.parse(saved));
            } catch {
                // corrupted data, ignore
            }
        }
    }, []);

    // Persistir en localStorage cuando cambie la agenda
    useEffect(() => {
        localStorage.setItem('motta_agenda_pro', JSON.stringify(agenda));
    }, [agenda]);

    const addItem = useCallback((sku: string) => {
        const cleaned = sku.trim().toUpperCase();
        if (!cleaned) return;
        setAgenda(prev => {
            // Evitar duplicados — si ya existe, solo incrementar qty
            const exists = prev.findIndex(i => i.sku === cleaned);
            if (exists !== -1) {
                const updated = [...prev];
                updated[exists] = { ...updated[exists], qty: updated[exists].qty + 1 };
                return updated;
            }
            return [...prev, { sku: cleaned, qty: 1, nota: '' }];
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setAgenda(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateItem = useCallback((index: number, fields: Partial<PedidoItem>) => {
        setAgenda(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...fields };
            return updated;
        });
    }, []);

    const openNotepad = useCallback(() => setIsOpen(true), []);
    const closeNotepad = useCallback(() => setIsOpen(false), []);
    const toggleNotepad = useCallback(() => setIsOpen(prev => !prev), []);

    return (
        <NotepadContext.Provider value={{
            agenda, isOpen,
            addItem, removeItem, updateItem,
            openNotepad, closeNotepad, toggleNotepad,
        }}>
            {children}
        </NotepadContext.Provider>
    );
}

export function useNotepad() {
    const ctx = useContext(NotepadContext);
    if (!ctx) throw new Error('useNotepad must be used within NotepadProvider');
    return ctx;
}
