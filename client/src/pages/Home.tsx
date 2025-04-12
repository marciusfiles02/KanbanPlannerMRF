import { KanbanBoard } from '@/components/KanbanBoard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilterIcon, BarChart2Icon } from 'lucide-react';
import { TaskModal } from '@/components/TaskModal';
import { GanttChartModal } from '@/components/GanttChartModal';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Task, KANBAN_COLUMNS, KanbanColumn, columnToStatusMap } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Consultar todas as tarefas
  const { 
    data: tasks = [], 
    isLoading, 
    isError 
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks']
  });
  
  // Mutação para atualizar tarefa (usado no drag and drop)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Task> }) => {
      const response = await apiRequest('PUT', `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefa",
        description: String(error),
      });
    }
  });

  // Mutação para excluir tarefa
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: String(error),
      });
    }
  });

  // Manipular final do arraste
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não houver destino ou se o item for solto no mesmo lugar, não fazer nada
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Encontrar a tarefa que foi movida
    const taskId = parseInt(draggableId.replace('task-', ''), 10);
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    // Atualizar a coluna (e possivelmente o status) da tarefa
    const newColumn = destination.droppableId as KanbanColumn;
    const newStatus = columnToStatusMap[newColumn];

    // Otimisticamente atualizar o UI
    queryClient.setQueryData(['/api/tasks'], (oldData: Task[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(t => 
        t.id === taskId 
          ? { ...t, column: newColumn, status: newStatus } 
          : t
      );
    });

    // Persistir a atualização
    updateTaskMutation.mutate({
      id: taskId,
      data: {
        column: newColumn,
        status: newStatus
      }
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="text-primary h-6 w-6" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            <h1 className="text-xl font-bold text-neutral-800">Kanban Tarefas</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" className="bg-primary-50 text-primary">
              <FilterIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsGanttModalOpen(true)}>
              <BarChart2Icon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Gantt</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Nova Tarefa</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="flex-1 overflow-x-auto p-4">
          <KanbanBoard 
            tasks={tasks} 
            isLoading={isLoading} 
            isError={isError} 
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </main>
      </DragDropContext>

      {/* Task Modal */}
      <TaskModal
        open={isCreateModalOpen}
        onOpenChange={handleCloseModal}
        task={editingTask}
        allTasks={tasks}
      />

      {/* Gantt Chart Modal */}
      <GanttChartModal
        open={isGanttModalOpen}
        onOpenChange={setIsGanttModalOpen}
        tasks={tasks}
      />
    </div>
  );
}
