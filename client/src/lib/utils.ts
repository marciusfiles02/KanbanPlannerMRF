import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatador de data para pt-BR
export const formatDate = (date: string | Date | null): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return "";
  
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
};

// Verificar se o prazo está próximo ou vencido
export const isDueDateNearOrOverdue = (dueDate: string | Date) => {
  if (!dueDate) return false;
  
  const dueDateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const today = new Date();
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Se o prazo for em até 3 dias ou já passou
  return diffDays <= 3;
};

// Formatar data para input html
export const formatDateForInput = (date: string | Date | null): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return "";
  
  return format(dateObj, "yyyy-MM-dd");
};

// Agrupar tarefas por coluna
export const groupTasksByColumn = (tasks: any[], columns: string[]) => {
  const grouped = columns.reduce((acc, column) => {
    acc[column] = [];
    return acc;
  }, {} as Record<string, any[]>);

  tasks.forEach(task => {
    if (columns.includes(task.column)) {
      grouped[task.column].push(task);
    }
  });

  return grouped;
};
