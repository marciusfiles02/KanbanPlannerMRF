
import { Task } from "@shared/schema";
import { format, addDays, eachDayOfInterval, parseISO, differenceInDays, isWeekend } from "date-fns";
import { getColorById } from "@/types";

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-50 rounded-lg p-4 text-neutral-500">
        Nenhuma tarefa encontrada para exibir no gráfico.
      </div>
    );
  }

  const allDates = tasks.flatMap(task => [
    parseISO(task.startDate.toString()), 
    parseISO(task.dueDate.toString())
  ]);
  
  const minDate = new Date(Math.min(...allDates.map(date => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));
  
  const startDate = addDays(minDate, -1);
  const endDate = addDays(maxDate, 3);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const sortedTasks = [...tasks].sort((a, b) => 
    parseISO(a.startDate.toString()).getTime() - parseISO(b.startDate.toString()).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] flex">
        {/* Coluna fixa */}
        <div className="w-64 flex-shrink-0 bg-white z-10 border-r border-neutral-200">
          <div className="border-b border-neutral-200 bg-neutral-100 p-3 font-medium">
            Tarefa
          </div>
          {sortedTasks.map((task) => (
            <div key={task.id} className="border-b border-neutral-200 p-3">
              <div className="font-medium truncate">
                {task.taskCode && <span className="text-xs font-mono bg-neutral-100 px-1 py-0.5 rounded mr-1">#{task.taskCode}</span>}
                {task.title}
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-neutral-500">
                  {format(parseISO(task.startDate.toString()), 'dd/MM/yyyy')} - {format(parseISO(task.dueDate.toString()), 'dd/MM/yyyy')}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  task.column === 'BACKLOG' || task.column === 'TODO' ? 'bg-neutral-100 text-neutral-700' :
                  task.column === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-700' :
                  task.column === 'REVIEW' ? 'bg-red-50 text-red-700' :
                  task.column === 'DONE' ? 'bg-green-50 text-green-700' :
                  'bg-neutral-100 text-neutral-700'
                }`}>
                  {task.column === 'BACKLOG' ? 'Backlog' :
                   task.column === 'TODO' ? 'A Fazer' :
                   task.column === 'IN_PROGRESS' ? 'Fazendo' :
                   task.column === 'REVIEW' ? 'Em Revisão' :
                   task.column === 'DONE' ? 'Concluído' :
                   'Backlog'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Área do gráfico com rolagem */}
        <div className="flex-1">
          {/* Cabeçalho dos dias */}
          <div className="flex border-b border-neutral-200 bg-neutral-100">
            {days.map((day, index) => (
              <div 
                key={index} 
                className={`w-14 text-center py-2 text-xs border-r border-neutral-200 ${
                  day.getDay() === 0 || day.getDay() === 6 ? 'bg-neutral-200' : ''
                }`}
              >
                <div>{format(day, 'dd')}</div>
                <div className="font-medium">{format(day, 'MMM')}</div>
              </div>
            ))}
          </div>
          
          {/* Corpo do gráfico com as tarefas */}
          <div>
            {sortedTasks.map((task, taskIndex) => {
              const startDateObj = parseISO(task.startDate.toString());
              const dueDateObj = parseISO(task.dueDate.toString());
              const color = getColorById(task.color as any);
              
              const taskStart = Math.max(0, differenceInDays(startDateObj, startDate));
              const taskDuration = Math.max(1, differenceInDays(dueDateObj, startDateObj) + 1);
              
              // Encontrar tarefa predecessora
              const predecessorTask = task.predecessorId 
                ? tasks.find(t => t.id === task.predecessorId)
                : null;
              
              return (
                <div key={task.id} className="relative flex border-b border-neutral-200 hover:bg-neutral-50" style={{ height: '64px' }}>
                  {/* Linhas de conexão com a tarefa predecessora */}
                  {predecessorTask && (
                    <svg
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <path
                        d={`M ${predecessorTask ? (differenceInDays(parseISO(predecessorTask.dueDate.toString()), startDate) * 56) : 0} 32
                           H ${taskStart * 56}`}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="4"
                      />
                    </svg>
                  )}
                  
                  {/* Barra da tarefa */}
                  <div className="flex-1 flex relative py-2">
                    <div 
                      className={`absolute h-8 rounded-md ${color.bgClass} ${color.borderClass} flex items-center justify-center text-xs text-white font-medium`}
                      style={{ 
                        left: `${taskStart * 56}px`,
                        width: `${taskDuration * 56 - 8}px`,
                        opacity: 0.8,
                        zIndex: 2
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
    </div>
  );
}
