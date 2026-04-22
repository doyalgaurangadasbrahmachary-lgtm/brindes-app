'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotepad } from '@/context/NotepadContext';
import { slugify } from '@/utils/slugify';

export default function Notepad() {
    const { agenda, isOpen, closeNotepad, toggleNotepad, removeItem, updateItem } = useNotepad();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState('');
    const { addItem } = useNotepad();
    const router = useRouter();

    const crearTarjeta = () => {
        const sku = inputValue.trim().toUpperCase();
        if (!sku) return;
        addItem(sku);
        setInputValue('');
    };

    const enviarWhatsApp = () => {
        if (agenda.length === 0) return alert('Agenda vazia');
        let mensaje = 'Olá Motta Brindes, gostaria de solicitar um orçamento:\n\n';
        agenda.forEach(item => {
            mensaje += `📌 CÓDIGO: ${item.sku}\n   QTDE: ${item.qty}\n   OBS: ${item.nota || 'Sem observação'}\n\n`;
        });
        window.open(`https://wa.me/5535998869018?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    const jumpToProduct = async (sku: string) => {
        const el = document.getElementById(sku);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    el.classList.add('highlight-product');
                    setTimeout(() => el.classList.remove('highlight-product'), 3000);
                    observer.disconnect();
                }
            }, { rootMargin: "-20% 0px -20% 0px", threshold: 0 }); // Se activa cuando el objeto entra al 60% central de la pantalla
            
            observer.observe(el);
            
            // Failsafe absoluto
            setTimeout(() => {
                el.classList.add('highlight-product');
                setTimeout(() => el.classList.remove('highlight-product'), 3000);
                observer.disconnect();
            }, 1800);
        } else {
            try {
                const res = await fetch(`/api/product?sku=${sku}`);
                if (!res.ok) throw new Error('Produto não localizado no servidor.');
                const product = await res.json();
                if (product && product.tags && product.tags.length > 0) {
                    const slug = slugify(product.tags[0]);
                    router.push(`/categoria/${slug}?target=${sku}`);
                } else {
                    alert('Produto não localizado no catálogo principal.');
                }
            } catch(e) {
                console.error(e);
            }
        }
        closeNotepad();
    };

    return (
        <>
            {/* === BURBUJA FLOTANTE (botón disparador) === */}
            <button
                id="notepad-bubble"
                onClick={toggleNotepad}
                title="Pedido de Orçamento"
                className="fixed bottom-[54px] right-6 z-[998] w-14 h-14 rounded-full bg-[#2f9c94] text-white shadow-2xl flex items-center justify-center hover:bg-[#27847d] transition-all duration-300 hover:scale-110 active:scale-95"

            >
                {/* Badge con contador */}
                {agenda.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff4444] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {agenda.length > 9 ? '9+' : agenda.length}
                    </span>
                )}
                {/* Icono cuaderno */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </button>

            {/* === PANEL FLOTANTE (se despliega sobre la burbuja) === */}
            <div
                id="notepad-panel"
                className={`fixed bottom-24 right-6 z-[997] w-[340px] sm:w-[400px] bg-[#212121] rounded-2xl overflow-hidden border border-[#333] shadow-2xl transition-all duration-300 origin-bottom-right ${isOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                style={{ height: '360px', display: 'flex', flexDirection: 'column' }}
            >
                {/* Header del panel */}
                <div className="bg-[#2a2a2a] p-4 flex justify-between items-center border-b border-[#333] flex-shrink-0">
                    <span className="font-bold text-white text-sm tracking-widest">PEDIDO DE ORÇAMENTO</span>
                    <button
                        id="notepad-close"
                        onClick={closeNotepad}
                        className="text-[#666] hover:text-white transition-colors text-xl leading-none"
                        title="Fechar"
                    >
                        ×
                    </button>
                </div>

                {/* Lista de tarjetas */}
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                    {agenda.length === 0 ? (
                        <p className="text-[#555] text-xs text-center py-8">Nenhum produto adicionado ainda.</p>
                    ) : (
                        agenda.map((item, i) => (
                            <div key={i} className={`bg-[#2d2d2d] rounded-xl border ${item.nota ? 'border-[#2f9c94]' : 'border-[#383838]'} transition-all`}>
                                <div className="p-3 relative">
                                    <button onClick={() => removeItem(i)} className="absolute top-2 right-3 text-[#555] hover:text-red-500 text-lg leading-none">×</button>

                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#2f9c94] font-bold text-base">{item.sku}</span>
                                            <div
                                                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                                                className="flex items-center gap-2 cursor-pointer group"
                                            >
                                                <div className={`w-3 h-3 rounded-sm border border-[#555] flex items-center justify-center text-[8px] ${item.nota ? 'bg-[#25D366] border-[#25D366] text-white' : 'text-transparent'}`}>✔</div>
                                                <span className="text-[#888] text-[10px] font-bold group-hover:text-white uppercase">
                                                    {expandedIndex === i ? 'Fechar Observação' : (item.nota ? 'Ver Observação' : 'Criar Observação')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-white text-[10px] font-bold mb-1">QTDE.</span>
                                                <input
                                                    type="number"
                                                    value={item.qty === 0 ? '' : item.qty}
                                                    onChange={(e) => updateItem(i, { qty: Math.max(0, parseInt(e.target.value) || 0) })}
                                                    onFocus={(e) => e.target.select()}
                                                    className="bg-[#1a1a1a] border border-[#444] text-white w-14 text-center py-1 rounded-md text-sm font-bold outline-none focus:border-[#2f9c94]"
                                                />
                                            </div>
                                            {/* Ver Produto */}
                                            <button 
                                                onClick={() => jumpToProduct(item.sku)}
                                                className="bg-[#2f9c94] text-white px-2 py-2 rounded-lg text-[9px] font-bold uppercase hover:opacity-80 transition-opacity">
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Área nota desplegable */}
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedIndex === i ? 'max-h-40 opacity-100 border-t border-[#333]' : 'max-h-0 opacity-0'}`}>
                                    <textarea
                                        value={item.nota}
                                        onChange={(e) => updateItem(i, { nota: e.target.value })}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-[#1a1a1a] p-3 text-white text-xs outline-none resize-none h-24"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Botón Enviar Orçamento */}
                <div className="p-3 bg-[#2a2a2a] border-t border-[#333] flex-shrink-0">
                    <button
                        onClick={enviarWhatsApp}
                        disabled={agenda.length === 0}
                        className={`w-full flex items-center justify-center gap-3 rounded-lg p-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${agenda.length > 0
                            ? 'bg-[#333] hover:bg-[#25D366] text-white cursor-pointer'
                            : 'bg-[#2a2a2a] text-[#555] cursor-not-allowed'
                            }`}
                    >
                        {/* WhatsApp icon */}
                        <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 448 512">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 480l117.7-30.9c32.4 17.7 68.9 27 103.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.2-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.6 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                        <span>ENVIAR ORÇAMENTO</span>
                        {/* Flecha — siempre verde cuando hay items */}
                        <svg className={`w-4 h-4 fill-current shrink-0 transition-colors ${agenda.length > 0 ? 'text-[#25D366]' : 'text-[#555]'}`} viewBox="0 0 512 512">
                            <path d="M481.508,210.336L68.414,38.926c-17.403-7.222-37.064-4.045-51.309,8.287C2.86,59.547-3.098,78.551,1.558,96.808 L38.327,241h180.026c8.284,0,15.001,6.716,15.001,15.001c0,8.284-6.716,15.001-15.001,15.001H38.327L1.558,415.193 c-4.656,18.258,1.301,37.262,15.547,49.595c14.274,12.357,33.937,15.495,51.31,8.287l413.094-171.409 C500.317,293.862,512,276.364,512,256.001C512,235.638,500.317,218.139,481.508,210.336z" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}