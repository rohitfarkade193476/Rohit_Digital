import React, { useEffect, useRef, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import axiosInstance from '../lib/axiosInstance.js';

const PUSH_ENDPOINT = '/api/notifications/push';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationSetup() {
  const [state, setState] = useState('loading');
  const [dismissed, setDismissed] = useState(false);
  const vapidKeyRef = useRef(null);

  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKeyRef.current),
      });
    }

    await axiosInstance.post(`${PUSH_ENDPOINT}/subscribe`, subscription.toJSON());
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        if (!cancelled) setState('unsupported');
        return;
      }

      try {
        const response = await axiosInstance.get(`${PUSH_ENDPOINT}/vapid-public-key`);
        if (cancelled) return;

        const publicKey = response.data?.data?.publicKey;
        if (!publicKey) {
          if (!cancelled) setState('unavailable');
          return;
        }
        vapidKeyRef.current = publicKey;

        await navigator.serviceWorker.register('/sw.js');

        if (Notification.permission === 'granted') {
          await subscribeToPush();
          if (!cancelled) setState('enabled');
        } else if (Notification.permission === 'denied') {
          if (!cancelled) setState('denied');
        } else if (!cancelled) {
          setState('prompt');
        }
      } catch {
        if (!cancelled) setState('unavailable');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush();
        setState('enabled');
      } else if (permission === 'denied') {
        setState('denied');
      } else {
        setState('prompt');
      }
    } catch {
      setState('unavailable');
    }
  };

  if (state !== 'prompt' || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 px-4 py-3 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
        <BellRing className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">Stay updated</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Enable browser notifications to get instant updates on your complaints.
        </p>
      </div>
      <button
        onClick={handleEnable}
        className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
      >
        Enable
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
