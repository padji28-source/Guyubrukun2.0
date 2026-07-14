import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { AnimatePresence, motion, Reorder } from 'motion/react';
import { MobileDataWarga } from './MobileDataWarga';
import { MobileScanQR } from './MobileScanQR';
import { MobileSuratPengantar } from './MobileSuratPengantar';
import { MobileLaporRT } from './MobileLaporRT';
import { MobileLaporan } from './MobileLaporan';
import { WebSuratOnlinePage } from './components/WebSuratOnlinePage';

import { MobileDarurat } from './MobileDarurat';
import { MobileDokumen } from './MobileDokumen';
import { MobileTamu } from './MobileTamu';
import { MobileVoting } from './MobileVoting';

const MobileVotingNotification = ({ onActionClick, notifications }: { onActionClick: (n: string) => void, notifications: any[] }) => {
  const [activeVotings, setActiveVotings] = useState<any[]>([]);
  
  useEffect(() => {
    apiFetch('/api/voting')
      .then(res => res.json())
      .then(json => {
        const votings = json.data || [];
        setActiveVotings(votings.filter((v: any) => v.status === 'aktif'));
      });
  }, []);

  if (activeVotings.length === 0) return null;

  return (
    <section className="px-5 mb-4 mt-0">
      <div 
        onClick={() => onActionClick('Voting')}
        className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100 flex items-center justify-between cursor-pointer hover:border-teal-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center animate-pulse">
            <icons.dokumen className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-13px font-bold text-gray-900 leading-tight">Voting Aktif ({activeVotings.length})</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Mari berpartisipasi dalam musyawarah RT</p>
          </div>
        </div>
        <div className="text-teal-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </section>
  );
};
import { MobileAcaraPage } from './MobileAcara';
import { MobileIuran } from './MobileIuran';
import { MobileKas } from './MobileKas';
import { MobileUMKM } from './MobileUMKM';
import { MobileUMKMAds } from './components/MobileUMKMAds';
import { WebSmartRtAiPage } from './components/WebSmartRtAiPage';
import { WebDashboardRtView } from './components/WebDashboardRtView';
import { WebInventarisPage } from './components/WebInventarisPage';
import { WebNotulenPage } from './components/WebNotulenPage';
import { WebMenuAccessPage } from './components/WebMenuAccessPage';
import { LandingPage } from './components/LandingPage';

// --- Modern Icons Set ---
export const icons = {
  voting: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5l10 -10" />
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    </svg>
  ),
  dashboard: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  warga: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  iuran: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  laporan: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  pengumuman: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11V9a2 2 0 0 1 2-2h3.93a2 2 0 0 0 1.66-.9l1.1-1.65A2 2 0 0 1 13.35 3h2.15a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2.15a2 2 0 0 1-1.66-.89l-1.1-1.65a2 2 0 0 0-1.66-.9H5a2 2 0 0 1-2-2v-2Z" />
      <path d="M22 9a6 6 0 0 1 0 6" />
    </svg>
  ),
  umkm: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  pengaturan: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  surat: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </svg>
  ),
  laporanrt: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  media: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  kas: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  sedekah: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  darurat: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  lainnya: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  ),
  search: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  events: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  ),
  home: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  profil: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  bell: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  dokumen: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  gemini: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  ),
  inventaris: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  arrowLeft: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  edit: (props: any) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  qr: (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 10h4v4h-4z" />
    </svg>
  )
};

// --- Logo Komunitas Modern ---
// Menggunakan desain elegan dan bentuk rumah/orang abstrak bersatu (Tanpa Background)
export const LogoCommunityIcon = ({ size = '32', colorAccent = themeColors.accent, colorPrimary = themeColors.primary }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="people">
      {/* Left person */}
      <circle cx="30" cy="35" r="8" fill="#A5F3FC" />
      <path d="M15 65 Q30 40 45 65 Z" fill="#A5F3FC" />

      {/* Right person */}
      <circle cx="70" cy="35" r="8" fill="#FEF08A" />
      <path d="M55 65 Q70 40 85 65 Z" fill="#FEF08A" />

      {/* Center person */}
      <circle cx="50" cy="28" r="9" fill="#FFFFFF" />
      <path d="M30 65 C40 30 60 30 70 65 Z" fill="#FFFFFF" />

      {/* Ground line */}
      <path d="M15 65 L85 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Text */}
    <text x="50" y="85" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">GUYUB RUKUN</text>
  </svg>
);

const laporanWargaData = [
  { nama: 'Jalan Rusak', status_laporan: 'Tergenang', status_jalan: 'Normal' },
  { nama: 'Tergenang Air', status_laporan: 'Tergenang', status_jalan: 'Normal' },
];

const mobileEventsData = [
  { day: '10', month: 'SAM', year: '19/700.00', name: 'Sitiinaer Hont Conation', id: 1 },
  { day: '19', month: 'SAM', year: '22/10:00', name: 'Ruhn/iwsal Events', id: 2 },
];

const themeColors = {
  primary: '#14B8A6', // Teal 500 matching new logo
  accent: '#FBCFCA',  // Soft pink-orange
  neutral: {
    bg: '#F9FAFB',
    text: '#1F2937',
    subtext: '#6B7280',
    muted: '#D1D5DB',
  },
};

const fontStyle = '"Plus Jakarta Sans", sans-serif';

// --- Web UI Components (Dashboard Admin) ---
const WebSidebar = ({ 
  activeTab, 
  onTabChange, 
  visibleMenus = [],
  isCollapsed
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void, 
  visibleMenus?: string[],
  isCollapsed: boolean
}) => (
  <motion.aside 
    animate={{ width: isCollapsed ? '5rem' : '16rem' }}
    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    className="h-screen bg-white border-r border-gray-100 flex flex-col p-4 lg:p-6 fixed left-0 top-0 z-50 overflow-hidden shadow-sm"
  >
    <div className="flex items-center mb-10 gap-2.5 justify-start">
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-1.5 rounded-xl shadow-sm border border-teal-400/30 shrink-0">
        <LogoCommunityIcon size="20" colorAccent="#ffffff" colorPrimary="#ffffff" />
      </div>
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col whitespace-nowrap"
          >
            <span className="text-base font-extrabold leading-none tracking-tight text-gray-800" style={{ fontFamily: fontStyle }}>
              GUYUB <span className="text-teal-600">RUKUN</span>
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Aplikasi Warga</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    
    <nav className="flex-grow space-y-2 overflow-y-auto w-full no-scrollbar">
      {[
        { name: 'Dashboard', icon: icons.dashboard },
        { name: 'Warga', icon: icons.warga },
        { name: 'Surat Online', icon: icons.surat },
        { name: 'Iuran', icon: icons.iuran },
        { name: 'Kas', icon: icons.kas },
        { name: 'Dokumen', icon: icons.dokumen },
        { name: 'Laporan', icon: icons.laporan },
        { name: 'Notulen Rapat', icon: icons.laporan },
        { name: 'Voting', icon: icons.voting },
        { name: 'Pengumuman', icon: icons.pengumuman },
        { name: 'Media', icon: icons.media },
        { name: 'UMKM', icon: icons.umkm },
        { name: 'Tamu', icon: icons.warga },
        { name: 'Inventaris', icon: icons.inventaris },
        { name: 'Smart RT AI', icon: icons.gemini },
        { name: 'Pengaturan', icon: icons.pengaturan },
        { name: 'Akses Menu', icon: icons.pengaturan },
      ].filter(item => visibleMenus.includes(item.name))
       .map((item) => {
         const isActive = activeTab === item.name;
         return (
           <button 
             key={item.name} 
             onClick={() => onTabChange(item.name)}
             title={item.name}
             className={`w-full flex items-center justify-start gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 text-teal-800' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
             <AnimatePresence mode="popLayout">
               {!isCollapsed && (
                 <motion.span 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   transition={{ duration: 0.15 }}
                   className="whitespace-nowrap text-left"
                 >
                   {item.name}
                 </motion.span>
               )}
             </AnimatePresence>
           </button>
         );
       })}
    </nav>
    
    <div className="w-full mt-auto flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-full h-24 p-2 bg-gray-50 rounded-lg overflow-hidden relative flex items-center justify-center"
          >
            <IllustrationFamilyGroup/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.aside>
);

// --- 1. UPDATE: WebHeader ---
const WebHeader = ({ 
  user, 
  onLogout, 
  onUpdateUser, 
  notifications = [], 
  onShowNotifications, 
  onNotificationClick, 
  onOpenBroadcast,
  isCollapsed,
  onToggleCollapse
}: { 
  user?: any; 
  onLogout?: () => void; 
  onUpdateUser?: (data: any) => void; 
  notifications?: any[]; 
  onShowNotifications?: () => void; 
  onNotificationClick?: (n: any) => void; 
  onOpenBroadcast?: () => void; 
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-20 lg:ml-[16rem]'}`}>
        <div className="flex items-center justify-between py-3 px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Toggle Button for Sidebar */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleCollapse}
              className="p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-sm cursor-pointer shrink-0"
              title={isCollapsed ? "Buka Sidebar" : "Sembunyikan Sidebar"}
            >
              <svg className="w-5 h-5 transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl lg:text-2xl font-extrabold text-gray-800 tracking-tight" style={{ fontFamily: fontStyle }}>
                Halo, <span className="text-teal-600">{user?.nama || 'Admin'}</span>! 👋
              </h1>
              <p className="hidden md:block text-xs text-gray-500 font-medium mt-0.5">Pusat Kendali Guyub Rukun RT 01</p>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                   setShowNotifications(!showNotifications);
                   if (!showNotifications && onShowNotifications) onShowNotifications();
                }} 
                className={`relative p-2.5 rounded-full transition-all duration-300 ${showNotifications ? 'bg-teal-50 text-teal-600 shadow-inner' : 'bg-gray-50/80 hover:bg-teal-50 text-gray-500 hover:text-teal-600 shadow-sm border border-gray-100'}`}
              >
                <icons.bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.9 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-4 w-80 lg:w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                      <h4 className="font-extrabold text-gray-800 text-sm">Notifikasi</h4>
                      <div className="flex items-center gap-2">
                        {user?.allowedMenus?.includes('Pengumuman') && (
                           <button onClick={(e) => { e.stopPropagation(); setShowNotifications(false); onOpenBroadcast?.(); }} className="text-[10px] uppercase font-bold text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1 rounded-full shadow-sm">Kirim Broadcast</button>
                        )}
                        {unreadCount > 0 && <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full shadow-sm">{unreadCount} Baru</span>}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                          onClick={() => {
                            if (onNotificationClick) {
                               onNotificationClick(n);
                            } else {
                               console.log(`Dibuat/Diupdate oleh: ${n.updaterName || 'Sistem'}\n\nModul: ${n.resource || 'Umum'}\n\n${n.message}`);
                            }
                            setShowNotifications(false);
                          }}
                          className="p-4 border-b border-gray-50 cursor-pointer group transition-all"
                        >
                          <div className="flex items-start gap-3">
                             <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-200' : 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]'}`}></div>
                             <div>
                               <p className="text-sm font-bold text-gray-800 group-hover:text-teal-600 transition-colors leading-tight">{n.title}</p>
                               <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                               <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1.5">
                                  {new Date(n.time || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="text-teal-600 font-bold capitalize">{n.updaterName || 'Sistem'}</span>
                               </p>
                             </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="p-10 flex flex-col items-center justify-center text-center opacity-70">
                          <icons.laporan className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-sm text-gray-500 font-medium">Hore! Semua notifikasi sudah dibaca.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Trigger */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:border-teal-300 transition-all"
            >
              {user?.photo ? (
                 <img src={user.photo} alt="Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-50" />
              ) : (
                 <ProfileAvatar size="9"/>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="font-extrabold text-sm text-gray-800 leading-none">{user?.nama ? user.nama.split(' ')[0] : 'Admin'}</span>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mt-0.5">
                  {user?.role === 'admin' ? 'Ketua RT' : 
                   user?.role === 'bendahara' ? 'Bendahara' : 
                   user?.role === 'sekretaris' ? 'Sekretaris' : 
                   user?.role === 'pengurus' ? 'Pengurus' : 'Warga'}
                </span>
              </div>
              <svg className="hidden md:block w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </motion.div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col border border-white/20"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
                <h3 className="font-extrabold text-gray-800 text-lg">Menu Pengurus</h3>
                <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all">✕</button>
              </div>
              <div className="p-0 overflow-y-auto w-full relative bg-slate-50">
                 <MobileProfilPage user={user} onLogout={() => { onLogout?.(); setShowProfileModal(false); }} onUpdateUser={(d) => { if(onUpdateUser) onUpdateUser(d); setShowProfileModal(false); }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const WebStatsCards = () => {
  const [stats, setStats] = useState({ warga: 0, totalWarga: 0, laporan: 0, saldo: 0, iuranRef: 0, iuranTotal: 0, kasRT: 0, danaKematian: 0, danaSosial: 0, docUploaded: 0, docNotUploaded: 0 });
  const [showKasDetail, setShowKasDetail] = useState(false);
  
  // Tambahkan state ini untuk kontrol menyembunyikan saldo di Web
  const [isMasked, setIsMasked] = useState(false);

  useEffect(() => {
    // ... (Biarkan kode useEffect kamu sebelumnya apa adanya) ...
// [TIDAK ADA PERUBAHAN DI AREA INI]

    const fetchStats = async () => {
      try {
        const [wargaRes, laporanRes, kasRes, iuranRes] = await Promise.all([
          apiFetch('/api/warga'),
          apiFetch('/api/data/laporan'),
          apiFetch('/api/data/kas'),
          apiFetch('/api/data/iuran')
        ]);
        const wData = await wargaRes.json();
        const lData = await laporanRes.json();
        const kData = await kasRes.json();
        const iData = await iuranRes.json();

        // calc warga
        const totalWarga = wData.users?.length || 0;
        let totalWargaPerson = totalWarga;
        let docUploaded = 0;
        let docNotUploaded = 0;
        (wData.users || []).forEach((u: any) => {
          totalWargaPerson += (u.members?.length || 0);
          if (u.dokumenKk || (Array.isArray(u.dokumenKtp) ? u.dokumenKtp.length > 0 : u.dokumenKtp)) {
            docUploaded++;
          } else {
            docNotUploaded++;
          }
        });
        
        // calc laporan baru
        const laporanBaru = (lData.data || []).filter((l: any) => l.status === 'menunggu').length;
        // calc saldo (Kas RT + Dana Kematian + Dana Sosial)
        const items = kData.data || [];
        const m = items.filter((d: any) => d.type === 'Masuk').reduce((a: number, b: any) => a + (b.amount || 0), 0);
        const k = items.filter((d: any) => d.type === 'Keluar').reduce((a: number, b: any) => a + (b.amount || 0), 0);
        const saldo = m - k;

        const getSaldo = (cat: string) => {
          const catItems = items.filter((d: any) => (d.category || 'Kas RT') === cat);
          const catM = catItems.filter((d: any) => d.type === 'Masuk').reduce((a: number, b: any) => a + (b.amount || 0), 0);
          const catK = catItems.filter((d: any) => d.type === 'Keluar').reduce((a: number, b: any) => a + (b.amount || 0), 0);
          return catM - catK;
        };
        const kasRT = getSaldo('Kas RT');
        const danaKematian = getSaldo('Dana Kematian');
        const danaSosial = getSaldo('Dana Sosial');
        
        // iuran bulan ini
        const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        let iuranTotal = 0;
        let lunas = 0;
        const currentIuran = (iData.data || []).filter((i: any) => i.bulan === currentMonth);
        if (currentIuran.length > 0) {
           iuranTotal = currentIuran.length;
           lunas = currentIuran.filter((i: any) => i.status === 'verifikasi').length;
        } else {
           // fallback to overall if no iuran this month generated yet
           const allIuran = iData.data || [];
           iuranTotal = allIuran.length || 1;
           lunas = allIuran.filter((i: any) => i.status === 'verifikasi').length;
        }
        
        setStats({
          warga: totalWarga,
          totalWarga: totalWargaPerson,
          laporan: laporanBaru,
          saldo,
          iuranRef: lunas,
          iuranTotal,
          kasRT,
          danaKematian,
          danaSosial,
          docUploaded,
          docNotUploaded
        });

      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
    const handleUpdate = () => {
      fetchStats();
    };
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  const saldoFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
      {[
        { title: 'KK', value: formatter.format(stats.warga), unit: '', icon: icons.warga, accent: '#60A5FA', isWarga: true },
        { title: 'Total Warga', value: formatter.format(stats.totalWarga), unit: 'Orang', icon: icons.warga, accent: '#10B981' },
        { title: 'Laporan', value: formatter.format(stats.laporan), unit: 'Baru', icon: icons.laporan, accent: '#F87171' },
        { title: 'Saldo Kas', value: saldoFormatter.format(stats.saldo), unit: '', icon: icons.iuran, accent: '#FBBF24', isKas: true },
        { title: 'Iuran', value: `${Math.round((stats.iuranRef / Math.max(stats.iuranTotal, 1)) * 100)}%`, unit: 'Lunas', icon: icons.iuran, accent: '#34D399' },
      ].map((card, index) => (
        <div 
          key={index} 
          className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center flex-wrap ${card.isKas ? 'cursor-pointer hover:border-amber-200 transition-colors relative' : 'overflow-hidden'}`}
          onClick={() => card.isKas && setShowKasDetail(!showKasDetail)}
        >
          <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${card.accent}1A` }}>
            <card.icon className="w-7 h-7" style={{ color: card.accent }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium truncate flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {card.title}
                {/* Tombol Emoticon khusus untuk Saldo Kas */}
                {card.isKas && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMasked(!isMasked); }} 
                    className="text-sm focus:outline-none hover:scale-110 active:scale-95 transition-transform"
                    title={isMasked ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
                  >
                    {isMasked ? '🙈' : '👁️'}
                  </button>
                )}
              </span>
              {card.isKas && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Detail</span>}
            </p>
            <div className="flex items-baseline gap-1 mt-1 truncate">
              {/* Logika menutupi nilai saldo pada kartu */}
              <span className="text-2xl font-bold text-gray-900 truncate" style={{ fontFamily: fontStyle }}>
                {card.isKas && isMasked ? 'Rp •••••••••' : card.value}
              </span>
              {card.unit && <span className="text-xs font-medium text-gray-500 flex-shrink-0">{card.unit}</span>}
            </div>
          </div>
          {card.isWarga && (
              <div className="w-full flex gap-2 mt-2 text-[10px] font-medium border-t pt-2">
                <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">{stats.docUploaded} Upload Dokumen</span>
                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{stats.docNotUploaded} Belum</span>
              </div>
          )}
          
          {card.isKas && showKasDetail && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20" onClick={e => e.stopPropagation()}>
               <h4 className="text-xs font-bold text-gray-800 mb-3 border-b border-gray-50 pb-2">Rincian Saldo Kas</h4>
               <div className="space-y-2">
                 {/* Logika menutupi nilai saldo pada rincian detail */}
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Kas RT</span>
                   <span className="font-semibold text-gray-800">{isMasked ? 'Rp •••••' : saldoFormatter.format(stats.kasRT)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Dana Sosial</span>
                   <span className="font-semibold text-gray-800">{isMasked ? 'Rp •••••' : saldoFormatter.format(stats.danaSosial)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Dana Kematian</span>
                   <span className="font-semibold text-gray-800">{isMasked ? 'Rp •••••' : saldoFormatter.format(stats.danaKematian)}</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- 2. UPDATE: WebDateWidget (Kalender) ---
const WebDateWidget = () => {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDateState, setSelectedDateState] = useState<number>(date.getDate());
  const [reminders, setReminders] = useState<string[]>(() => {
    const saved = localStorage.getItem('event_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('event_reminders', JSON.stringify(reminders));
    window.dispatchEvent(new Event('storage'));
  }, [reminders]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('event_reminders');
      setReminders(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    apiFetch('/api/data/acara').then(r => r.json()).then(json => {
      setEvents(json.data || []);
    }).catch(console.error);
  }, []);

  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][date.getMonth()];
  const bulanFull = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][date.getMonth()];
  const tanggal = date.getDate();
  const tahun = date.getFullYear();
  const waktu = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const daysInMonth = new Date(tahun, date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(tahun, date.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const selectedDateEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getDate() === selectedDateState && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  });

  const upcomingEventsCount = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && d.getDate() >= date.getDate();
  }).length;

  return (
    <div className="relative col-span-1 xl:col-span-2 select-none z-20">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-12 left-0 right-0 z-50 bg-rose-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg border border-rose-400 text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between cursor-pointer relative overflow-hidden group border border-teal-500/30"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl translate-y-10 -translate-x-10"></div>

        <div className="relative z-10">
          <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 opacity-90">
            {hari}
            <motion.svg 
              animate={{ rotate: showCalendar ? 180 : 0 }} 
              transition={{ duration: 0.3 }}
              className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
            </motion.svg>
            {upcomingEventsCount > 0 && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">{tanggal} <span className="text-teal-200">{bulan}</span> {tahun}</h2>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-inner group-hover:bg-white/20 transition-all">
          <span className="text-xl md:text-2xl font-black tracking-wider text-white drop-shadow-md">{waktu}</span>
        </div>
        {upcomingEventsCount > 0 && (
          <div className="absolute top-0 right-0 m-2 mt-4 mr-4 px-2 py-1 bg-rose-500/90 text-white text-[9px] font-bold rounded-lg shadow-sm border border-rose-400 backdrop-blur-sm animate-pulse">
            {upcomingEventsCount} Agenda Terdekat
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showCalendar && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-6 lg:p-8 z-30 flex flex-col md:flex-row gap-8 transform-gpu"
          >
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-extrabold text-gray-800 text-xl">{bulanFull} {tahun}</h3>
                 <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded-full">{hari}</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-3">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                  <div key={d} className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {blanks.map(b => <div key={`blank-${b}`} className="p-2"></div>)}
                {days.map(d => {
                  const hasEvent = events.some(e => {
                    const evD = new Date(e.date);
                    return evD.getDate() === d && evD.getMonth() === date.getMonth() && evD.getFullYear() === date.getFullYear();
                  });
                  const isSelected = d === selectedDateState;
                  const isToday = d === date.getDate();

                  return (
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      key={d} 
                      onClick={() => setSelectedDateState(d)}
                      className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer border-2
                        ${isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 
                          isToday ? 'bg-teal-50 text-teal-700 border-teal-200' : 
                          'border-transparent text-gray-700 hover:bg-gray-50'}`}
                    >
                      {d}
                      {hasEvent && (
                        <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400'}`}></div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex flex-col min-h-[250px]">
              <div className="flex items-center gap-3 mb-5">
                 <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-black text-lg shadow-sm">{selectedDateState}</div>
                 <div>
                    <h3 className="font-extrabold text-gray-800 text-sm">Agenda Kegiatan</h3>
                    <p className="text-xs text-gray-500 font-medium">{bulanFull} {tahun}</p>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((e, idx) => {
                    const isReminded = reminders.includes(e.id);
                    return (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.1 }} 
                      key={idx} 
                      onClick={() => {
                        if (isReminded) {
                          setReminders(prev => prev.filter(id => id !== e.id));
                        } else {
                          setReminders(prev => [...prev, e.id]);
                        }
                      }}
                      className={`relative pl-4 border-l-2 cursor-pointer transition-colors hover:bg-slate-50 p-2 rounded-r-xl ${isReminded ? 'border-rose-500' : 'border-orange-400'}`}
                    >
                      <div className={`absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-white border-2 ${isReminded ? 'border-rose-500' : 'border-orange-400'}`}></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-xs font-extrabold inline-block px-2 py-0.5 rounded mb-1 ${isReminded ? 'text-rose-600 bg-rose-50' : 'text-orange-600 bg-orange-50'}`}>{e.time || 'Waktu tidak ditentukan'}</div>
                          <div className="text-sm font-bold text-gray-800 leading-tight">{e.title}</div>
                        </div>
                        {isReminded && (
                          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                        )}
                        {!isReminded && (
                          <svg className="w-4 h-4 text-gray-300 hover:text-rose-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        )}
                      </div>
                      {e.location && (
                        <div className="text-[11px] font-medium text-gray-500 mt-1.5 flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {e.location}
                        </div>
                      )}
                    </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10 opacity-70">
                    <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <p className="text-xs font-bold text-gray-500">Kosong, tidak ada agenda</p>
                    <p className="text-[10px] mt-1">Gunakan waktu ini untuk bersantai.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- 3. UPDATE: WebMediaSlider ---
const WebMediaSlider = () => {
  const [media, setMedia] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    apiFetch('/api/data/media').then(r => r.json()).then(d => {
      setMedia(d.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % media.length);
    }, 6000); // Diperlambat sedikit agar animasi zoom terasa
    return () => clearInterval(interval);
  }, [media.length]);

  if (media.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative w-full h-72 md:h-96 mb-8 group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={media[currentIndex].imageUrl}
          alt={media[currentIndex].title}
          className="w-full h-full object-cover absolute inset-0"
        />
      </AnimatePresence>
      
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col items-start">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`tag-${currentIndex}`}
          className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm mb-3 uppercase tracking-widest"
        >
          Sorotan Warga
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={`title-${currentIndex}`}
          className="text-white font-black text-2xl md:text-3xl lg:text-4xl leading-tight line-clamp-2 drop-shadow-lg max-w-2xl"
        >
          {media[currentIndex].title}
        </motion.h3>
        
        {media[currentIndex].uploaderName && (
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} key={`desc-${currentIndex}`}
            className="text-white/80 text-xs md:text-sm font-semibold mt-2 flex items-center gap-2 drop-shadow"
          >
            <span className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] text-white">
              {media[currentIndex].uploaderName.charAt(0).toUpperCase()}
            </span>
            {media[currentIndex].uploaderName} 
            <span className="text-white/40">•</span> 
            {new Date(media[currentIndex].createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year:'numeric'})}
          </motion.p>
        )}
      </div>

      {/* Modern Progress Indicators */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-2 items-center">
        {media.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: idx === currentIndex ? '32px' : '12px', backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            {idx === currentIndex && (
              <motion.div 
                layoutId="activeMediaIndicator"
                className="absolute inset-0 bg-teal-400" 
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Navigation Arrows (Optional, appears on hover) */}
      <div className="absolute inset-y-0 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <button onClick={() => setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1))} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 pointer-events-auto transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button onClick={() => setCurrentIndex(prev => (prev + 1) % media.length)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 pointer-events-auto transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
};

const WebLaporanTable = () => {
  const [laporanWargaData, setLaporanWargaData] = useState<any[]>([]);
  useEffect(() => {
    apiFetch('/api/data/laporan').then(r => r.json()).then(d => {
      setLaporanWargaData(d.data?.slice(-5).reverse() || []);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Laporan Warga Terbaru</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[400px] text-left text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Pelapor</th>
              <th className="pb-2 font-medium">Judul</th>
              <th className="pb-2 font-medium">Kategori</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {laporanWargaData.map((item, index) => (
              <tr key={index} className={index < laporanWargaData.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="py-3 font-medium text-gray-800">{item.userName || item.nama || 'Warga'}</td>
                <td className="py-3 text-gray-600 truncate max-w-[200px]">{item.judul}</td>
                <td className="py-3 text-teal-600 font-bold">{item.kategori || 'Keluhan'}</td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-1 rounded-md ${item.status === 'selesai' ? 'bg-teal-50 text-teal-700' : (item.status === 'diproses' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700')}`}>{item.status || 'menunggu'}</span>
                </td>
              </tr>
            ))}
            {laporanWargaData.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-400">Belum ada laporan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WebIuranChart = () => {
  const [chartData, setChartData] = useState<{bulan: string, value: number}[]>([]);
  useEffect(() => {
    apiFetch('/api/data/kas').then(res => res.json()).then(data => {
      const items = data.data || [];
      const stats: Record<string, number> = {};
      items.forEach((i: any) => {
        if (i.type === 'Masuk') {
          const dateStr = i.createdAt 
            ? new Date(i.createdAt).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) 
            : new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
          stats[dateStr] = (stats[dateStr] || 0) + (parseInt(i.amount) || 0);
        }
      });
      const keys = Object.keys(stats).slice(-6);
      setChartData(keys.map(k => ({ bulan: k.split(' ')[0].substring(0,3), value: stats[k] })));
    }).catch(console.error);
  }, []);

  const maxValue = Math.max(...chartData.map(d => d.value), 100000);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-900">Tren Pemasukan Bulanan</h3>
      <div className="flex-grow flex items-end justify-between gap-1 p-2 border border-gray-50 rounded-lg">
        {chartData.length > 0 ? chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center gap-1 min-h-[100px] justify-end mt-4 w-full">
            <div className="bg-teal-500 w-8 rounded-t-sm" style={{ height: `${(data.value / maxValue) * 100}px` }}></div>
            <span className="text-[9px] text-gray-400 font-medium">{data.bulan}</span>
          </div>
        )) : <div className="text-xs text-gray-400 text-center w-full py-8">Belum ada data pemasukan</div>}
      </div>
    </div>
  );
};

const WebWargaPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileDataWarga onBack={() => {}} currentUser={user} />
    </div>
  </div>
);

const WebIuranPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileIuran onBack={() => {}} currentUser={user} />
    </div>
  </div>
);

const WebKasPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileKas onBack={() => {}} currentUser={user} />
    </div>
  </div>
);

const WebDokumenPage = ({ user, onUpdateUser }: { user: any, onUpdateUser: (u: any) => void }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileDokumen onBack={() => {}} currentUser={user} onUpdateUser={onUpdateUser} />
    </div>
  </div>
);

const WebLaporanPage = ({ user }: { user: any }) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
      <div className="p-4 md:p-8 relative">
        {!showForm ? (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowForm(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-teal-700 transition">Tambahkan Laporan</button>
            </div>
            <MobileLaporan onBack={() => {}} currentUser={user} />
          </div>
        ) : (
          <MobileLaporRT onBack={() => setShowForm(false)} currentUser={user} defaultTab="Keluhan" />
        )}
      </div>
    </div>
  );
};

const WebPengumumanPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileAcaraPage currentUser={user} />
    </div>
  </div>
);

const WebUMKMPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8">
      <MobileUMKM onBack={() => {}} currentUser={user} />
    </div>
  </div>
);

const WebMediaPage = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
    <div className="p-4 md:p-8 min-h-screen">
      <MobileMedia onBack={() => {}} currentUser={user} />
    </div>
  </div>
);

const WebTamuPage = ({ user }: { user: any }) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full h-full min-h-[500px] overflow-auto">
      <div className="p-4 md:p-8 relative">
        {!showForm ? (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowForm(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-teal-700 transition">Tambahkan Laporan</button>
            </div>
            <MobileTamu onBack={() => {}} currentUser={user} />
          </div>
        ) : (
          <MobileLaporRT onBack={() => setShowForm(false)} currentUser={user} defaultTab="Tamu" />
        )}
      </div>
    </div>
  );
};

const WebPengaturanPage = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // Audit and backup states
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchLog, setSearchLog] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [showConfirmBackup, setShowConfirmBackup] = useState(false);

  const isAdminOrPengurus = user?.role === 'admin' || user?.role === 'pengurus' || user?.role === 'bendahara' || user?.role === 'sekretaris';

  const fetchAuditLogs = async () => {
    if (!isAdminOrPengurus) return;
    setLoadingLogs(true);
    try {
      const res = await apiFetch('/api/audit-logs');
      const json = await res.json();
      setAuditLogs(json.data || []);
    } catch (e) {
      console.error("Gagal memuat audit logs:", e);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordMsg('');
    if (!oldPassword || !newPassword || !confirmPassword) {
       return setPasswordError('Semua field harus diisi');
    }
    if (newPassword !== confirmPassword) {
       return setPasswordError('Password baru dan konfirmasi tidak cocok');
    }
    setSavingPass(true);
    try {
      const res = await apiFetch('/api/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('Password berhasil diganti');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 3000);
      } else {
        setPasswordError(data.error || 'Gagal mengubah password');
      }
    } catch (e) {
      setPasswordError('Terjadi kesalahan sistem');
    }
    setSavingPass(false);
  };

  // Point 10: JSON Backup Download Handler
  const handleExportJson = async () => {
    setExportingBackup(true);
    try {
      const selectedRt = localStorage.getItem('selected_rt') || 'rt01';
      const response = await apiFetch('/api/backup/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CADANGAN_DATA_RT_${selectedRt.toUpperCase()}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Gagal mengekspor data.");
      }
    } catch (e) {
      console.error("Error backing up data:", e);
      alert("Kesalahan sistem saat backup data.");
    }
    setExportingBackup(false);
  };

  // Point 10: Print/Export formatted PDF Report
  const handleExportPdf = async () => {
    setExportingBackup(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF() as any;
      const selectedRt = localStorage.getItem('selected_rt') || 'rt01';

      // 1. Fetch data for PDF content
      const kasRes = await apiFetch('/api/data/kas');
      const iuranRes = await apiFetch('/api/data/iuran');
      const wargaRes = await apiFetch('/api/warga');
      
      const kasData = (await kasRes.json()).data || [];
      const iuranData = (await iuranRes.json()).data || [];
      const wargaData = (await wargaRes.json()).users || [];

      // Calculate brief financial stats
      const totalMasuk = kasData.filter((k: any) => k.type === 'Masuk').reduce((sum: number, k: any) => sum + (Number(k.amount) || 0), 0);
      const totalKeluar = kasData.filter((k: any) => k.type === 'Keluar').reduce((sum: number, k: any) => sum + (Number(k.amount) || 0), 0);
      const sisaSaldo = totalMasuk - totalKeluar;

      // 2. Draft PDF Design
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(20, 110, 120); // Teal color
      doc.text("LAPORAN KAS & KEUANGAN RT", 14, 20);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Kawasan: Rukun Tetangga ${selectedRt.toUpperCase()} - RW 21, Kompleks Rukun, Jakarta`, 14, 26);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 31);
      
      // Divider line
      doc.setDrawColor(200);
      doc.line(14, 35, 196, 35);

      // Brief Summary boxes
      doc.setFillColor(245, 247, 248);
      doc.rect(14, 40, 182, 22, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text("RINGKASAN PORTAL KEUANGAN:", 18, 46);
      doc.setFont("Helvetica", "normal");
      doc.text(`Total Iuran Masuk: Rp ${totalMasuk.toLocaleString('id-ID')} | Total Kas Keluar: Rp ${totalKeluar.toLocaleString('id-ID')}`, 18, 52);
      doc.setFont("Helvetica", "bold");
      doc.text(`Saldo Kas Aktif: Rp ${sisaSaldo.toLocaleString('id-ID')}`, 18, 57);

      doc.setFontSize(12);
      doc.setTextColor(20, 110, 120);
      doc.text("DAFTAR TRANSAKSI KAS", 14, 72);

      // Render Transaction Table formatted
      const headers = [["No", "Tanggal", "Jenis", "Nominal", "Kategori", "Keterangan", "Oleh"]];
      const rows = kasData.slice(0, 25).map((item: any, idx: number) => [
        idx + 1,
        item.createdAt ? item.createdAt.substring(0, 10) : '-',
        item.type || 'Masuk',
        `Rp ${(item.amount || 0).toLocaleString('id-ID')}`,
        item.category || 'Kas RT',
        item.message || '',
        item.name || 'Warga'
      ]);

      const startY = 78;
      const colWidths = [10, 22, 20, 32, 28, 45, 25];
      
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(20, 110, 120);
      doc.setTextColor(255);
      
      let curX = 14;
      headers[0].forEach((h, i) => {
        doc.rect(curX, startY, colWidths[i], 8, "F");
        doc.text(h, curX + 2, startY + 5.5);
        curX += colWidths[i];
      });

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(50);
      let curY = startY + 8;
      
      rows.forEach((row: any) => {
        if (curY > 270) {
          doc.addPage();
          curY = 20;
        }
        let rowX = 14;
        row.forEach((cell: any, cellIdx: number) => {
          doc.rect(rowX, curY, colWidths[cellIdx], 8);
          doc.text(String(cell), rowX + 2, curY + 5.5);
          rowX += colWidths[cellIdx];
        });
        curY += 8;
      });

      // Save output
      doc.save(`Laporan_Kas_Keuangan_RT_${selectedRt.toUpperCase()}_${Date.now()}.pdf`);
    } catch (e) {
      console.error("PDF generation exception:", e);
      alert("Terjadi kesalahan ketika mencetak PDF.");
    }
    setExportingBackup(false);
  };

  // Point 10: Print/Export Spreadsheet CSV format
  const handleExportCsv = async () => {
    setExportingBackup(true);
    try {
      const selectedRt = localStorage.getItem('selected_rt') || 'rt01';
      const response = await apiFetch('/api/data/kas');
      const kasData = (await response.json()).data || [];

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Tanggal,Jenis,Kategori,Nominal,Keterangan,Pencatat\n";

      kasData.forEach((item: any) => {
        const row = [
          item.id,
          item.createdAt || '',
          item.type || '',
          item.category || '',
          item.amount || 0,
          `"${(item.message || '').replace(/"/g, '""')}"`,
          item.name || ''
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Data_Kas_RT_${selectedRt.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("Gagal mengekspor berkas CSV.");
    }
    setExportingBackup(false);
  };

  // Filter logs for search
  const filteredLogs = auditLogs.filter(log => {
    const searchLow = searchLog.toLowerCase();
    return (
      (log.user && log.user.toLowerCase().includes(searchLow)) ||
      (log.action && log.action.toLowerCase().includes(searchLow)) ||
      (log.details && log.details.toLowerCase().includes(searchLow))
    );
  });

  return (
    <div className="space-y-8 w-full">
      {/* 1. Base settings */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col w-full overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Pengaturan Web & Preferensi</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola akun dan sistem digital lingkungan RT.</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Notifikasi Web</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Terima pop-up notifikasi saat ada aktivitas baru.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Tema Aplikasi</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Pilih warna aksen visual utama.</p>
            </div>
            <select className="text-xs font-bold border border-slate-200 rounded-xl bg-white p-2.5 px-4 text-slate-700 outline-none shadow-sm">
              <option>Teal & Tosca (Default)</option>
              <option>Dark Mode Slate</option>
              <option>Retro Aesthetic</option>
            </select>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div>
               <h3 className="font-extrabold text-slate-800 text-sm">Ubah Password Pengguna</h3>
               <p className="text-xs text-slate-500 mt-1 font-medium">Ganti kata sandi akun anda demi keamanan data.</p>
            </div>
            {passwordMsg && <div className="p-3 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl border border-teal-100">{passwordMsg}</div>}
            {passwordError && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">{passwordError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <input type="password" placeholder="Password Lama" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full text-sm bg-white border border-slate-200 focus:border-teal-500 rounded-xl p-3 outline-none font-semibold text-slate-700" />
               <input type="password" placeholder="Password Baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full text-sm bg-white border border-slate-200 focus:border-teal-500 rounded-xl p-3 outline-none font-semibold text-slate-700" />
               <input type="password" placeholder="Konfirmasi Password Baru" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full text-sm bg-white border border-slate-200 focus:border-teal-500 rounded-xl p-3 outline-none font-semibold text-slate-700" />
            </div>
            <div className="flex justify-end pt-2">
               <button onClick={handleUpdatePassword} disabled={savingPass} className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-md shadow-teal-500/10">
                 {savingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
               </button>
            </div>
          </div>

          <div className="flex justify-between items-center bg-rose-50/50 p-5 rounded-2xl border border-rose-100/50">
            <div>
              <h3 className="font-extrabold text-rose-800 text-sm">Keluar dari Sesi</h3>
              <p className="text-xs text-rose-400 mt-1 font-medium">Keluar dari sesi portal web Guyub Rukun saat ini.</p>
            </div>
            <button onClick={onLogout} className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-200">
              Keluar Aplikasi
            </button>
          </div>
        </div>
      </div>

      {/* 2. Point 10: BACKUP MANAGER & EXPORT (ADMINS ONLY) */}
      {isAdminOrPengurus && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Pusat Cadangan & Ekspor Data (Backup)</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Ekspor laporan, iuran, transaksi kas, dan backup utuh database RT.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">Secure Backup Enabled</span>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Unduh Backup JSON Database</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Backup utuh seluruh koleksi database RT ke penyimpanan lokal dalam format JSON yang kompatibel.</p>
              </div>
              <button 
                onClick={handleExportJson}
                disabled={exportingBackup}
                className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 border-none text-white rounded-xl text-xs font-extrabold transition shadow-sm"
              >
                {exportingBackup ? 'Memproses...' : 'Ekspor JSON Database'}
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Cetak Laporan Keuangan (PDF)</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Ciptakan berkas laporan kas, neraca keuangan, dan iuran warga berformat PDF rapi siap cetak fisik.</p>
              </div>
              <button 
                onClick={handleExportPdf}
                disabled={exportingBackup}
                className="w-full mt-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm shadow-teal-500/10"
              >
                {exportingBackup ? 'Memproses...' : 'Cetak & Ekspor Laporan PDF'}
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Ekspor Lembar Kas (CSV)</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Ekspor tabel jurnal kas mutasi transaksi warga ke berkas CSV yang bisa dibuka di Excel / Google Sheets.</p>
              </div>
              <button 
                onClick={handleExportCsv}
                disabled={exportingBackup}
                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm shadow-emerald-500/10"
              >
                {exportingBackup ? 'Memproses...' : 'Ekspor Lembar Kas CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Point 7: RIWAYAT AUDIT TRAIL LOGS (ADMINS ONLY) */}
      {isAdminOrPengurus && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Riwayat Pengawasan Sistem (Audit Trail Logs)</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Log aktivitas pencatatan sistem, update role, transaksi keuangan, dan perubahan KK.</p>
            </div>
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Cari log..." 
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100 rounded-xl p-2 px-3 outline-none w-48 text-slate-700" 
              />
              <button 
                onClick={fetchAuditLogs}
                className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                title="Muat Ulang Logs"
              >
                <svg className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingLogs ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-400">Sedang memproses & memuat log audit terbaru...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-slate-400">Belum ada riwayat aktivitas log terekam.</div>
            ) : (
              <div className="divide-y divide-slate-50 p-6 space-y-3">
                {filteredLogs.map((log: any) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/30 text-xs text-slate-600 transition hover:bg-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                          log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          log.action.includes('DELETE') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] shadow-sm">
                          👤 {log.user}
                        </span>
                        <span className="font-medium text-slate-500 leading-relaxed">{log.details}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        ⏰ {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : '-'}
                      </span>
                    </div>

                    {/* Diff toggle button */}
                    {(log.before || log.after) && (
                      <div className="mt-3">
                        <button 
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="text-[9px] text-teal-600 hover:text-teal-700 font-extrabold uppercase tracking-widest flex items-center gap-1 focus:outline-none"
                        >
                          <span>{expandedLogId === log.id ? 'Tutup Rincian Nilai' : 'Lihat Rincian Nilai (Diff)'}</span>
                          <svg className={`w-2.5 h-2.5 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        <AnimatePresence>
                          {expandedLogId === log.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3 pt-2"
                            >
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest border-b pb-1">Nilai / Objek Sebelum (Before)</span>
                                <pre className="font-mono text-[10px] bg-slate-50 text-slate-500 p-2 rounded-lg max-h-36 overflow-auto">
                                  {log.before ? JSON.stringify(log.before, null, 2) : '[KOSONG]'}
                                </pre>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest border-b pb-1">Nilai / Objek Sesudah (After)</span>
                                <pre className="font-mono text-[10px] bg-slate-50 text-slate-500 p-2 rounded-lg max-h-36 overflow-auto">
                                  {log.after ? JSON.stringify(log.after, null, 2) : '[KOSONG]'}
                                </pre>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- UPDATE: MobileHeader ---
const MobileHeader = ({ notifications, onShowNotifications }: { notifications: any[], onShowNotifications: () => void }) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      // Menggunakan sticky dan backdrop-blur agar terlihat modern saat halaman di-scroll
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-white/85 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]"
    >
      {/* Area Logo */}
      <motion.div 
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-1.5 rounded-xl shadow-sm border border-teal-400/30">
          {/* Memastikan warna logo di dalam box menjadi putih agar kontras */}
          <LogoCommunityIcon size="20" colorAccent="#ffffff" colorPrimary="#ffffff" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold leading-none tracking-tight text-gray-800" style={{ fontFamily: fontStyle }}>
            GUYUB <span className="text-teal-600">RUKUN</span>
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Aplikasi Warga</span>
        </div>
      </motion.div>

      {/* Area Tombol Notifikasi */}
      <motion.button 
        whileTap={{ scale: 0.85 }}
        className="relative p-2.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm active:bg-teal-50 transition-colors"
        onClick={onShowNotifications}
      >
        <icons.bell className="w-5 h-5 text-slate-600" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-4 w-4"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 border-2 border-white text-[8px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.header>
  );
};

const MobileProfile = ({ user, onClick }: { user: any; onClick?: () => void }) => {
  const shortName = user?.nama ? user.nama.split(' ').slice(0, 2).join(' ') : 'Warga';
  // Use a fallback so it matches original data visually if unavailable
  const displayAlamat = user?.alamat || 'Jl. Bahagia No. 12, Kompleks Rukun';
  
  return (
  <motion.section 
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={`relative px-5 py-6 bg-gradient-to-br from-[#f0fbf8] to-[#e4f6ef] flex items-center justify-between gap-3 rounded-b-[2rem] mb-6 overflow-hidden border-b border-teal-100/50 shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/30 rounded-full -translate-x-8 translate-y-8 blur-xl"></div>
    
    <div className="flex-grow z-10">
      <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: fontStyle }}>Halo, {shortName}!</h2>
      <p className="text-xs font-medium text-slate-500 mt-1">Warga RT 01, {displayAlamat.length > 25 ? displayAlamat.substring(0, 25) + '...' : displayAlamat}</p>
    </div>
    <div className="relative z-10 shrink-0">
      <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
        {user?.photo ? (
          <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-10 h-10 text-slate-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4.5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 13c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        )}
      </div>
      <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#02df8f] rounded-full border-2 border-[#e4f6ef]"></div>
    </div>
  </motion.section>
  );
};

const MobileQuickActions = ({ onActionClick, visibleMenus = [] }: { onActionClick: (action: string) => void, visibleMenus?: string[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [savedOrder, setSavedOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('layanan_warga_order');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  // Setup variasi animasi framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 } // Waktu jeda antar ikon muncul
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } }
  };

  const mobileToWebMap: { [key: string]: string } = {
    'Surat': 'Surat Online',
    'Lapor RT': 'Laporan',
    'Dokumen': 'Dokumen',
    'Notulen Rapat': 'Notulen Rapat',
    'Media': 'Media',
    'Iuran': 'Iuran',
    'Kas': 'Kas',
    'Data Warga': 'Warga',
    'UMKM': 'UMKM',
    'Tamu': 'Tamu',
    'Inventaris': 'Inventaris',
    'Smart RT AI': 'Smart RT AI',
    'Voting': 'Voting'
  };

  const filteredActions = useMemo(() => {
    let actions = quickActions.filter(action => {
      const webMenu = mobileToWebMap[action.name];
      if (!webMenu) return true;
      return visibleMenus.includes(webMenu);
    });

    if (savedOrder.length > 0) {
      actions.sort((a, b) => {
        const idxA = savedOrder.indexOf(a.name);
        const idxB = savedOrder.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }
    return actions;
  }, [visibleMenus, savedOrder]);

  const [displayedActions, setDisplayedActions] = useState<any[]>(
    showAll || isEditMode ? filteredActions : filteredActions.slice(0, 8)
  );

  useEffect(() => {
    setDisplayedActions(showAll || isEditMode ? filteredActions : filteredActions.slice(0, 8));
  }, [showAll, isEditMode, filteredActions]);

  const handleSetList = (newList: any[]) => {
    setDisplayedActions(newList);
    if (isEditMode) {
      const newOrder = newList.map((item: any) => item.name);
      setSavedOrder(newOrder);
      localStorage.setItem('layanan_warga_order', JSON.stringify(newOrder));
    }
  };

  return (
    <section className="px-5 mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-extrabold text-gray-800 text-sm">Layanan Warga</h3>
        <div className="flex items-center gap-2">
          <span 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition-colors ${isEditMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}
          >
            {isEditMode ? 'Selesai Edit' : 'Edit Posisi'}
          </span>
          {filteredActions.length > 8 && !isEditMode && (
            <span 
              onClick={() => setShowAll(!showAll)}
              className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              {showAll ? 'Sembunyikan' : 'Lihat Semua'}
            </span>
          )}
        </div>
      </div>
      
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100"
      >
        <ReactSortable 
          list={displayedActions} 
          setList={handleSetList}
          disabled={!isEditMode}
          animation={200}
          className="grid grid-cols-4 gap-y-5 gap-x-3"
        >
          {displayedActions.map((action, index) => (
            <motion.button 
              key={action.name} 
              variants={itemVariants}
              whileTap={!isEditMode ? { scale: 0.85 } : undefined}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  return;
                }
                const act = action as any;
                if (act.url) {
                  window.open(act.url, '_blank');
                } else {
                  onActionClick(act.name);
                }
              }} 
              className={`flex flex-col items-center text-center gap-2.5 group outline-none ${isEditMode ? 'cursor-move' : ''}`}
            >
              {/* Box Ikon Modern */}
              <div className={`p-3.5 w-14 h-14 flex items-center justify-center rounded-[1.1rem] bg-gradient-to-br ${action.color} text-white shadow-md ${action.shadow} group-hover:shadow-lg transition-all relative overflow-hidden ${isEditMode ? 'animate-pulse ring-2 ring-orange-300 ring-offset-2' : ''}`}>
                {/* Efek kilauan cahaya (Shine effect) */}
                {!isEditMode && <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/30 transform -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>}
                
                {/* Ikon */}
                <action.icon className="w-6 h-6 relative z-10 drop-shadow-sm" />
              </div>
              
              {/* Teks Label */}
              <span className={`text-[10px] font-extrabold leading-tight transition-colors ${isEditMode ? 'text-orange-600' : 'text-slate-600 group-hover:text-teal-600'}`}>
                {action.name}
              </span>
            </motion.button>
          ))}
        </ReactSortable>
      </motion.div>
    </section>
  );
};

// --- UPDATE: MobileEvents (Widget Beranda) ---
let cachedMediaList: any[] | null = null;
let cachedBackendEvents: any[] | null = null;

const MobileEvents = ({ onActionClick }: { onActionClick: (action: string) => void }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [mediaList, setMediaList] = useState<any[]>(cachedMediaList || []);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [backendEvents, setBackendEvents] = useState<any[]>(cachedBackendEvents || []);
  const [loadingMedia, setLoadingMedia] = useState(!cachedMediaList);

  const [reminders, setReminders] = useState<string[]>(() => {
    const saved = localStorage.getItem('event_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('event_reminders', JSON.stringify(reminders));
    window.dispatchEvent(new Event('storage'));
  }, [reminders]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('event_reminders');
      setReminders(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setLoadingMedia(!cachedMediaList);
    apiFetch('/api/data/media').then(r => r.json()).then(json => {
      let list = [];
      if (json.data && json.data.length > 0) {
        list = json.data.slice(-5).reverse();
      } else {
        list = [{
          imageUrl: "https://images.unsplash.com/photo-1593113511332-15f5ea6c4dcd?auto=format&fit=crop&w=600&q=80",
          title: "Kerja Bakti Sambut Ramadhan",
          uploaderName: "Admin RT",
          desc: "Keseruan warga RT 01 bergotong royong."
        }];
      }
      cachedMediaList = list;
      setMediaList(list);
    }).catch(console.error).finally(() => setLoadingMedia(false));

    apiFetch('/api/data/acara').then(r => r.json()).then(json => {
      cachedBackendEvents = json.data || [];
      setBackendEvents(cachedBackendEvents);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (mediaList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMediaIndex(prev => (prev + 1) % mediaList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mediaList.length]);

  const currentMedia = mediaList[activeMediaIndex] || null;

  // Calendar Logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array.from({ length: firstDay }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];
  const weeks = [];
  for (let i = 0; i < totalSlots.length; i += 7) weeks.push(totalSlots.slice(i, i + 7));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const selectedDateEvents = backendEvents.filter(e => {
    if (!selectedDate) return false;
    const d = new Date(e.date);
    return d.getDate() === selectedDate && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <section className="px-5 mb-8 space-y-6">
      {/* 1. Mobile Media Slider (Modern Story Style) */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden relative group cursor-pointer aspect-[4/3] w-full"
        onClick={() => onActionClick('Media')}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMediaIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {loadingMedia ? (
               <div className="w-full h-full bg-slate-200 animate-pulse"></div>
            ) : currentMedia && (
              <img src={currentMedia.imageUrl} alt={currentMedia.title} className="w-full h-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Bars ala Instagram Story */}
        {mediaList.length > 1 && !loadingMedia && (
          <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
            {mediaList.map((_, idx) => (
              <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden backdrop-blur-sm">
                {idx === activeMediaIndex && (
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 5, ease: "linear" }} 
                    className="h-full bg-white rounded-full"
                  />
                )}
                {idx < activeMediaIndex && <div className="h-full bg-white rounded-full" />}
              </div>
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-5 text-white z-10">
          <div className="flex justify-between items-end w-full">
            <div className="flex-grow pr-2">
              <span className="px-2.5 py-1 mb-2 bg-teal-500/80 backdrop-blur-md text-[9px] font-extrabold rounded-md inline-block uppercase tracking-wider shadow-sm">Sorotan Warga</span>
              {loadingMedia ? (
                 <>
                    <div className="h-5 w-3/4 bg-white/30 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-white/20 animate-pulse rounded"></div>
                 </>
              ) : (
                 <>
                    <h4 className="text-lg font-black leading-tight drop-shadow-md mb-1">{currentMedia?.title}</h4>
                    <p className="text-[10px] text-slate-200 font-medium line-clamp-2 drop-shadow">{currentMedia?.desc || `Oleh: ${currentMedia?.uploaderName}`}</p>
                 </>
              )}
            </div>
            
            {!loadingMedia && currentMedia && (
              <a href={currentMedia.imageUrl} download={currentMedia.title || 'foto'} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg active:scale-90 flex-shrink-0" title="Unduh">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Mobile Calendar Widget */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 relative">
        <div className="flex justify-between items-center mb-6">
           <div className="flex flex-col">
             <div className="flex items-center gap-2">
               <div className="relative group">
                 <button 
                   onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors"
                 >
                   <span className="text-[15px] font-extrabold text-slate-800">{monthNames[currentMonth]}</span>
                   <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                 </button>
                 
                 {/* Custom Month Dropdown */}
                 <AnimatePresence>
                   {showMonthPicker && (
                     <>
                       <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)}></div>
                       <motion.div 
                         initial={{ opacity: 0, y: -5, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: -5, scale: 0.95 }}
                         transition={{ duration: 0.15 }}
                         className="absolute top-10 left-0 z-50 w-48 bg-white rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100/80 p-3 grid grid-cols-3 gap-1.5"
                       >
                         {monthNames.map((m, i) => (
                           <div 
                             key={i} 
                             onClick={() => { setCurrentMonth(i); setShowMonthPicker(false); }}
                             className={`px-1 py-2.5 rounded-xl text-center text-xs font-bold cursor-pointer transition-all ${currentMonth === i ? 'bg-teal-500 text-white shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:bg-teal-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}
                           >
                             {m.substring(0,3)}
                           </div>
                         ))}
                       </motion.div>
                     </>
                   )}
                 </AnimatePresence>
               </div>
               
               <div className="relative group">
                 <button 
                   onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100/50 hover:bg-teal-100 hover:border-teal-200/50 transition-colors"
                 >
                   <span className="text-[15px] font-extrabold text-teal-700">{currentYear}</span>
                   <svg className={`w-3.5 h-3.5 text-teal-500 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                 </button>
                 
                 {/* Custom Year Dropdown */}
                 <AnimatePresence>
                   {showYearPicker && (
                     <>
                       <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)}></div>
                       <motion.div 
                         initial={{ opacity: 0, y: -5, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: -5, scale: 0.95 }}
                         transition={{ duration: 0.15 }}
                         className="absolute top-10 left-0 z-50 w-44 bg-white rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100/80 p-3 grid grid-cols-2 gap-1.5 overflow-y-auto max-h-56"
                       >
                         {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
                           <div 
                             key={y} 
                             onClick={() => { setCurrentYear(y); setShowYearPicker(false); }}
                             className={`px-1 py-2.5 rounded-xl text-center text-xs font-bold cursor-pointer transition-all ${currentYear === y ? 'bg-teal-500 text-white shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:bg-teal-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}
                           >
                             {y}
                           </div>
                         ))}
                       </motion.div>
                     </>
                   )}
                 </AnimatePresence>
               </div>
             </div>
             <p className="text-[10px] text-slate-400 font-extrabold mt-1.5 uppercase tracking-[0.2em]">Jadwal RT</p>
           </div>
           
           <motion.button 
             whileTap={{ scale: 0.9 }}
             onClick={() => onActionClick('Acara')}
             className="w-10 h-10 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full flex items-center justify-center transition-colors shadow-[0_2px_10px_-3px_rgba(20,184,166,0.3)]"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
           </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, idx) => (
             <div key={d} className={`text-[10px] font-extrabold uppercase ${idx === 0 ? 'text-orange-500' : 'text-slate-400'}`}>{d}</div>
          ))}
        </div>
        
        <div className="space-y-2.5">
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 text-center">
              {week.map((date, j) => {
                const isEvent = date && backendEvents.some(e => {
                  const d = new Date(e.date);
                  return d.getDate() === date && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });
                const isSelected = selectedDate === date;
                const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                
                if (!date) return <div key={j} className="aspect-square"></div>;

                return (
                  <motion.div 
                    key={j} 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setSelectedDate(date)}
                    className={`relative aspect-square cursor-pointer flex flex-col items-center justify-center rounded-full text-[13px] font-bold transition-all border-2 
                      ${isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-[0_4px_12px_rgba(13,148,136,0.3)]' : 
                        isToday ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm' : 
                        'border-transparent text-slate-700 hover:bg-slate-50'}`}
                  >
                    {date}
                    {isEvent && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Daftar Acara Hari Terpilih */}
        <div className="mt-8 pt-6 border-t border-slate-100/60 space-y-3">
           {selectedDateEvents.map((item) => {
            const isReminded = reminders.includes(item.id);
            return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              key={item.id} 
              onClick={() => {
                if (isReminded) {
                  setReminders(prev => prev.filter(id => id !== item.id));
                } else {
                  setReminders(prev => [...prev, item.id]);
                }
              }}
              className={`flex gap-3.5 items-center p-3 rounded-[1.25rem] bg-slate-50 border transition-all hover:bg-slate-100 cursor-pointer ${isReminded ? 'border-rose-200 bg-rose-50' : 'border-slate-100/80 hover:border-slate-200'}`}
            >
              <div className={`w-12 h-12 rounded-[1rem] flex flex-col items-center justify-center shrink-0 border ${isReminded ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-orange-100 border-orange-200 text-orange-600'}`}>
                 <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isReminded ? 'text-rose-600' : 'text-orange-600'}`}>{monthNames[currentMonth].substring(0,3)}</span>
                 <span className={`text-sm font-black ${isReminded ? 'text-rose-700' : 'text-orange-700'}`}>{selectedDate}</span>
              </div>
              <div className="flex-grow min-w-0 pr-1">
                <h5 className="text-[13px] font-extrabold text-slate-800 leading-tight truncate mb-1">{item.title}</h5>
                <p className={`text-[11px] font-medium mt-0.5 line-clamp-1 break-all flex items-center gap-1.5 ${isReminded ? 'text-rose-500' : 'text-slate-500'}`}>
                  {isReminded ? (
                    <svg className="w-3 h-3 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                  ) : (
                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  {item.time || 'Sesuai jadwal'}
                </p>
              </div>
            </motion.div>
            );
           })}
           {selectedDate && selectedDateEvents.length === 0 && (
             <div className="text-center py-6 bg-[#f8fafc] rounded-2xl border border-slate-100/80">
               <div className="w-10 h-10 bg-slate-100/80 rounded-full flex items-center justify-center mx-auto mb-3">
                 <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </div>
               <p className="text-[11px] font-bold text-slate-500">Tidak ada agenda di tanggal ini.</p>
             </div>
           )}
        </div>
      </div>
    </section>
  );
};

const MobileBottomNav = ({ activeTab, onTabChange, user }: { activeTab: string, onTabChange: (tab: string) => void, user: any }) => {
  const isEligible = user?.role === 'admin' || user?.role === 'sekretaris' || user?.role === 'bendahara';
  
  const navItems = [
    { name: 'Beranda', icon: icons.home },
    { name: 'Acara', icon: icons.events },
    ...(isEligible ? [{ name: 'Scan QR', icon: icons.qr }] : []),
    { name: 'Laporan', icon: icons.laporan },
    { name: 'Profil', icon: icons.profil },
  ];

  return (
    <motion.nav 
      initial={{ y: 50 }} 
      animate={{ y: 0 }} 
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      // Efek glassmorphism tebal di bagian bawah
      className="flex justify-around items-center px-1 py-2 pb-6 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 fixed bottom-0 left-0 right-0 z-50 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.name;
        
        return (
          <motion.button 
            key={item.name} 
            whileTap={{ scale: 0.85 }}
            onClick={() => onTabChange(item.name)}
            className={`relative flex flex-col items-center gap-1 transition-all p-2 rounded-2xl w-[68px] ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-500'}`}
          >
            {/* Active Indicator Melayang (Framer Motion Layout Animation) */}
            {isActive && (
              <motion.div 
                layoutId="bottomNavIndicator" 
                className="absolute inset-0 bg-teal-50 rounded-2xl -z-10" 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <motion.div
               animate={isActive ? { y: -2 } : { y: 0 }}
               transition={{ type: "spring", stiffness: 300 }}
            >
               <item.icon className={`w-5.5 h-5.5 ${isActive ? 'drop-shadow-sm' : ''}`} />
            </motion.div>
            <span className={`text-[9px] ${isActive ? 'font-extrabold' : 'font-semibold'} whitespace-nowrap`}>
              {item.name}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

import { MobileMedia } from './MobileMedia';

// --- Simplified Inline Illustrations (as functional components) ---

const IllustrationFamilyGroup = () => (
  <svg viewBox="0 0 200 150" className="w-full h-full object-cover">
    <circle cx="90" cy="50" r="25" fill="#fbc4ac" />
    <circle cx="110" cy="50" r="25" fill="#fbc4ac" />
    <ellipse cx="100" cy="90" rx="60" ry="40" fill={themeColors.accent} />
    <rect x="70" y="80" width="10" height="2" rx="1" fill="#f9dcc4" />
    <rect x="120" y="80" width="10" height="2" rx="1" fill="#f9dcc4" />
    <circle cx="85" cy="65" r="12" fill={themeColors.primary}/>
    <circle cx="115" cy="65" r="12" fill={themeColors.primary}/>
  </svg>
);

const IllustrationCommunityActivity = () => (
  <svg viewBox="0 0 350 200" className="w-full h-full object-cover">
    <rect width="350" height="200" fill="#e0f2f1" />
    <circle cx="175" cy="100" r="90" fill={themeColors.accent} />
    <rect x="150" y="150" width="50" height="10" rx="5" fill="#fbe9e7" />
    <path d="M175 70 Q185 85, 175 100 Q165 85, 175 70" fill={themeColors.primary} />
    <circle cx="190" cy="85" r="10" fill={themeColors.primary}/>
    <circle cx="160" cy="85" r="10" fill={themeColors.primary}/>
  </svg>
);

export const ProfileAvatar = ({ size = '10' }: { size?: string }) => (
  <div className={`w-${size} h-${size} rounded-full bg-gray-200 flex items-center justify-center border-2 border-white overflow-hidden`}>
    <icons.profil className={`w-full h-full text-gray-400 mt-1`} />
  </div>
);

const quickActions = [
  { name: 'Surat', icon: icons.surat, color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
  { name: 'Lapor RT', icon: icons.laporanrt, color: 'from-rose-400 to-red-500', shadow: 'shadow-rose-200' },
  { name: 'Dokumen', icon: icons.dokumen, color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
  { name: 'Notulen Rapat', icon: icons.laporan, color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-200' },
  { name: 'Media', icon: icons.media, color: 'from-purple-400 to-fuchsia-500', shadow: 'shadow-purple-200' },
  { name: 'Iuran', icon: icons.iuran, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
  { name: 'Kas', icon: icons.kas, color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-200' },
  { name: 'Data Warga', icon: icons.warga, color: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-200' },
  { name: 'Sedekah', icon: icons.sedekah, color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-200' },
  { name: 'UMKM', icon: icons.umkm, color: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-200' },
  { name: 'Darurat', icon: icons.darurat, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-200' },
  { name: 'Tamu', icon: icons.warga, color: 'from-sky-400 to-indigo-500', shadow: 'shadow-sky-200' },
  { name: 'Voting', icon: icons.voting, color: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-200' },
  { name: 'Inventaris', icon: icons.inventaris, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-250' },
  { name: 'Smart RT AI', icon: icons.gemini, color: 'from-teal-400 to-cyan-500', shadow: 'shadow-teal-200' },
];

let cachedSaldoResult: any = null;

const MobileSaldoCard = () => {
  const [saldo, setSaldo] = useState(cachedSaldoResult?.saldo || 0);
  const [danaKematian, setDanaKematian] = useState(cachedSaldoResult?.danaKematian || 0);
  const [danaSosial, setDanaSosial] = useState(cachedSaldoResult?.danaSosial || 0);
  const [loading, setLoading] = useState(!cachedSaldoResult);
  
  // State untuk menyembunyikan saldo
  const [isMasked, setIsMasked] = useState(false);

  useEffect(() => {
    setLoading(!cachedSaldoResult);
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.metrics && json.metrics.kasDetail) {
          const detail = json.metrics.kasDetail;
          setSaldo(detail.kasRT);
          setDanaKematian(detail.danaKematian);
          setDanaSosial(detail.danaSosial);
          
          cachedSaldoResult = { saldo: detail.kasRT, danaKematian: detail.danaKematian, danaSosial: detail.danaSosial };
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <section className="px-5 mb-6 mt-0">
      <div className="bg-[#0eb18a] bg-gradient-to-br from-[#10b981] to-[#0eb18a] rounded-[1.5rem] p-5 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white opacity-10 rounded-full translate-x-12 -translate-y-8"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-[0.05] rounded-full translate-x-8 translate-y-8 blur-md"></div>
          
          <div className="flex justify-between items-center mb-1 relative z-10">
            <p className="text-xs font-semibold opacity-90 uppercase tracking-widest">Saldo Kas RT 01</p>
            <div className="flex items-center gap-2">
              {/* Tombol Sembunyikan/Tampilkan Saldo */}
              <button 
                onClick={() => setIsMasked(!isMasked)} 
                className="text-lg focus:outline-none hover:scale-110 active:scale-95 transition-transform drop-shadow-md"
                title={isMasked ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              >
                {isMasked ? '🙈' : '👁️'}
              </button>
              <icons.kas className="w-5 h-5 opacity-80"/>
            </div>
          </div>

          <div className="relative z-10">
            {loading ? (
               <div className="h-8 w-40 bg-white/20 animate-pulse rounded mt-1 mb-1"></div>
            ) : (
               <h3 className="text-3xl font-bold tracking-tight mt-1 mb-2 text-white" style={{ fontFamily: fontStyle }}>
                 {isMasked ? 'Rp •••••••••' : formatter.format(saldo)}
               </h3>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 truncate relative z-10">
            {loading ? (
              <>
                <div className="h-5 w-24 bg-white/20 animate-pulse rounded-full"></div>
                <div className="h-5 w-32 bg-white/20 animate-pulse rounded-full"></div>
              </>
            ) : (
              <>
                <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm font-semibold tracking-wide">
                  Sosial: {isMasked ? 'Rp •••••' : formatter.format(danaSosial)}
                </span>
                <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm font-semibold tracking-wide">
                  Kematian: {isMasked ? 'Rp •••••' : formatter.format(danaKematian)}
                </span>
              </>
            )}
          </div>
      </div>
    </section>
  );
};

const mobileNavItems = [
  { name: 'Beranda', icon: icons.home, active: true },
  { name: 'Acara', icon: icons.events },
  { name: 'Laporan', icon: icons.laporan },
  { name: 'Profil', icon: icons.profil },
];

const MobileProfilPage = ({ user, onLogout, onUpdateUser }: { user: any; onLogout: () => void; onUpdateUser: (data: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.nama || 'Admin RT',
    address: user?.alamat || '',
    phone: user?.noHp || '0812-3456-7890',
    role: user?.role === 'admin' ? 'Ketua RT 01 / RW 21' : (user?.status || 'Warga Tetap'),
    photo: user?.photo || null as string | null,
    umur: user?.umur || '',
    tglLahir: user?.tglLahir || ''
  });

  const parsedBlokMatch = (user?.alamat || '').match(/Blok\s+([a-zA-Z0-9]+)/i);
  const parsedNoMatch = (user?.alamat || '').match(/No\.\s+([a-zA-Z0-9]+)/i);
  const [profileBlok, setProfileBlok] = useState(parsedBlokMatch ? parsedBlokMatch[1] : '');
  const [profileNomor, setProfileNomor] = useState(parsedNoMatch ? parsedNoMatch[1] : '');

  useEffect(() => {
    if (profileBlok || profileNomor) {
      setProfile(prev => ({...prev, address: `Blok ${profileBlok} No. ${profileNomor}`}));
    }
  }, [profileBlok, profileNomor]);

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
  };

  const handleTglLahirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tgl = e.target.value;
    setProfile({...profile, tglLahir: tgl, umur: calculateAge(tgl)});
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, photo: e.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          nama: profile.name,
          alamat: profile.address,
          noHp: profile.phone,
          status: profile.role,
          photo: profile.photo,
          umur: profile.umur
        })
      });
      if (res.ok) {
        onUpdateUser({
           nama: profile.name,
           alamat: profile.address,
           noHp: profile.phone,
           status: profile.role,
           photo: profile.photo,
           umur: profile.umur
        });
        setIsEditing(false);
        setSuccessMsg('✅ Profil berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch(e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordMsg('');
    if (!oldPassword || !newPassword || !confirmPassword) {
       return setPasswordError('Semua field harus diisi');
    }
    if (newPassword !== confirmPassword) {
       return setPasswordError('Password baru dan konfirmasi tidak cocok');
    }
    setSavingPass(true);
    try {
      const res = await apiFetch('/api/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsChangingPass(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('🔒 Password berhasil diganti');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setPasswordError(data.error || 'Gagal mengubah password');
      }
    } catch (e) {
      setPasswordError('Terjadi kesalahan sistem');
    }
    setSavingPass(false);
  };

  // ================= VIEW: UBAH PASSWORD =================
  if (isChangingPass) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 pb-32 min-h-[80vh] bg-slate-50 w-full relative">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setIsChangingPass(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <icons.arrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Keamanan Akun</h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-5">
           <div className="text-center mb-6">
             <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
             </div>
             <h3 className="font-extrabold text-slate-800 text-lg">Buat Password Baru</h3>
             <p className="text-xs text-slate-500 mt-1 font-medium">Gunakan kombinasi yang aman dan mudah diingat.</p>
           </div>

           {passwordError && (
             <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-center">
               {passwordError}
             </div>
           )}

           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Password Lama</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-semibold outline-none transition-all" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Password Baru</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-semibold outline-none transition-all" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Ulangi Password Baru</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-semibold outline-none transition-all" />
           </div>

           <button onClick={handleUpdatePassword} disabled={savingPass} className="w-full mt-4 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]">
             {savingPass ? 'Memproses...' : 'Simpan Password'}
           </button>
        </div>
      </motion.div>
    );
  }

  // ================= VIEW: EDIT PROFIL =================
  if (isEditing) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 pb-32 min-h-screen bg-slate-50 w-full relative">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <icons.arrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Edit Profil</h2>
          <button onClick={handleSave} disabled={saving} className="text-xs text-white bg-teal-600 px-4 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-transform disabled:opacity-50">
            {saving ? '...' : 'Simpan'}
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative">
               {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <ProfileAvatar size="24"/>
               )}
               {/* Overlay Camera Icon on Hover */}
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <icons.media className="w-6 h-6 text-white"/>
               </div>
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 border-2 border-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-teal-700 transition-colors">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Ubah Foto Anda</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Nama Lengkap</label>
               <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all" />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Peran / Status</label>
               <select value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none appearance-none transition-all">
                 <option value="">Pilih Status</option>
                 <option value="Warga Tetap">Warga Tetap</option>
                 <option value="Warga Sementara (Kontrak)">Warga Sementara (Kontrak)</option>
               </select>
            </div>
            <div className="flex gap-3">
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Blok Rumah</label>
                 <select value={profileBlok} onChange={e => setProfileBlok(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none appearance-none transition-all">
                   <option value="">Pilih</option>
                   {['A','B','C','D','E','F','G','H','I','J'].map(b => <option key={b} value={b}>Blok {b}</option>)}
                 </select>
               </div>
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">No. Rumah</label>
                 <input type="text" value={profileNomor} onChange={e => setProfileNomor(e.target.value)} placeholder="Cth: 12" className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Nomor Ponsel</label>
               <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all" />
            </div>
            <div className="flex gap-3">
              <div className="flex-[2]">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Tanggal Lahir</label>
                 <input type="date" value={profile.tglLahir} onChange={handleTglLahirChange} className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all" />
              </div>
              <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5">Umur</label>
                 <input type="text" value={profile.umur ? `${profile.umur} th` : ''} readOnly className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed text-center" placeholder="-" />
              </div>
            </div>
        </div>
      </motion.div>
    );
  }

  // ================= VIEW: PROFIL UTAMA =================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full min-h-screen bg-slate-50 pb-28">
      
      {/* Absolute Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-gradient-to-b from-[#13b097] to-[#0b7c5e] rounded-b-[3rem] shadow-md overflow-hidden">
      </div>

      <div className="relative z-10 px-5 pt-12 flex flex-col items-center">
        {/* Sukses Alert Dinamis */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-2 left-5 right-5 bg-white/90 backdrop-blur-md border border-emerald-100 shadow-xl text-emerald-700 px-4 py-3 rounded-2xl text-sm font-bold text-center z-50">
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profil Avatar (Hero) */}
        <div className="relative">
          <div className="w-[110px] h-[110px] rounded-full border-4 border-white shadow-[0_8px_16px_rgba(0,0,0,0.15)] overflow-hidden bg-[#e9ebed] flex items-center justify-center">
             {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <svg className="w-[80px] h-[80px] text-[#9098a5] mt-4" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4.5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 13c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
             )}
          </div>
          <div className="absolute bottom-[2px] right-[2px] w-6 h-6 bg-[#02df8f] border-2 border-[#098363] rounded-full shadow-sm"></div>
        </div>

        {/* Info Singkat */}
        <div className="text-center mt-4 text-white">
          <h2 className="text-[22px] font-bold tracking-tight drop-shadow-sm">{profile.name}</h2>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
             <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
             <span className="text-xs font-bold uppercase tracking-wider">
               {user?.role === 'admin' 
                 ? 'Ketua RT' 
                 : user?.role === 'bendahara' 
                 ? 'Bendahara' 
                 : user?.role === 'sekretaris' 
                 ? 'Sekretaris' 
                 : user?.role === 'pengurus' 
                 ? 'Pengurus' 
                 : profile.role || 'Warga'}
             </span>
          </div>
        </div>
      </div>

      {/* Konten Data Profil (Kartu Melayang) */}
      <div className="relative z-10 px-5 w-full mt-8">
        
        {/* KARTU WARGA DIGITAL PREMIUM WITH QR CODE & SHARE SHORTCUT */}
        <div className="mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl shadow-xl relative overflow-hidden text-white border border-slate-700/50">
          {/* Subtle design shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-x-12 translate-y-12 blur-2xl"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-teal-400 uppercase">KARTU WARGA DIGITAL</span>
              <h3 className="text-lg font-black tracking-tight mt-1 truncate max-w-[180px]">{profile.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {(user?.id || 'RT01-WARGA').substring(0, 12).toUpperCase()}</p>
            </div>
            {/* RT Logo */}
            <div className="bg-white/10 p-2 rounded-xl border border-white/10 shrink-0">
              <LogoCommunityIcon size="16" colorAccent="#2dd4bf" colorPrimary="#ffffff" />
            </div>
          </div>

          <div className="mt-6 flex gap-4 items-center bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            {/* QR Code Container */}
            <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(JSON.stringify({ id: user?.id, nama: profile.name, alamat: profile.address, status: profile.role }))}`}
                alt="QR Code Warga" 
                className="w-[72px] h-[72px] object-contain"
              />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Verifikasi Warga</p>
              <p className="text-[11px] font-extrabold text-slate-200 mt-1 truncate">{profile.address || 'Alamat RT 01'}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Status: <span className="text-emerald-400 font-bold">{profile.role || 'Warga Tetap'}</span></p>
              
              {/* Share QR Code Button */}
              <button 
                onClick={async () => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ id: user?.id, nama: profile.name, alamat: profile.address }))}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Kartu Warga Digital',
                        text: `Kartu Warga RT 01 atas nama ${profile.name}`,
                        url: qrUrl
                      });
                      setSuccessMsg('✅ Tautan kartu berhasil dibagikan!');
                    } catch (e) {
                      // fallback
                      navigator.clipboard.writeText(qrUrl);
                      setSuccessMsg('📋 Link QR Code disalin ke clipboard!');
                    }
                  } else {
                    navigator.clipboard.writeText(qrUrl);
                    setSuccessMsg('📋 Link QR Code disalin ke clipboard!');
                  }
                  setTimeout(() => setSuccessMsg(''), 3000);
                }}
                className="mt-2.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
              >
                <svg className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.684 10.742l4.135-2.068m0 0a3 3 0 10-4.135-2.068m4.135 2.068v4.135M15.316 13.258l-4.135-2.068m0 0a3 3 0 114.135-2.068" />
                </svg>
                Bagikan QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Cepat */}
        <div className="flex gap-3 mb-6">
           <button onClick={() => setIsEditing(true)} className="flex-1 py-3.5 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-teal-600 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors border border-slate-100">
             <icons.edit className="w-4 h-4"/> Edit Profil
           </button>
           <button onClick={() => setIsChangingPass(true)} className="flex-1 py-3.5 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-slate-700 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors border border-slate-100">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> 
             Password
           </button>
        </div>

        {/* Kartu Informasi Lengkap */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden divide-y divide-slate-50">
          <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <div className="flex-grow min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</p>
               <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{profile.address || 'Belum diatur'}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <div className="flex-grow min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Ponsel</p>
               <p className="text-sm font-extrabold text-slate-800 mt-0.5">{profile.phone || '-'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"/></svg>
            </div>
            <div className="flex-grow min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Umur</p>
               <p className="text-sm font-extrabold text-slate-800 mt-0.5">{profile.umur ? `${profile.umur} Tahun` : 'Belum diatur'}</p>
            </div>
          </div>
        </div>

        {/* Tombol Logout */}
        <button onClick={onLogout} className="w-full mt-6 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-sm font-extrabold transition-colors shadow-sm flex justify-center items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Keluar Aplikasi
        </button>
      </div>

    </motion.div>
  );
};


const MobileSedekah = ({ onBack, user }: { onBack: () => void; user?: any }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLaserPos, setScanLaserPos] = useState(0);
  const [donationAmount, setDonationAmount] = useState<string>('50000');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationMessage, setDonationMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('GoPay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [lastTx, setLastTx] = useState<any | null>(null);

  const fetchRecentDonations = async () => {
    try {
      const res = await apiFetch('/api/data/kas');
      const json = await res.json();
      if (json.data) {
        // Filter those logged as Sedekah/QRIS or related alms
        const filtered = json.data.filter((item: any) => 
          item.type === 'Masuk' && 
          (item.message?.includes('Sedekah') || item.message?.includes('Infaq') || item.message?.includes('QRIS'))
        ).slice(0, 10); // Show top 10
        setRecentDonations(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecentDonations();
  }, []);

  // Simulating laser scan bar movement
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLaserPos(prev => (prev >= 100 ? 0 : prev + 4));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, '')); // Hapus spasi saat disalin
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate scanner detecting code in 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      // Auto scroll or set focus
    }, 2000);
  };

  const handleDonateSubmit = async () => {
    const finalAmount = customAmount ? parseInt(customAmount, 10) : parseInt(donationAmount, 10);
    if (!finalAmount || finalAmount < 1000) {
      alert('Jumlah donasi minimal adalah Rp 1.000');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/sedekah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rt-id': localStorage.getItem('rtId') || 'rt01'
        },
        body: JSON.stringify({
          name: isAnonymous ? 'Hamba Allah' : (user?.nama || 'Warga'),
          amount: finalAmount,
          message: donationMessage,
          paymentMethod: paymentMethod
        })
      });

      if (res.ok) {
        const json = await res.json();
        setLastTx({
          id: json.item?.id || 'TX' + Math.floor(Math.random() * 90000 + 10000),
          amount: finalAmount,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          paymentMethod,
          name: isAnonymous ? 'Hamba Allah' : (user?.nama || 'Warga'),
          message: donationMessage
        });
        setPaymentSuccess(true);
        // Reset form
        setCustomAmount('');
        setDonationMessage('');
        fetchRecentDonations();
      } else {
        const err = await res.json();
        alert(err.error || 'Terjadi kesalahan saat memproses donasi.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyambungkan ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankAccounts = [
    {
      id: 'bsi',
      bankName: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '712 345 6789',
      owner: 'a.n DKM Masjid Al Ikhlas',
      themeText: 'text-emerald-700',
      themeBg: 'bg-emerald-50',
    },
    {
      id: 'mandiri',
      bankName: 'Bank Mandiri',
      accountNumber: '137 00 1234567 8',
      owner: 'a.n DKM Masjid Al Ikhlas',
      themeText: 'text-blue-700',
      themeBg: 'bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 pb-28 font-sans">
      {/* Header & Back Button */}
      <div className="flex flex-col mb-6 space-y-3">
        <button
          onClick={onBack}
          className="w-fit text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
        <h3 className="font-extrabold text-gray-900 text-xl tracking-tight flex items-center gap-2">
          <span>Sedekah & Infaq</span>
          <span className="text-rose-500 animate-pulse">❤️</span>
        </h3>
        <p className="text-gray-500 text-xs">Salurkan donasi terbaik Anda untuk operasional dan kemakmuran Masjid Al Ikhlas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: QRIS Scanner & Fast Donation Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card QRIS Scanner / Interactive Hub */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

            <div className="flex items-center justify-between gap-2 mb-4 z-10 relative">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-800 text-sm tracking-wide">Pindai / Bayar QRIS</h4>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">QRIS Dinamis</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">NMID: ID1234567890</span>
            </div>

            {/* QRIS Layout Frame */}
            <div className="flex flex-col items-center justify-center py-4 z-10 relative">
              
              {isScanning ? (
                /* Interactive QRIS Camera Scanner Simulator */
                <div className="relative w-52 h-52 bg-slate-950 rounded-2xl p-1 shadow-2xl border border-teal-500 mb-4 overflow-hidden flex flex-col items-center justify-center">
                  {/* Glowing Scanner Target corners */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl-md"></div>
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr-md"></div>
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl-md"></div>
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br-md"></div>
                  
                  {/* Moving scanning line */}
                  <div 
                    className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_2px_rgba(20,184,166,0.8)] z-20"
                    style={{ top: `${scanLaserPos}%` }}
                  ></div>

                  {/* Matrix digital abstract background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_2s_infinite]"></div>
                  
                  {/* Scanning Status Text */}
                  <div className="z-10 flex flex-col items-center gap-1.5">
                    <svg className="w-10 h-10 text-teal-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4H15" />
                    </svg>
                    <span className="text-teal-400 font-mono text-[9px] font-bold tracking-widest uppercase">MENGHUBUNGKAN KAMERA...</span>
                  </div>
                </div>
              ) : (
                /* Static Admin QRIS Display / Static QR Layout */
                <div className="relative w-52 h-52 bg-white rounded-2xl p-2.5 shadow-md border border-gray-100 mb-4 flex items-center justify-center transition-transform hover:scale-[1.01] group">
                  {/* Grid overlay corners */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-500 rounded-br-lg"></div>

                  {/* Clean SVG QR Code */}
                  <svg className="w-full h-full text-gray-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code Anchor Blocks (Top-Left, Top-Right, Bottom-Left) */}
                    <rect x="5" y="5" width="25" height="25" fill="#0f766e" rx="2" />
                    <rect x="10" y="10" width="15" height="15" fill="white" rx="1" />
                    <rect x="13" y="13" width="9" height="9" fill="#14b8a6" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f766e" rx="2" />
                    <rect x="75" y="10" width="15" height="15" fill="white" rx="1" />
                    <rect x="78" y="13" width="9" height="9" fill="#14b8a6" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f766e" rx="2" />
                    <rect x="10" y="75" width="15" height="15" fill="white" rx="1" />
                    <rect x="13" y="78" width="9" height="9" fill="#14b8a6" />

                    {/* QR Code Scattered Pixel Blocks Simulation */}
                    <rect x="35" y="10" width="5" height="5" />
                    <rect x="45" y="5" width="10" height="5" />
                    <rect x="40" y="15" width="5" height="10" />
                    <rect x="50" y="20" width="5" height="5" />
                    <rect x="60" y="10" width="5" height="15" />
                    <rect x="35" y="30" width="10" height="5" />
                    <rect x="50" y="30" width="5" height="10" />
                    <rect x="10" y="35" width="5" height="10" />
                    <rect x="25" y="40" width="5" height="5" />
                    <rect x="5" y="50" width="10" height="5" />
                    <rect x="20" y="55" width="5" height="10" />
                    <rect x="35" y="45" width="15" height="5" />
                    <rect x="45" y="55" width="5" height="5" />
                    <rect x="55" y="40" width="10" height="10" />
                    <rect x="70" y="35" width="5" height="15" />
                    <rect x="80" y="45" width="15" height="5" />
                    <rect x="90" y="35" width="5" height="5" />
                    <rect x="35" y="65" width="5" height="10" />
                    <rect x="45" y="70" width="10" height="5" />
                    <rect x="40" y="80" width="15" height="5" />
                    <rect x="50" y="90" width="5" height="5" />
                    <rect x="65" y="60" width="5" height="15" />
                    <rect x="60" y="80" width="5" height="10" />
                    <rect x="75" y="65" width="15" height="5" />
                    <rect x="85" y="75" width="5" height="15" />
                    <rect x="70" y="85" width="10" height="5" />
                    
                    {/* Small QRIS style badge in center */}
                    <rect x="38" y="38" width="24" height="24" fill="white" rx="3" stroke="#0f766e" strokeWidth="2" />
                    <text x="50" y="52" fontSize="7" fontWeight="black" textAnchor="middle" fill="#0f766e" fontFamily="sans-serif">QRIS</text>
                  </svg>
                  
                  {/* Subtle Scan Overlay Instruction on Hover */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl p-4">
                    <span className="text-[10px] font-black text-white bg-teal-600 px-3 py-1.5 rounded-lg shadow-md tracking-wider">PINDAI INSTAN</span>
                  </div>
                </div>
              )}

              {/* Scan Trigger Button */}
              {!isScanning && (
                <button
                  onClick={handleStartScan}
                  className="px-4 py-2 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 font-extrabold rounded-full transition flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer mb-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Gunakan Kamera Pindai
                </button>
              )}

              <p className="text-xs font-bold text-gray-800 uppercase mt-2">DKM MASJID AL IKHLAS</p>
              <p className="text-[10px] text-gray-500 mt-1 max-w-xs text-center leading-normal">
                QRIS resmi rukun tetangga & masjid. Silakan pindai langsung dengan aplikasi pembayaran Anda atau gunakan formulir otomatis di bawah.
              </p>
            </div>
          </div>

          {/* Core Interactive Fast Donation Form */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <h4 className="font-extrabold text-gray-800 text-sm tracking-wide border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              Formulir Sedekah & Infaq Online
            </h4>

            {/* Donation Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Pilih Nominal Infaq</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['10000', '25000', '50000', '100000', '200000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDonationAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all text-center
                      ${donationAmount === amt && !customAmount
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                        : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                      }`}
                  >
                    Rp {parseInt(amt, 10).toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Atau Masukkan Nominal Kustom</label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-extrabold text-xs">Rp</span>
                </div>
                <input
                  type="number"
                  placeholder="Atau isi nominal bebas di sini..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setDonationAmount('');
                  }}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Sembunyikan Identitas (Anonim)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Tampilkan kontribusi Anda sebagai "Hamba Allah" di papan donatur.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Doa / Prayer message */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Tulis Niat Mulia / Doa Anda</label>
              <textarea
                rows={2}
                placeholder="Tulis doa atau niat baik Anda (misal: Semoga barokah bagi keluarga, kelancaran rezeki, dll)..."
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            {/* Payment channel selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Pilih Metode E-Wallet / Bank</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1
                      ${paymentMethod === method
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                      }`}
                  >
                    {/* Tiny visual representation of branding */}
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block shrink-0"></span>
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDonateSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-teal-100 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4H15" />
                  </svg>
                  MEMPROSES DONASI...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  DONASI SEKARANG (Rp {(customAmount ? parseInt(customAmount, 10) : parseInt(donationAmount, 10) || 0).toLocaleString('id-ID')})
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Recent Donations feed & Manual bank Transfer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent Live Donors Feed */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-gray-800 text-sm tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                Papan Donatur Masjid
              </h4>
              <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Aktif</span>
            </div>

            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {recentDonations.length > 0 ? (
                recentDonations.map((item, index) => (
                  <div key={item.id || index} className="flex gap-3 items-start bg-gray-50/50 p-3 rounded-2xl border border-gray-100 hover:border-teal-200 transition-colors">
                    {/* User Profile circle placeholder */}
                    <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {item.name ? item.name.substring(0, 2).toUpperCase() : 'HA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="font-extrabold text-xs text-gray-900 truncate">{item.name || 'Hamba Allah'}</p>
                        <span className="font-mono font-black text-teal-600 text-xs shrink-0">
                          +Rp {item.amount?.toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {/* Message prayer */}
                      {item.message && (
                        <p className="text-[10px] text-gray-500 italic mt-1 bg-white p-1.5 rounded-lg border border-gray-100 leading-normal font-medium">
                          "{item.message.replace(/\[Sedekah QRIS - [a-zA-Z]+\]\s*/g, '')}"
                        </p>
                      )}

                      <p className="text-[9px] text-gray-400 font-bold mt-1.5 font-mono">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • QRIS
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-extrabold text-gray-400">Belum ada donasi hari ini</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Pahala terus mengalir bagi yang bersedekah pertama.</p>
                </div>
              )}
            </div>
          </div>

          {/* Manual Transfer Option */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-gray-800 text-sm mb-1 px-1">Transfer Bank Manual</h4>
            
            {bankAccounts.map((bank) => (
              <div key={bank.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Ikon Bank */}
                    <div className={`w-10 h-10 ${bank.themeBg} ${bank.themeText} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1 font-medium">{bank.bankName}</p>
                      <p className="font-extrabold text-gray-900 text-sm tracking-wide">{bank.accountNumber}</p>
                      <p className={`text-[10px] font-bold ${bank.themeText} mt-1.5 inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded`}>
                        {bank.owner}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Salin */}
                  <button
                    onClick={() => handleCopy(bank.accountNumber, bank.id)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0
                      ${copiedId === bank.id 
                        ? 'bg-green-500 text-white shadow-sm shadow-green-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-100'
                      }`}
                  >
                    {copiedId === bank.id ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Tersalin
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* POPUP / MODAL PAYMENT SUCCESS RECEIPT */}
      <AnimatePresence>
        {paymentSuccess && lastTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentSuccess(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border border-teal-100 shadow-2xl max-w-sm w-full relative z-10 p-6 space-y-5 text-center overflow-hidden"
            >
              {/* Confetti element */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500"></div>
              
              {/* Animated check circle */}
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <svg className="w-8 h-8 animate-[bounce_1s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="font-black text-gray-900 text-lg">Infaq/Sedekah Diterima!</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Metode: {lastTx.paymentMethod}</p>
              </div>

              {/* Receipt Body */}
              <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 font-mono space-y-2.5">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>No. Transaksi</span>
                  <span className="font-bold text-gray-800">{lastTx.id}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Donatur</span>
                  <span className="font-bold text-gray-800">{lastTx.name}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Tanggal</span>
                  <span className="font-bold text-gray-800">{lastTx.date}</span>
                </div>
                {lastTx.message && (
                  <div className="text-[10px] text-gray-400 border-t border-dashed border-gray-200 pt-2 text-center">
                    <p className="font-sans italic text-gray-600">"{lastTx.message}"</p>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-700">TOTAL DONASI</span>
                  <span className="text-sm font-black text-teal-600">Rp {lastTx.amount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 font-bold leading-normal">
                "Jazakumullahu khairan katsiran. Semoga infaq/sedekah Anda menjadi amal jariyah yang berlipat ganda."
              </div>

              <button
                onClick={() => setPaymentSuccess(false)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Kembali ke Alms
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const BroadcastModalView = ({ onClose, onSuccess, user }: { onClose: () => void, onSuccess: () => void, user: any }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return console.log("Pesan tidak boleh kosong");
    setLoading(true);
    try {
       const res = await apiFetch('/api/broadcast', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ title, message, updaterName: user?.nama || 'Admin' })
       });
       if(res.ok) {
         onSuccess();
         onClose();
       } else {
         console.log("Gagal mengirim pesan broadcast.");
       }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
       <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 font-bold bg-gray-50 p-2 rounded-full hover:bg-gray-100">X</button>
       <h2 className="text-xl font-extrabold text-gray-800 mb-2">Kirim Broadcast</h2>
       <p className="text-xs text-gray-500 mb-5">Pesan ini akan dikirimkan sebagai Notifikasi ke seluruh warga yang terdaftar.</p>
       
       <form onSubmit={handleSend} className="space-y-4">
         <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Judul Pengumuman</label>
            <input 
              type="text" 
              placeholder="Contoh: Info Kerja Bakti"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
         </div>
         <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Isi Pesan</label>
            <textarea 
              rows={4} 
              placeholder="Tulis pesan pengumuman..."
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              required
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
         </div>
         <button 
           type="submit" 
           disabled={loading}
           className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
         >
           {loading ? 'Mengirim...' : (
             <>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               Kirim Pesan ke Semua Warga
             </>
           )}
         </button>
       </form>
    </div>
  );
};

// --- Main Combined View ---
function MainApp({ user: originalUser, onLogout, onUpdateUser }: { user: any; onLogout: () => void; onUpdateUser: (updatedData: any) => void }) {
  const [activeWebTab, setActiveWebTab] = useState('Dashboard');
  const [activeMobileTab, setActiveMobileTab] = useState('Beranda');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch(e) {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch(e) {}
      return next;
    });
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedSuratId, setSelectedSuratId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const prevNotifIds = React.useRef<Set<string>>(new Set());
  const isInitialLoad = React.useRef(true);

  const [menuPermissions, setMenuPermissions] = useState<any[]>([]);
  const [developerStats, setDeveloperStats] = useState<{ onlineCount: number; registeredCount: number }>({ onlineCount: 0, registeredCount: 0 });
  const [rtList, setRtList] = useState<{rtId: string, totalUsers: number, isVip: boolean}[]>([]);

  const fetchDeveloperStats = async () => {
    if (originalUser?.role !== 'developer') return;
    try {
      const res = await apiFetch('/api/developer/stats');
      if (res.ok) {
        const json = await res.json();
        setDeveloperStats({
          onlineCount: json.onlineCount || 0,
          registeredCount: json.registeredCount || 0
        });
      }
      const rtRes = await apiFetch('/api/developer/rt');
      if (rtRes.ok) {
        const json = await rtRes.json();
        setRtList(json.data || []);
      }
    } catch (e) {
      console.error("Gagal mengambil stats developer", e);
    }
  };

  const fetchMenuPermissions = async () => {
    try {
      const res = await apiFetch('/api/menu-permissions');
      if (res.ok) {
        const json = await res.json();
        setMenuPermissions(json.data || []);
      }
    } catch (e) {
      console.error("Gagal mengambil menu permissions", e);
    }
  };

  const fallbackPermissions: { [key: string]: string[] } = {
    developer: ['Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Tamu', 'Inventaris', 'Smart RT AI', 'Pengaturan', 'Akses Menu'],
    admin: ['Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Tamu', 'Inventaris', 'Smart RT AI', 'Pengaturan'],
    sekretaris: ['Dashboard', 'Warga', 'Surat Online', 'Dokumen', 'Notulen Rapat', 'Pengumuman', 'Media', 'Inventaris', 'Pengaturan'],
    bendahara: ['Dashboard', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Pengaturan'],
    pengurus: ['Dashboard', 'Warga', 'Dokumen', 'Laporan', 'Pengumuman', 'Media', 'Inventaris', 'Pengaturan'],
    warga: []
  };

  const userRole = originalUser?.role || 'warga';
  const rolePermission = menuPermissions.find(p => p.role === userRole);
  let allowedMenus = rolePermission ? rolePermission.allowedMenus : (fallbackPermissions[userRole] || fallbackPermissions.warga);
  
  const vipMenus = ['Notulen Rapat', 'Voting', 'Inventaris', 'Smart RT AI', 'UMKM', 'UMKM Warga'];
  
  // Semua role bisa melihat menu, list master menu yang ada
  const allAppMenus = [
    'Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 
    'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Tamu', 'Inventaris', 
    'Smart RT AI', 'Pengaturan'
  ];
  if (userRole === 'developer') {
    allAppMenus.push('Akses Menu');
  }

  // Filter visible menus hanya berdasarkan VIP (kecuali developer yang bisa lihat semua)
  const visibleMenus = allAppMenus.filter(m => {
    if (userRole === 'developer') return true;
    if (vipMenus.includes(m) && !originalUser?.isVip) return false;
    return true;
  });

  // Inject allowedMenus ke user object agar bisa diakses komponen children untuk Edit/Delete
  const user = { ...originalUser, allowedMenus };

  useEffect(() => {
    if (visibleMenus && visibleMenus.length > 0 && !visibleMenus.includes(activeWebTab)) {
      setActiveWebTab(visibleMenus[0]);
    }
  }, [visibleMenus, activeWebTab]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      const data = await res.json();
      const newNotifs = data.notifications || [];

      if ("Notification" in window && Notification.permission === "granted" && !isInitialLoad.current) {
        newNotifs.forEach((n: any) => {
          if (!n.read && !prevNotifIds.current.has(n.id)) {
             const title = n.title || 'Guyub Rukun';
             const options = {
                 body: n.message,
                 icon: '/icon-192.png',
                 badge: '/icon-192.png',
                 vibrate: [200, 100, 200]
             };
             
             if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                   registration.showNotification(title, options);
                }).catch(() => {
                   new Notification(title, options);
                });
             } else {
                new Notification(title, options);
             }

             try {
                const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
                audio.play().catch(e => console.log('Autoplay blocked:', e));
             } catch (e) {}
          }
        });
      }

      prevNotifIds.current = new Set(newNotifs.map((n: any) => n.id));
      isInitialLoad.current = false;
      setNotifications(newNotifs);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    fetchNotifications();
    fetchMenuPermissions();
    fetchDeveloperStats();
    
    const source = new EventSource('/api/stream');
    source.addEventListener('update', (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notifications') {
        fetchNotifications();
      }
      if (data.type === 'menu_permissions') {
        fetchMenuPermissions();
      }
      if (data.type === 'online_status') {
        fetchDeveloperStats();
      }
      window.dispatchEvent(new CustomEvent('app_data_update', { detail: data.type }));
    });
    
    return () => source.close();
  }, []);

  const handleShowNotifications = async () => {
    setShowNotifications(true);
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    try {
      await apiFetch('/api/notifications/read', { method: 'POST' });
    } catch(e) { console.error(e) }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" style={{ fontFamily: fontStyle }}>
      
      {!isMobile && (
        <div className="fixed inset-0 z-0 opacity-[0.03] flex items-center justify-center p-20 pointer-events-none md:flex hidden">
          <IllustrationFamilyGroup/>
        </div>
      )}

      {/* --- DESKTOP ADMIN VIEW --- */}
      {!isMobile ? (
      <div className="hidden md:flex relative z-10 w-full h-full">
        <WebSidebar activeTab={activeWebTab} onTabChange={setActiveWebTab} visibleMenus={visibleMenus} isCollapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
          <WebHeader 
            user={user} 
            onLogout={onLogout} 
            onUpdateUser={onUpdateUser} 
            notifications={notifications} 
            onShowNotifications={handleShowNotifications} 
            onOpenBroadcast={() => setShowBroadcastModal(true)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            onNotificationClick={(n) => {
               console.log(`Dibuat/Diupdate oleh: ${n.updaterName || 'Sistem'}\n\nModul: ${n.resource || 'Umum'}\n\n${n.message}`);
               if (n.resource) {
                  const mod = n.resource.charAt(0).toUpperCase() + n.resource.slice(1);
                  if (n.resource === 'surat') {
                     setSelectedSuratId(n.resourceId || null);
                  }
                  setActiveWebTab(mod === 'Warga' ? 'Warga' : mod === 'Surat' ? 'Surat Online' : mod);
                  setActiveMobileTab(mod === 'Warga' ? 'Data Warga' : mod === 'Surat' ? 'Surat' : mod);
               }
            }}
          />
          <main className={`flex-grow p-4 lg:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-20 lg:ml-[16rem]'}`} style={{ backgroundColor: themeColors.neutral.bg }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWebTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full h-full"
              >
                {!user.isApproved ? (
                  <div className="flex flex-col items-center justify-center p-12 mt-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
                    <icons.dokumen className="w-20 h-20 text-gray-300 mb-6" />
                    <h2 className="text-2xl font-bold text-teal-600 mb-3">Akun Belum Aktif</h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">Akun Anda sedang diverifikasi atau dinonaktifkan oleh Ketua RT. Harap hubungi Ketua RT untuk akses fitur dalam aplikasi.</p>
                    <button onClick={() => window.open(`https://wa.me/`, '_blank')} className="px-8 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-teal-700 transition">Hubungi Pengurus / RT</button>
                  </div>
                ) : activeWebTab === 'Dashboard' ? (
                  <>
                    <WebDashboardRtView/>
                    <div className="px-6 pb-6">
                      <WebMediaSlider/>
                    </div>
                  </>
                ) : (
                  <>
                    {user.isApproved && activeWebTab === 'Warga' && <WebWargaPage user={user} />}
                    {user.isApproved && activeWebTab === 'Iuran' && <WebIuranPage user={user} />}
                    {user.isApproved && activeWebTab === 'Kas' && <WebKasPage user={user} />}
                    {user.isApproved && activeWebTab === 'Surat Online' && (
                      <WebSuratOnlinePage 
                        user={user} 
                        hittedSuratId={selectedSuratId} 
                        clearHighlight={() => setSelectedSuratId(null)} 
                      />
                    )}
                    {user.isApproved && activeWebTab === 'Dokumen' && <WebDokumenPage user={user} onUpdateUser={onUpdateUser} />}
                    {user.isApproved && activeWebTab === 'Laporan' && <WebLaporanPage user={user} />}
                    {user.isApproved && activeWebTab === 'Notulen Rapat' && <WebNotulenPage user={user} />}
                    {user.isApproved && activeWebTab === 'Pengumuman' && <WebPengumumanPage user={user} />}
                    {user.isApproved && activeWebTab === 'Media' && <WebMediaPage user={user} />}
                    {user.isApproved && activeWebTab === 'UMKM' && <WebUMKMPage user={user} />}
                    {user.isApproved && activeWebTab === 'Tamu' && <WebTamuPage user={user} />}
                    {user.isApproved && activeWebTab === 'Inventaris' && <WebInventarisPage user={user} />}
                    {user.isApproved && activeWebTab === 'Smart RT AI' && <WebSmartRtAiPage user={user} />}
                    {user.isApproved && activeWebTab === 'Akses Menu' && <WebMenuAccessPage user={user} />}
                    {user.isApproved && activeWebTab === 'Pengaturan' && <WebPengaturanPage user={user} onLogout={onLogout} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      ) : (
      <div className="flex md:hidden relative z-20 w-full h-full bg-white flex-col overflow-hidden">
        {/* --- MOBILE USER VIEW --- */}
        <MobileHeader notifications={notifications} onShowNotifications={handleShowNotifications} />
        <MobileProfile user={user} onClick={() => setActiveMobileTab('Profil')} />
        <div className="flex-grow overflow-hidden bg-white relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeMobileTab}
              initial={activeMobileTab === 'Profil' ? { opacity: 0, y: "100%" } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={activeMobileTab === 'Profil' ? { opacity: 0, y: "100%" } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="h-full overflow-y-auto pb-24 relative"
            >
              {activeMobileTab === 'Profil' ? (
                <MobileProfilPage user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />
              ) : !user.isApproved ? (
                <div className="flex flex-col items-center justify-center p-8 mt-20 text-center">
                  <icons.dokumen className="w-16 h-16 text-gray-300 mb-4" />
                  <h2 className="text-lg font-bold text-teal-600 mb-2">Akun Belum Aktif</h2>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mb-6">Akun Anda sedang diverifikasi atau dinonaktifkan oleh Ketua RT. Harap hubungi Ketua RT untuk akses fitur warga.</p>
                  <button onClick={() => window.open(`https://wa.me/`, '_blank')} className="w-full max-w-[200px] py-3 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-teal-700 transition">Hubungi Pengurus / RT</button>
                </div>
              ) : (
                <>
                  {activeMobileTab === 'Beranda' && (
                    <>
                      <section className="px-4 mb-4 mt-2 relative z-10 transition-all hidden">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-sm border border-gray-100">
                          <icons.home className="w-5 h-5 text-gray-400" />
                          <input type="text" placeholder="Search for actions..." className="text-xs text-gray-700 flex-grow outline-none bg-transparent" />
                          <ProfileAvatar size="8" />
                        </div>
                      </section>
                      <MobileVotingNotification onActionClick={setActiveMobileTab} notifications={notifications} />
                      <MobileSaldoCard/>
                      {user?.role === 'developer' && (
                        <div className="mx-4 mb-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-950/30 text-left relative overflow-hidden">
                          {/* Ambient radial overlay */}
                          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                            <svg className="w-32 h-32 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-0.5">
                              <span className="bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                                Developer Dashboard
                              </span>
                              <h4 className="text-xs font-bold text-indigo-200">System Monitoring</h4>
                            </div>
                            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Server
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {/* Counter 1: Users Registered */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                              <span className="text-[10px] text-indigo-300 font-medium block mb-1">User Terdaftar</span>
                              <div className="text-xl font-black text-white tracking-tight flex items-baseline gap-1">
                                {developerStats.registeredCount}
                                <span className="text-[9px] font-normal text-indigo-200/60">warga</span>
                              </div>
                            </div>
                            {/* Counter 2: Users Logged In */}
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                              <span className="text-[10px] text-indigo-300 font-medium block mb-1">User Sedang Login</span>
                              <div className="text-xl font-black text-indigo-400 tracking-tight flex items-baseline gap-1">
                                {developerStats.onlineCount}
                                <span className="text-[9px] font-normal text-indigo-300/60">aktif</span>
                              </div>
                            </div>
                          </div>

                          {/* RT Subscriptions */}
                          <div className="mt-4 border-t border-indigo-500/20 pt-4">
                            <h4 className="text-xs font-bold text-indigo-200 mb-3 block">Kelola Berlangganan VIP RT</h4>
                            <div className="flex flex-col gap-2">
                              {rtList.length > 0 ? rtList.map(r => (
                                <div key={r.rtId} className="flex flex-row items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-xl">
                                  <div>
                                    <div className="text-xs font-bold text-white uppercase">{r.rtId}</div>
                                    <div className="text-[10px] text-indigo-300/70">{r.totalUsers} Warga</div>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      const res = await apiFetch(`/api/developer/rt/${r.rtId}/vip`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isVip: !r.isVip })
                                      });
                                      if(res.ok) fetchDeveloperStats();
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${r.isVip ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-white/5 border-white/10 text-white/50'}`}
                                  >
                                    {r.isVip ? 'VIP Aktif' : 'VIP Nonaktif'}
                                  </button>
                                </div>
                              )) : (
                                <div className="text-[10px] text-indigo-300/60 text-center py-2">Belum ada data RT.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <MobileQuickActions onActionClick={setActiveMobileTab} visibleMenus={visibleMenus}/>
                      <MobileUMKMAds />
                      <MobileEvents onActionClick={setActiveMobileTab} />
                    </>
                  )}

                  {activeMobileTab === 'Voting' && <MobileVoting currentUser={user} onBack={() => setActiveMobileTab('Beranda')} />}
                  {activeMobileTab === 'Acara' && <MobileAcaraPage currentUser={user} />}
                  {activeMobileTab === 'Scan QR' && <MobileScanQR onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Laporan' && <MobileLaporan onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Surat' || activeMobileTab === 'Surat Pengantar' ? (
                    <MobileSuratPengantar 
                      onBack={() => setActiveMobileTab('Beranda')} 
                      currentUser={user} 
                      hittedSuratId={selectedSuratId}
                      clearHighlight={() => setSelectedSuratId(null)}
                    />
                  ) : null}
                  {activeMobileTab === 'Iuran' && <MobileIuran onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Kas' && <MobileKas onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Sedekah' && <MobileSedekah onBack={() => setActiveMobileTab('Beranda')} user={user} />}
                  {activeMobileTab === 'UMKM' || activeMobileTab === 'UMKM Warga' ? <MobileUMKM onBack={() => setActiveMobileTab('Beranda')} currentUser={user} /> : null}
                  {activeMobileTab === 'Lapor RT' && <MobileLaporRT onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Data Warga' && <MobileDataWarga onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Media' && <MobileMedia onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Darurat' && <MobileDarurat onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                  {activeMobileTab === 'Dokumen' && <MobileDokumen onBack={() => setActiveMobileTab('Beranda')} currentUser={user} onUpdateUser={onUpdateUser} />}
                   {activeMobileTab === 'Tamu' && <MobileTamu onBack={() => setActiveMobileTab('Beranda')} currentUser={user} />}
                   {activeMobileTab === 'Inventaris' && (
                     <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                       <button className="flex items-center gap-2 mb-4 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full outline-none pointer-events-auto cursor-pointer" onClick={() => setActiveMobileTab('Beranda')}>
                         <icons.arrowLeft className="w-4 h-4" /> Kembali ke Beranda
                       </button>
                       <WebInventarisPage user={user} />
                     </div>
                   )}
                   {activeMobileTab === 'Notulen Rapat' && (
                     <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                       <button className="flex items-center gap-2 mb-4 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full outline-none pointer-events-auto cursor-pointer" onClick={() => setActiveMobileTab('Beranda')}>
                         <icons.arrowLeft className="w-4 h-4" /> Kembali ke Beranda
                       </button>
                       <WebNotulenPage user={user} />
                     </div>
                   )}
                  {activeMobileTab === 'Smart RT AI' && (
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                      <button className="flex items-center gap-2 mb-4 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full outline-none pointer-events-auto cursor-pointer" onClick={() => setActiveMobileTab('Beranda')}>
                        <icons.arrowLeft className="w-4 h-4" /> Kembali ke Beranda
                      </button>
                      <WebSmartRtAiPage user={user} />
                    </div>
                  )}

                  {/* Fallback for unrecognized tabs */}
                  {!['Beranda', 'Acara', 'Scan QR', 'Laporan', 'Surat', 'Surat Pengantar', 'Iuran', 'Kas', 'Sedekah', 'UMKM Warga', 'UMKM', 'Lapor RT', 'Data Warga', 'Media', 'Darurat', 'Dokumen', 'Tamu', 'Inventaris', 'Smart RT AI', 'Notulen Rapat'].includes(activeMobileTab) && (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
                      <icons.dashboard className="w-12 h-12 text-gray-300 mb-3" />
                      <h2 className="text-lg font-semibold text-gray-500">Halaman {activeMobileTab}</h2>
                      <p className="text-xs text-gray-400 mb-4">Fitur ini dalam pengembangan.</p>
                      <button className="px-4 py-2 border rounded-full text-xs text-gray-600" onClick={() => setActiveMobileTab('Beranda')}>Kembali</button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <MobileBottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} user={user} />
        
        {showNotifications && (
          <div className="absolute inset-0 bg-black/50 z-50 flex justify-end flex-col">
            <div className="bg-white rounded-t-3xl min-h-[50%] max-h-[80%] flex flex-col">
               <div className="flex justify-between items-center p-5 border-b border-gray-100">
                   <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800">Notifikasi</h3>
                    {user?.allowedMenus?.includes('Pengumuman') && (
                       <button onClick={() => { setShowNotifications(false); setShowBroadcastModal(true); }} className="text-[10px] uppercase font-bold text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1 rounded-full shadow-sm">Kirim Broadcast</button>
                    )}
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 font-bold p-2 bg-gray-50 rounded-full">X</button>
               </div>
               <div className="overflow-y-auto p-4 space-y-3 pb-8">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                         console.log(`Dibuat/Diupdate oleh: ${n.updaterName || 'Sistem'}\n\nModul: ${n.resource || 'Umum'}\n\n${n.message}`);
                         if (n.resource && typeof setActiveMobileTab === 'function') {
                            const resLower = n.resource.toLowerCase();
                            if (resLower === 'surat') {
                               setSelectedSuratId(n.resourceId || null);
                               setActiveWebTab('Surat Online');
                               setActiveMobileTab('Surat');
                            } else if (resLower === 'warga') {
                               setActiveWebTab('Warga');
                               setActiveMobileTab('Data Warga');
                            } else {
                               const mod = n.resource.charAt(0).toUpperCase() + n.resource.slice(1);
                               setActiveWebTab(mod);
                               setActiveMobileTab(mod);
                            }
                         }
                         setShowNotifications(false);
                      }}
                      className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                       <div className="p-2 bg-teal-50 text-teal-600 rounded-full shrink-0">
                         <icons.bell className="w-4 h-4"/>
                       </div>
                       <div>
                         <h5 className="text-xs font-bold text-gray-800">{n.title}</h5>
                         <p className="text-[10px] text-gray-600 mt-0.5">{n.message}</p>
                         <span className="text-[8px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                           {new Date(n.time || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           <span>•</span>
                           <span className="text-teal-600 font-bold capitalize">{n.updaterName || 'Sistem'}</span>
                         </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
      )}

      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <BroadcastModalView 
              user={user} 
              onClose={() => setShowBroadcastModal(false)} 
              onSuccess={() => {
                 fetchNotifications();
                 console.log("Broadcast berhasil dikirim ke semua warga!");
              }} 
           />
        </div>
      )}
    </div>
  );
}

import { Login, Register, CuteMascot } from './Auth';

const RtSelection = ({ onSelectRt }: { onSelectRt: (rt: string) => void }) => {
  const rts = ['RT 01', 'RT 02', 'RT 03'];
  const [selected, setSelected] = useState('');

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-teal-900/10 relative overflow-hidden border border-teal-50">
      {/* Decorative background shapes */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative text-center mb-10 mt-4">
        {/* Logo or Icon */}
        <CuteMascot />
        
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Sistem Warga
        </h2>
        <p className="text-base text-slate-500 font-medium mt-3 leading-relaxed">
          Silakan pilih lingkungan Rukun Tetangga (RT) Anda di <span className="text-teal-600 font-bold">RW 21</span>
        </p>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Pilih Rukun Tetangga</label>
        <div className="relative">
          <select 
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full pl-5 pr-12 py-4 bg-slate-50 border-2 border-slate-200 hover:border-teal-300 focus:border-teal-500 rounded-2xl text-base font-semibold text-slate-800 transition-all appearance-none focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer"
          >
            <option value="" disabled>-- Pilih RT Anda --</option>
            {rts.map(rt => (
              <option key={rt} value={rt.toLowerCase().replace(' ', '')}>{rt}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          if(selected) onSelectRt(selected);
        }}
        disabled={!selected}
        className="w-full mt-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl text-base font-bold shadow-xl shadow-teal-500/20 hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 transition-all flex items-center justify-center gap-2 group"
      >
        <span>Lanjutkan Masuk</span>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void, key?: string }) => {

  useEffect(() => {
    const timer = setTimeout(onFinish, 0); // Remove artificial delay
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 z-[9999] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.05] rounded-full translate-x-20 -translate-y-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300 opacity-20 rounded-full -translate-x-16 translate-y-16 blur-2xl"></div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="w-40 h-40 relative mb-8 rounded-[2rem] overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-5 flex items-center justify-center border border-white/20"
      >
        <motion.svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-xl"
        >
          <defs>
            <linearGradient id="bg_splash" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="transparent" />
          
          <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <circle cx="30" cy="35" r="8" fill="#A5F3FC" />
            <path d="M15 65 Q30 40 45 65 Z" fill="#A5F3FC" />
          </motion.g>

          <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}>
            <circle cx="70" cy="35" r="8" fill="#FEF08A" />
            <path d="M55 65 Q70 40 85 65 Z" fill="#FEF08A" />
          </motion.g>

          <motion.g animate={{ y: [-1, -4, -1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '50px 65px' }}>
            <circle cx="50" cy="28" r="9" fill="#FFFFFF" />
            <path d="M30 65 C40 30 60 30 70 65 Z" fill="#FFFFFF" />
          </motion.g>

          <path d="M15 65 L85 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          
          <text x="50" y="85" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">GUYUB RUKUN</text>
        </motion.svg>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-3xl font-extrabold text-white tracking-widest text-center"
      >
        GUYUB RUKUN
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="text-teal-100 text-sm mt-3 font-medium tracking-wide"
      >
        Menghubungkan Warga RT.01
      </motion.p>
      
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "160px", opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
        className="h-1.5 bg-white/20 rounded-full mt-10 overflow-hidden relative"
      >
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "100%" }}
           transition={{ duration: 2.2, ease: "easeInOut" }}
           className="absolute top-0 left-0 bottom-0 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
         />
      </motion.div>
    </motion.div>
  );
};

import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [selectedRt, setSelectedRt] = useState<string>(() => localStorage.getItem('selected_rt') || '');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showSplash, setShowSplash] = useState(false);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateUser = (updatedData: any) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };
  
  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const handleSelectRt = (rt: string) => {
    setSelectedRt(rt);
    localStorage.setItem('selected_rt', rt);
  };

  useEffect(() => {
    if (!user?.id) return;

    
    // Initial ping
    apiFetch('/api/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id }) });
    
    // Heartbeat ping every 5 seconds
    const interval = setInterval(() => {
      apiFetch('/api/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id }) });
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const [globalEvents, setGlobalEvents] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; time: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchGlobalEvents = () => {
      apiFetch('/api/data/acara')
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setGlobalEvents(json.data);
          }
        })
        .catch(err => console.error('Error loading events for reminders:', err));
    };

    fetchGlobalEvents();
    const interval = setInterval(fetchGlobalEvents, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (globalEvents.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      
      let localReminders: string[] = [];
      try {
        const saved = localStorage.getItem('event_reminders');
        localReminders = saved ? JSON.parse(saved) : [];
      } catch {}

      if (localReminders.length === 0) return;

      globalEvents.forEach((e: any) => {
        if (localReminders.includes(e.id) && e.time) {
          const eventDate = new Date(e.date);
          const [hours, minutes] = e.time.split(':').map(Number);
          eventDate.setHours(hours, minutes, 0, 0);

          const timeDiff = eventDate.getTime() - now.getTime();
          
          if (timeDiff > 0 && timeDiff <= 10 * 60 * 1000) {
            setActiveToast({ id: e.id, title: e.title || e.name, time: e.time });
            
            try {
              const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
              audio.play().catch(err => console.log('Autoplay audio blocked:', err));
            } catch {}

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Pengingat Acara RT`, {
                body: `Acara "${e.title || e.name}" akan dimulai dalam 10 menit (${e.time})!`,
                icon: '/icon-192.png'
              });
            }

            const updated = localReminders.filter(id => id !== e.id);
            localStorage.setItem('event_reminders', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [globalEvents]);

  const handleLogout = async () => {
    if (user?.id) {
      try {
        await apiFetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id }) });
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <>
      <InstallPrompt />
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-teal-500/40 flex items-start gap-3.5 backdrop-blur-md"
          >
            <div className="w-10 h-10 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center shrink-0 animate-bounce">
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">Pengingat Acara RT</h4>
              <p className="text-sm font-bold mt-1 text-slate-100 leading-snug">{activeToast.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mulai jam {activeToast.time} WIB. Mari bersiap!</p>
              <button
                onClick={() => setActiveToast(null)}
                className="mt-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 uppercase tracking-wider"
              >
                Saya Mengerti
              </button>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
      ) : !user && !showAuthFlow && !isMobile ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full min-h-screen"
        >
          <LandingPage 
            onEnterPortal={(mode) => {
              setAuthView(mode);
              setShowAuthFlow(true);
            }}
          />
        </motion.div>
      ) : (
        !selectedRt ? (
          <motion.div
            key="rt-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4 relative"
          >
            {!isMobile && (
              <button 
                onClick={() => setShowAuthFlow(false)}
                className="absolute top-6 left-6 text-sm font-bold text-teal-600 hover:text-teal-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-teal-100 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                ← Kembali ke Beranda
              </button>
            )}
            <RtSelection onSelectRt={handleSelectRt} />
          </motion.div>
        ) : !user ? (
          authView === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4 relative"
            >
              <div className="absolute top-6 left-6 flex gap-3">
                <button 
                  onClick={() => handleSelectRt('')}
                  className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  ← Ganti RT
                </button>
                {!isMobile && (
                  <button 
                    onClick={() => setShowAuthFlow(false)}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-teal-100 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    🏠 Beranda Utama
                  </button>
                )}
              </div>
              <Login onLogin={handleLogin} onNavRegister={() => setAuthView('register')} />
            </motion.div>
          ) : (
             <motion.div
              key="register"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8 relative"
            >
              <div className="absolute top-6 left-6 flex gap-3">
                <button 
                  onClick={() => handleSelectRt('')}
                  className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  ← Ganti RT
                </button>
                {!isMobile && (
                  <button 
                    onClick={() => setShowAuthFlow(false)}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-teal-100 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    🏠 Beranda Utama
                  </button>
                )}
              </div>
              <Register onRegister={handleLogin} onNavLogin={() => setAuthView('login')} />
            </motion.div>
          )
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full min-h-screen"
          >
            <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          </motion.div>
        )
      )}
    </AnimatePresence>
    </>
  );
}
