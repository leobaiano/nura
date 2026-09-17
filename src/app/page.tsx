import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pill, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 space-y-6">
      <h1 className="font-display text-3xl font-bold text-nura-teal-600 flex items-center gap-2">
        <Pill className="w-8 h-8 text-nura-teal-600" />
        Nura - Teste de Componentes UI & Ícones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Teste de Card e Badges */}
        <Card className="border-nura-teal-600/20 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl text-nura-slate-900 flex items-center justify-between">
              Dipirona 500mg
              <Badge className="bg-nura-teal-100 text-nura-teal-700 hover:bg-nura-teal-100 border-none">
                Eu (Perfil)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-sans text-sm text-nura-slate-600">
              Tomar 1 comprimido a cada 8 horas em caso de dor.
            </p>
            <div className="flex gap-2">
              <Badge className="bg-nura-amber-600 text-white flex gap-1 items-center">
                <AlertCircle className="w-3 h-3" />
                Estoque Baixo: 3 un
              </Badge>
              <Badge className="bg-nura-green-600 text-white flex gap-1 items-center">
                <CheckCircle2 className="w-3 h-3" />
                Próxima dose: 14:00
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Form, Input, Switch e Botões */}
        <Card className="border-nura-teal-600/20 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl text-nura-slate-900">
              Interações de Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Buscar medicamento..." className="font-sans" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-nura-slate-600">
                Notificações ativas
              </span>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-sans flex gap-1 items-center">
                <Plus className="w-4 h-4" /> Cadastrar Remédio
              </Button>
              <Button variant="outline" className="border-nura-slate-600/20 font-sans">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}