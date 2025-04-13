import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Task, 
  InsertTask, 
  TASK_STATUS, 
  TASK_COLORS, 
  KANBAN_COLUMNS,
  TaskStatus,
  TaskColor,
  KanbanColumn
} from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { COLORS, STATUSES } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isValid, parseISO, addDays, isWeekend } from "date-fns";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  allTasks: Task[];
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().optional(),
  predecessorId: z.number().nullable().optional(),
  startDate: z.string().refine((date) => !!date, {
    message: "A data de início é obrigatória",
  }),
  dueDate: z.string().refine((date) => !!date, {
    message: "A data de término é obrigatória",
  }),
  deadlineDays: z.number().min(1, "O prazo deve ser de pelo menos 1 dia").nullable().optional(),
  progress: z.number().min(0).max(100),
  status: z.enum([
    TASK_STATUS.NOT_STARTED,
    TASK_STATUS.IN_PROGRESS, 
    TASK_STATUS.PAUSED, 
    TASK_STATUS.DONE
  ]),
  color: z.enum([
    TASK_COLORS.BLUE,
    TASK_COLORS.GREEN,
    TASK_COLORS.ORANGE,
    TASK_COLORS.RED,
    TASK_COLORS.PURPLE
  ]),
  column: z.enum([
    KANBAN_COLUMNS.BACKLOG,
    KANBAN_COLUMNS.TODO,
    KANBAN_COLUMNS.IN_PROGRESS,
    KANBAN_COLUMNS.REVIEW,
    KANBAN_COLUMNS.DONE
  ]),
});

type TaskFormValues = z.infer<typeof formSchema>;

export function TaskModal({ open, onOpenChange, task, allTasks = [] }: TaskModalProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      progress: 0,
      status: TASK_STATUS.NOT_STARTED,
      color: TASK_COLORS.BLUE,
      column: KANBAN_COLUMNS.BACKLOG,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        predecessorId: task.predecessorId || null,
        startDate: formatDateForInput(task.startDate),
        dueDate: formatDateForInput(task.dueDate),
        progress: task.progress,
        status: task.status as TaskStatus,
        color: task.color as TaskColor,
        column: task.column as KanbanColumn,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        predecessorId: null,
        startDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        progress: 0,
        status: TASK_STATUS.NOT_STARTED,
        color: TASK_COLORS.BLUE,
        column: KANBAN_COLUMNS.BACKLOG,
      });
    }
  }, [task, form]);

  type FormattedData = Omit<TaskFormValues, 'startDate' | 'dueDate'> & {
    startDate: Date;
    dueDate: Date;
  };

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormattedData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: String(error),
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormattedData }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefa",
        description: String(error),
      });
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    const formattedData: FormattedData = {
      ...values,
      startDate: new Date(values.startDate),
      dueDate: new Date(values.dueDate),
    };

    if (isEditing && task) {
      updateTaskMutation.mutate({
        id: task.id,
        data: formattedData,
      });
    } else {
      createTaskMutation.mutate(formattedData);
    }
  };

  // Atualizar Data de Término quando a Data de Início ou Prazo mudar
  useEffect(() => {
    const startDate = form.watch("startDate");
    const deadlineDays = form.watch("deadlineDays");

    if (startDate && deadlineDays) {
      let newDueDate = addDays(new Date(startDate), deadlineDays);
      form.setValue("dueDate", format(newDueDate, "yyyy-MM-dd"));
    }
  }, [form.watch("startDate"), form.watch("deadlineDays")]);

  // Verificar se a Data de Início é válida
  useEffect(() => {
    const startDate = form.watch("startDate");
    const dueDate = form.watch("dueDate");
    const predecessorId = form.watch("predecessorId");

    if (!startDate || !dueDate) return;

    const currentStartDate = new Date(startDate);
    const currentDueDate = new Date(dueDate);

    // Verificar se a data de início é posterior à data de término
    if (currentStartDate >= currentDueDate) {
      form.setValue("startDate", format(addDays(currentDueDate, -1), "yyyy-MM-dd"));
      return;
    }

    // Se houver predecessor, verificar a data de término dele
    if (predecessorId) {
      const predecessorTask = allTasks.find(t => t.id === predecessorId);
      if (predecessorTask) {
        const predecessorDueDate = new Date(predecessorTask.dueDate);
        if (currentStartDate <= predecessorDueDate) {
          form.setValue("startDate", format(addDays(predecessorDueDate, 1), "yyyy-MM-dd"));
        }
      }
    }
  }, [form.watch("startDate"), form.watch("dueDate"), form.watch("predecessorId")]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <p className="text-sm text-muted-foreground pt-2">
            {isEditing ? "Edite os detalhes da tarefa abaixo" : "Preencha os detalhes da nova tarefa"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="predecessorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarefa Predecessora</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const newValue = value === "null" ? null : Number(value);
                      field.onChange(newValue);

                      if (newValue) {
                        const predecessorTask = allTasks.find(t => t.id === newValue);
                        if (predecessorTask) {
                          let nextDay = addDays(new Date(predecessorTask.dueDate), 1);

                          while (isWeekend(nextDay)) {
                            nextDay = addDays(nextDay, 1);
                          }

                          form.setValue("startDate", format(nextDay, "yyyy-MM-dd"));
                        }
                      }
                    }}
                    value={field.value?.toString() || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma tarefa predecessora (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhuma</SelectItem>
                      {allTasks
                        .filter(t => !task || t.id !== task.id)
                        .map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.taskCode ? `[${t.taskCode}] ` : ''}{t.title}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadlineDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (em dias)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Digite o prazo em dias"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentual de Conclusão: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map((status) => (
                      <Label
                        key={status.id}
                        htmlFor={`status-${status.id}`}
                        className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                          field.value === status.id ? "border-primary" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          id={`status-${status.id}`}
                          value={status.id}
                          checked={field.value === status.id}
                          onChange={() => field.onChange(status.id)}
                          className="sr-only"
                        />
                        <span className="ml-2 text-sm">{status.title}</span>
                      </Label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <div className="flex space-x-2">
                    {COLORS.map((color) => (
                      <Label
                        key={color.id}
                        htmlFor={`color-${color.id}`}
                        className={`w-8 h-8 rounded-full ${color.bgClass} cursor-pointer flex items-center justify-center border-2 ${
                          field.value === color.id
                            ? "border-gray-800"
                            : "border-transparent hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          id={`color-${color.id}`}
                          value={color.id}
                          checked={field.value === color.id}
                          onChange={() => field.onChange(color.id)}
                          className="sr-only"
                        />
                        {field.value === color.id && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </Label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="column"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              >
                {isEditing ? "Atualizar" : "Salvar"} Tarefa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}