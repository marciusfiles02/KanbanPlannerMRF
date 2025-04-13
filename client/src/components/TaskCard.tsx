import { Task } from "@shared/schema";
import { formatDate, isDueDateNearOrOverdue } from "@/lib/utils";
import { getStatusById, getColorById } from "@/types";
import { EditIcon, Trash2Icon } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  allTasks?: Task[]; // Lista completa de tarefas para encontrar a predecessora
}

export function TaskCard({ task, index, onEdit, onDelete, allTasks = [] }: TaskCardProps) {
  const status = getStatusById(task.status as any);
  const color = getColorById(task.color as any);
  const isDueDateCritical = isDueDateNearOrOverdue(task.dueDate);
  
  // Encontrar tarefa predecessora, se existir
  const predecessorTask = task.predecessorId 
    ? allTasks.find(t => t.id === task.predecessorId) 
    : null;
  
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided) => (
        <div
          className="mb-3 bg-white rounded-md shadow-sm border border-neutral-200 p-3"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-task-id={task.id}
        >
          <div 
            className={`w-full h-1 ${color.bgClass} rounded-full mb-3`}
          ></div>
          
          {task.taskCode && (
            <div className="text-xs font-mono text-neutral-500 mb-1">
              #{task.taskCode}
            </div>
          )}
          
          <h3 className="font-medium text-neutral-800 mb-2">{task.title}</h3>
          <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
          
          {predecessorTask && (
            <div className="text-xs text-neutral-500 mb-3 border-t border-neutral-100 pt-2">
              <span className="font-medium">Predecessora:</span>{" "}
              <span className="font-mono">
                {predecessorTask.taskCode && `#${predecessorTask.taskCode} - `}
                {predecessorTask.title}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2 text-xs text-neutral-500">
            <div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3.5 w-3.5 inline mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              {formatDate(task.startDate)}
            </div>
            <div className={isDueDateCritical ? "text-red-500" : ""}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3.5 w-3.5 inline mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Data de Término: {formatDate(task.dueDate)}
              {task.deadlineDays && <span className="ml-2">({task.deadlineDays} dias)</span>}
            </div>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex-1 h-1.5 bg-neutral-200 rounded-full mr-2">
              <div 
                className={`${color.progressClass} h-1.5 rounded-full`} 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-neutral-600">{task.progress}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span 
              className={`text-xs px-2 py-0.5 rounded-full ${status.bgClass} ${status.colorClass}`}
            >
              {status.title}
            </span>
            <div className="flex gap-1">
              <button 
                className="text-neutral-400 hover:text-neutral-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <EditIcon className="h-3.5 w-3.5" />
              </button>
              <button 
                className="text-neutral-400 hover:text-red-500 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
