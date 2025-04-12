import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GanttChart } from "./GanttChart";
import { Task } from "@shared/schema";

interface GanttChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

export function GanttChartModal({ open, onOpenChange, tasks }: GanttChartModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gráfico de Gantt - Visão Cronológica das Tarefas</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <GanttChart tasks={tasks} />
        </div>
        
        <DialogFooter className="mt-4">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}