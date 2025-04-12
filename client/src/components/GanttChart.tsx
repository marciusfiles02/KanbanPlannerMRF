import { Task } from "@shared/schema";
import { format, addDays, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getColorById } from "@/types";

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  // Se não houver tarefas, mostrar mensagem
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-50 rounded-lg p-4 text-neutral-500">
        Nenhuma tarefa encontrada para exibir no gráfico.
      </div>
    );
  }

  // Encontrar a data mais antiga e a mais recente para definir o intervalo do gráfico
  const allDates = tasks.flatMap(task => [
    parseISO(task.startDate.toString()), 
    parseISO(task.dueDate.toString())
  ]);
  
  const minDate = new Date(Math.min(...allDates.map(date => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));
  
  // Adicionar uma margem de alguns dias
  const startDate = addDays(minDate, -1);
  const endDate = addDays(maxDate, 3);
  
  // Gerar dias para exibir no cabeçalho
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Ordenar tarefas por data de início
  const sortedTasks = [...tasks].sort((a, b) => 
    parseISO(a.startDate.toString()).getTime() - parseISO(b.startDate.toString()).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Cabeçalho do gráfico */}
        <div className="flex border-b border-neutral-200 bg-neutral-100">
          <div className="w-64 p-3 font-medium border-r border-neutral-200">
            Tarefa
          </div>
          <div className="flex-1 flex">
            {days.map((day, index) => (
              <div 
                key={index} 
                className={`w-14 text-center py-2 text-xs border-r border-neutral-200 ${
                  day.getDay() === 0 || day.getDay() === 6 ? 'bg-neutral-200' : ''
                }`}
              >
                <div>{format(day, 'dd', { locale: ptBR })}</div>
                <div className="font-medium">{format(day, 'MMM', { locale: ptBR })}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Corpo do gráfico com as tarefas */}
        <div>
          {sortedTasks.map((task) => {
            const startDateObj = parseISO(task.startDate.toString());
            const dueDateObj = parseISO(task.dueDate.toString());
            const color = getColorById(task.color as any);
            
            // Calcular a posição e largura da barra
            const taskStart = Math.max(
              0,
              differenceInDays(startDateObj, startDate)
            );
            const taskDuration = Math.max(
              1,
              differenceInDays(dueDateObj, startDateObj) + 1
            );
            
            return (
              <div key={task.id} className="flex border-b border-neutral-200 hover:bg-neutral-50">
                <div className="w-64 p-3 text-sm border-r border-neutral-200 flex flex-col justify-center truncate">
                  <div className="font-medium truncate">
                    {task.taskCode && <span className="text-xs font-mono bg-neutral-100 px-1 py-0.5 rounded mr-1">#{task.taskCode}</span>}
                    {task.title}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {format(startDateObj, 'dd/MM/yyyy')} - {format(dueDateObj, 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className="flex-1 flex relative py-2">
                  <div 
                    className={`absolute h-8 rounded-md ${color.bgClass} ${color.borderClass} flex items-center justify-center text-xs text-white font-medium`}
                    style={{ 
                      left: `${taskStart * 56}px`,
                      width: `${taskDuration * 56 - 8}px`,
                      opacity: 0.8
                    }}
                  >
                    {task.progress}%
                  </div>
                  {days.map((day, index) => (
                    <div 
                      key={index} 
                      className={`w-14 border-r border-neutral-200 ${
                        day.getDay() === 0 || day.getDay() === 6 ? 'bg-neutral-100' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}