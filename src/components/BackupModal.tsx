"use client";

import { useState, useRef } from "react";
import { backupService } from "@/lib/backupService";
import { Button } from "@/components/ui/button";
import { Download, Upload, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export function BackupModal({ isOpen, onClose, onRestored }: BackupModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      await backupService.downloadBackup();
      setMessage({ type: "success", text: "Backup exportado com sucesso!" });
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao exportar backup. Tente novamente." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        setMessage(null);
        const content = event.target?.result as string;
        await backupService.restoreBackup(content);
        setMessage({ type: "success", text: "Dados restaurados com sucesso! A recarregar..." });
        setTimeout(() => {
          onRestored();
          window.location.reload();
        }, 1500);
      } catch (error) {
        setMessage({ type: "error", text: "Ficheiro de backup inválido ou corrompido." });
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-nura-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-nura-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-nura-teal-50 text-nura-teal-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-nura-slate-900">
              Backup e Dados
            </h2>
            <p className="text-xs text-nura-slate-500">
              Seus dados ficam salvos localmente com total privacidade.
            </p>
          </div>
        </div>

        {/* Alerta Informativo */}
        <div className="bg-nura-slate-50 p-4 rounded-2xl border border-nura-slate-200/80 space-y-2 text-xs text-nura-slate-600 leading-relaxed">
          <p className="font-semibold text-nura-slate-800">Sobre a segurança:</p>
          <p>
            O Nura opera 100% offline no seu navegador. Faça backups periódicos para garantir que não perde o seu histórico se limpar os dados do navegador.
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          {/* Botão de Exportar */}
          <Button
            onClick={handleExport}
            disabled={isExporting || isRestoring}
            className="w-full h-11 bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold rounded-2xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Exportar Dados (Backup JSON)</span>
          </Button>

          {/* Botão de Importar/Restaurar */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExporting || isRestoring}
            variant="outline"
            className="w-full h-11 border-nura-slate-300 hover:bg-nura-slate-50 text-nura-slate-700 font-semibold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isRestoring ? (
              <RefreshCw className="w-4 h-4 animate-spin text-nura-slate-600" />
            ) : (
              <Upload className="w-4 h-4 text-nura-slate-600" />
            )}
            <span>Restaurar Dados de Backup</span>
          </Button>
        </div>

        {/* Rodapé / Fechar */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-xs font-semibold text-nura-slate-500 hover:text-nura-slate-800 cursor-pointer"
          >
            Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}