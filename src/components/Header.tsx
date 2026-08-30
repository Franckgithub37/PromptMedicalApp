import { FileDown, GraduationCap, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  level: 'beginner' | 'advanced';
  onLevelChange: (level: 'beginner' | 'advanced') => void;
  onExportPDF: () => void;
  selectionBadges?: React.ReactNode;
  showNextButton?: boolean;
}

export default function Header({ level, onLevelChange, onExportPDF, selectionBadges, showNextButton }: HeaderProps) {
  return (
    <header
      className="px-4 sm:px-6 py-4 rounded-2xl mb-6 animate-fade-in w-full xl:!w-[1252px] !opacity-100 bg-white border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, #29abe2 0%, #1a8abf 100%)' }}>
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
              Formation au Prompting Médical
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-0.5 hidden sm:block">
              Apprenez à créer des prompts efficaces pour l&apos;IA en santé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="font-medium text-gray-700 text-sm">Niveau</span>
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <GraduationCap className="w-5 h-5 text-[#29abe2]" />
            <Select value={level} onValueChange={(value) => onLevelChange(value as 'beginner' | 'advanced')}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex items-center gap-2">
                    <span>Débutant</span>
                    <Badge variant="secondary" className="text-xs !text-white font-bold">Guidé</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex items-center gap-2">
                    <span>Avancé</span>
                    <Badge variant="default" className="text-xs !text-white font-bold">Libre</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectionBadges &&
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-6">
        <div className="flex flex-wrap items-center gap-2 !text-slate-50">
          {selectionBadges}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showNextButton && (
            <Button
              variant="default"
              size="sm"
              className="bg-[#29abe2] hover:bg-[#1d8fc0] text-white font-medium rounded-xl">
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button
            onClick={onExportPDF}
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-[#ff8000] to-[#ff9933] hover:from-[#ff9933] hover:to-[#ff8000] text-white font-medium w-fit rounded-xl">
            <FileDown className="w-4 h-4 mr-2" />
            Exporter en PDF
          </Button>
        </div>
      </div>
      }
    </header>);

}
