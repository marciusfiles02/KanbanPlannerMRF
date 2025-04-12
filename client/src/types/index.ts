import { 
  KanbanColumn, 
  Task, 
  TaskColor, 
  TaskStatus, 
  KANBAN_COLUMNS, 
  TASK_COLORS, 
  TASK_STATUS 
} from "@shared/schema";

export type ColumnType = {
  id: KanbanColumn;
  title: string;
  colorClass: string;
};

export type StatusType = {
  id: TaskStatus;
  title: string;
  colorClass: string;
  bgClass: string;
};

export type ColorType = {
  id: TaskColor;
  bgClass: string;
  borderClass: string;
  progressClass: string;
};

export const COLUMNS: ColumnType[] = [
  { id: KANBAN_COLUMNS.BACKLOG, title: "Backlog", colorClass: "bg-neutral-400" },
  { id: KANBAN_COLUMNS.TODO, title: "A Fazer", colorClass: "bg-blue-500" },
  { id: KANBAN_COLUMNS.IN_PROGRESS, title: "Fazendo", colorClass: "bg-orange-500" },
  { id: KANBAN_COLUMNS.REVIEW, title: "Aguardando Aprovação", colorClass: "bg-purple-500" },
  { id: KANBAN_COLUMNS.DONE, title: "Concluído", colorClass: "bg-green-500" },
];

export const STATUSES: StatusType[] = [
  { 
    id: TASK_STATUS.NOT_STARTED, 
    title: "Não iniciado", 
    colorClass: "text-neutral-700", 
    bgClass: "bg-neutral-100"
  },
  { 
    id: TASK_STATUS.IN_PROGRESS, 
    title: "Fazendo", 
    colorClass: "text-orange-700", 
    bgClass: "bg-orange-50"
  },
  { 
    id: TASK_STATUS.PAUSED, 
    title: "Parado", 
    colorClass: "text-red-700", 
    bgClass: "bg-red-50"
  },
  { 
    id: TASK_STATUS.DONE, 
    title: "Feito", 
    colorClass: "text-green-700", 
    bgClass: "bg-green-50"
  },
];

export const COLORS: ColorType[] = [
  { 
    id: TASK_COLORS.BLUE, 
    bgClass: "bg-blue-400", 
    borderClass: "border-blue-400", 
    progressClass: "bg-blue-500"
  },
  { 
    id: TASK_COLORS.GREEN, 
    bgClass: "bg-green-500", 
    borderClass: "border-green-500", 
    progressClass: "bg-green-500"
  },
  { 
    id: TASK_COLORS.ORANGE, 
    bgClass: "bg-orange-500", 
    borderClass: "border-orange-500", 
    progressClass: "bg-orange-500"
  },
  { 
    id: TASK_COLORS.RED, 
    bgClass: "bg-red-500", 
    borderClass: "border-red-500", 
    progressClass: "bg-red-500"
  },
  { 
    id: TASK_COLORS.PURPLE, 
    bgClass: "bg-purple-500", 
    borderClass: "border-purple-500", 
    progressClass: "bg-purple-500"
  },
];

// Função para obter o status baseado no ID
export const getStatusById = (id: TaskStatus): StatusType => {
  return STATUSES.find(status => status.id === id) || STATUSES[0];
};

// Função para obter a cor baseada no ID
export const getColorById = (id: TaskColor): ColorType => {
  return COLORS.find(color => color.id === id) || COLORS[0];
};

// Função para obter a coluna baseada no ID
export const getColumnById = (id: KanbanColumn): ColumnType => {
  return COLUMNS.find(column => column.id === id) || COLUMNS[0];
};

// Mapear coluna para status correspondente
export const columnToStatusMap: Record<KanbanColumn, TaskStatus> = {
  [KANBAN_COLUMNS.BACKLOG]: TASK_STATUS.NOT_STARTED,
  [KANBAN_COLUMNS.TODO]: TASK_STATUS.NOT_STARTED,
  [KANBAN_COLUMNS.IN_PROGRESS]: TASK_STATUS.IN_PROGRESS,
  [KANBAN_COLUMNS.REVIEW]: TASK_STATUS.PAUSED,
  [KANBAN_COLUMNS.DONE]: TASK_STATUS.DONE,
};
