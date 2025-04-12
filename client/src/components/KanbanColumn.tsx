import { Task } from "@shared/schema";
import { TaskCard } from "./TaskCard";
import { ColumnType } from "@/types";
import { Droppable } from "react-beautiful-dnd";

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function KanbanColumn({ 
  column, 
  tasks, 
  onEditTask, 
  onDeleteTask 
}: KanbanColumnProps) {
  return (
    <div 
      className="min-w-[300px] max-w-[350px] bg-neutral-50 rounded-lg shadow-sm flex flex-col"
      data-column={column.id}
    >
      <div className="p-3 border-b border-neutral-200 bg-neutral-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-700 flex items-center">
            <span className={`w-3 h-3 ${column.colorClass} rounded-full mr-2`}></span>
            {column.title}
          </h2>
          <span className="text-sm bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div 
            className="p-3 flex-1 overflow-y-auto min-h-[200px]"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">
                Sem tarefas
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
