import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { icons } from './App';

let cachedTamuData: any[] | null = null;

export const MobileTamu = ({ onBack, currentUser }: { onBack: () => void, currentUser: any }) => {
  const [data, setData] = useState<any[]>(cachedTamuData || []);
  const isAdminOrPengurus = ['admin', 'developer', 'sekretaris', 'bendahara'].includes(currentUser?.role);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/tamu');
      const json = await res.json();
      cachedTamuData = json.data || [];
      setData(cachedTamuData!);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/api/data/tamu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch(e) { console.error(e); }
  };

  return (
    <div
      className="p-4 pb-24 bg-gray-50 min-h-screen"
    >
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack} 
          className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all"
          aria-label="Kembali ke menu"
        >
          <icons.arrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Buku Tamu</h2>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Daftar Laporan Tamu</h3>
        <div className="space-y-3">
          {data.filter(d => isAdminOrPengurus || d.userId === currentUser?.id).reverse().map(item => (
            <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2 border-b border-gray-50 pb-2">
                <div>
                  <h5 className="text-xs font-bold text-gray-800">{item.namaPelapor}</h5>
                  <p className="text-[10px] text-gray-600 mt-0.5">{item.alamatPelapor}</p>
                </div>
                <span className={`px-2 py-1 rounded border text-[9px] font-bold 
                  ${item.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-100' : 
                    'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {item.status?.toUpperCase() || 'DILAPORKAN'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-650 block font-semibold">Hubungan</span>
                  <span className="font-extrabold text-gray-800">{item.hubunganTamu}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-650 block font-semibold">Jumlah Tamu</span>
                  <span className="font-extrabold text-gray-800">{item.jumlahTamu} Orang</span>
                </div>
                <div className="bg-gray-50 p-2 rounded col-span-2">
                  <span className="text-gray-650 block font-semibold">Waktu Menginap</span>
                  <span className="font-extrabold text-gray-800">{item.waktuMenginap} Hari</span>
                  <span className="text-gray-600 text-[9px] block mt-1 font-semibold">
                    Dilaporkan: {new Date(item.createdAt || Date.now()).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              
              {isAdminOrPengurus && item.status !== 'Selesai' && (
                <div className="flex justify-end gap-2 border-t pt-2 border-gray-50">
                  <button 
                    onClick={() => handleUpdateStatus(item.id, 'Selesai')} 
                    className="px-4 py-2 w-full text-xs bg-green-100 text-green-800 rounded-xl font-bold min-h-[44px] flex items-center justify-center hover:bg-green-200 transition-colors"
                    aria-label={`Tandai selesai laporan tamu ${item.namaPelapor}`}
                  >
                    Tandai Selesai
                  </button>
                </div>
              )}
            </div>
          ))}
          {data.filter(d => isAdminOrPengurus || d.userId === currentUser?.id).length === 0 && (
            <p className="text-xs text-gray-550 text-center py-4 font-semibold">Belum ada laporan tamu.</p>
          )}
        </div>
      </div>
    </div>
  );
};
