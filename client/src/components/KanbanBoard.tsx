import { Task } from "@shared/schema";
import { KanbanColumn } from "./KanbanColumn";
import { COLUMNS, KanbanColumn as KanbanColumnType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function KanbanBoard({ 
  tasks, 
  isLoading, 
  isError,
  onEditTask,
  onDeleteTask
}: KanbanBoardProps) {
  // Quando estiver carregando, mostrar esqueleto de carregamento
  if (isLoading) {
    return (
      <div className="flex gap-4 pb-4 overflow-x-auto">
        {COLUMNS.map((column) => (
          <div key={column.id} className="min-w-[300px] max-w-[350px] bg-neutral-50 rounded-lg shadow-sm flex flex-col">
            <div className="p-3 border-b border-neutral-200 bg-neutral-100 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-neutral-700 flex items-center">
                  <span className={`w-3 h-3 ${column.colorClass} rounded-full mr-2`}></span>
                  {column.title}
                </h2>
                <span className="text-sm bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                  <Skeleton className="h-4 w-6" />
                </span>
              </div>
            </div>
            <div className="p-3 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3">
                  <Skeleton className="h-32 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Quando ocorrer um erro, mostrar mensagem de erro
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <h3 className="font-medium">Erro ao carregar o quadro Kanban</h3>
          <p>Ocorreu um erro ao carregar suas tarefas. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 pb-4 overflow-x-auto">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter(task => task.column === column.id);
        
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        );
      })}
    </div>
  );
}
