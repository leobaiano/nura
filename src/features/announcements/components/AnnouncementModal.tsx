"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { announcementService } from "../services/announcementService";
import { AnnouncementData } from "../types";

export function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    async function checkAnnouncements() {
      try {
        const data = await announcementService.getActiveAnnouncement();
        if (!data) return;

        // Verifica no IndexedDB se o usuário já marcou para não mostrar este anúncio
        const dismissed = await db.dismissedAnnouncements
          .where("announcementId")
          .equals(data.id)
          .first();

        if (!dismissed) {
          setAnnouncement(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Erro ao verificar anúncios:", error);
      }
    }

    checkAnnouncements();
  }, []);

  const handleClose = async () => {
    if (announcement && dontShowAgain) {
      await db.dismissedAnnouncements.add({
        announcementId: announcement.id,
        dismissedAt: new Date(),
      });
    }
    setIsOpen(false);
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-nura-teal-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-nura-slate-400 hover:text-nura-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-nura-teal-100 text-nura-teal-700 flex items-center justify-center mx-auto">
          <Bell className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-display text-xl font-bold text-nura-slate-900">
            {announcement.title}
          </h3>
          <p className="text-sm text-nura-slate-600 leading-relaxed">
            {announcement.message}
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-center justify-center gap-2 text-xs text-nura-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-nura-slate-300 text-nura-teal-600 focus:ring-nura-teal-500 w-4 h-4 cursor-pointer"
            />
            Não mostrar esta mensagem novamente
          </label>

          <Button
            onClick={handleClose}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-nura-teal-600 hover:bg-nura-teal-700 text-white shadow-xs cursor-pointer"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}