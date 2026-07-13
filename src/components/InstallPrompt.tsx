import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Also check for PWA installed mode on iOS (standalone)
    const isIosInstalled = (window.navigator as any).standalone === true;
    
    if (isIosDevice && !isIosInstalled) {
      setIsIOS(true);
      // Wait a moment then show prompt for iOS
      setTimeout(() => setIsVisible(true), 3000);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later.
      if (!isIosDevice) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is successfully installed, hide the prompt
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-4 right-4 z-[100] bg-teal-600 text-white p-4 rounded-2xl shadow-xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Install Guyub Rukun</p>
                <p className="text-xs text-teal-100">
                  {isIOS ? "Akses lebih mudah dan cepat" : "Tambahkan ke Beranda hp Anda"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isIOS && (
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-teal-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform"
                >
                  Install
                </button>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 text-teal-200 hover:text-white rounded-lg active:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {isIOS && (
             <div className="bg-white/10 p-3 rounded-xl text-xs text-teal-50 flex items-start gap-2">
               <Share className="w-4 h-4 mt-0.5 shrink-0" />
               <p>Tap tombol <strong>Share</strong> di navigasi bawah, geser bawah, lalu pilih <strong>Add to Home Screen</strong>.</p>
             </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

