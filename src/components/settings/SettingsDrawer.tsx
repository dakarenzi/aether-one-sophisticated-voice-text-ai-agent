import React from 'react';
import { Settings as SettingsIcon, Sliders, Volume2, ShieldCheck, Cpu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODELS } from '@/lib/chat';
import { useAetherStore } from '@/hooks/use-aether-session';
import { Button } from '@/components/ui/button';
export function SettingsDrawer() {
  const currentModel = useAetherStore(s => s.currentModel);
  const setModel = useAetherStore(s => s.setModel);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-6 right-16 z-50 rounded-full hover:bg-white/10">
          <SettingsIcon className="w-6 h-6 text-white/70" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-dark border-l border-white/10 text-foreground">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            Aether Configuration
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="w-4 h-4" />
              AI Reasoning Model
            </div>
            <Select value={currentModel} onValueChange={setModel}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-foreground">
                {MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              Audio Preferences
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-mode">Voice Interaction</Label>
              <Switch id="voice-mode" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-send">Voice Activity Detection</Label>
              <Switch id="auto-send" defaultChecked />
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Safety & Privacy
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="high-precision">Strict Instruction Follow</Label>
              <Switch id="high-precision" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 right-6">
           <p className="text-[10px] text-muted-foreground text-center">
            Note: Requests to AI servers may be limited across user instances.
           </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}