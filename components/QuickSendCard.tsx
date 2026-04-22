'use client';
import React, { useState } from 'react';

interface QuickSendProps {
    sku: string;
    onClose: () => void;
}

export default function QuickSendCard({ sku, onClose }: QuickSendProps) {
    const [qty, setQty] = useState(1);
    const [nota, setNota] = useState('');

    const enviarWA = () => {
        const msg = `Olá Motta Brindes! Tenho interesse no produto:\n📌 Código: ${sku}\nQuant: ${qty}\nObs: ${nota}`;
        window.open(`https://wa.me/5535998869018?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="absolute bottom-2 md:bottom-14 left-1/2 -translate-x-1/2 w-[92%] bg-[#1a1a1a]/95 backdrop-blur-md border border-[#2f9c94] rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 z-50">
            <div className="p-3 relative">
                {/* Botón Cerrar */}
                <button onClick={onClose} className="absolute top-1 right-2 text-[#666] hover:text-white transition-colors text-xl font-bold">×</button>

                {/* Fila de controles: Ahora con espacio real */}
                <div className="flex items-end justify-between gap-2 mb-3 mt-4">

                    {/* Cantidad (QTDE) */}
                    <div className="flex flex-col items-center min-w-[55px]">
                        <span className="text-white/50 text-[8px] font-bold mb-1 uppercase tracking-tighter">Qtde.</span>
                        <input
                            type="number"
                            value={qty === 0 ? '' : qty}
                            onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
                            onFocus={(e) => e.target.select()}
                            className="bg-[#2d2d2d] border border-[#444] text-white w-full text-center py-2 rounded-lg text-xs font-bold outline-none focus:border-[#2f9c94]"
                        />
                    </div>

                    {/* Botón ENVIAR: Con logo blanco y texto que ahora sí cabe */}
                    <button
                        onClick={enviarWA}
                        className="bg-[#25D366] text-white flex-1 py-2 px-3 rounded-full text-[10px] font-black flex items-center justify-center gap-2 hover:bg-[#1ebe57] transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 448 512">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 480l117.7-30.9c32.4 17.7 68.9 27 103.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.2-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.6 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                        ENVIAR
                    </button>
                </div>

                {/* Nota */}
                <textarea
                    value={nota} onChange={(e) => setNota(e.target.value)}
                    placeholder="Escreva sua observação aqui..."
                    className="w-full bg-[#2d2d2d] p-3 text-white text-[10px] outline-none resize-none h-14 sm:h-16 md:h-24 rounded-xl border border-[#333] focus:border-[#2f9c94] transition-all placeholder:text-white/20"
                />
            </div>
        </div>
    );
}