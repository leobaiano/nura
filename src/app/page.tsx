"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Força a abertura/inicialização do IndexedDB no navegador
    db.open()
      .then(() => setDbReady(true))
      .catch((err) => console.error("Erro ao abrir NuraDB:", err));
  }, []);

  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 space-y-6">
      <h1 className="font-display text-3xl font-bold text-nura-teal-600 flex items-center gap-2">
        <Database className="w-8 h-8 text-nura-teal-600" />
        Nura - Teste de Banco de Dados Local (IndexedDB)
      </h1>

      <Card className="max-w-md border-nura-teal-600/20 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl text-nura-slate-900">
            Status da Conexão Dexie.js
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-nura-slate-600">
              NuraDB Estado:
            </span>
            {dbReady ? (
              <Badge className="bg-nura-green-600 text-white flex gap-1 items-center">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado & Criado
              </Badge>
            ) : (
              <Badge className="bg-nura-amber-600 text-white">
                Inicializando...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}