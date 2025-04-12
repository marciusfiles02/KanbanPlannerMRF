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
import { Task, InsertTask, TASK_STATUS, TASK_COLORS, KANBAN_COLUMNS } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { COLORS, STATUSES } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().optional(),
  startDate: z.string().refine((date) => !!date, {
    message: "A data de início é obrigatória",
  }),
  dueDate: z.string().refine((date) => !!date, {
    message: "O prazo é obrigatório",
  }),
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

export function TaskModal({ open, onOpenChange, task }: TaskModalProps) {
  const { toast } = useToast();
  const isEditing = !!task;
  
  // Definir form com react-hook-form e zod
  const form = useForm<z.infer<typeof formSchema>>({
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

  // Atualizar valores do formulário quando a tarefa mudar
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        startDate: formatDateForInput(task.startDate),
        dueDate: formatDateForInput(task.dueDate),
        progress: task.progress,
        status: task.status as any,
        color: task.color as any,
        column: task.column as any,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        progress: 0,
        status: TASK_STATUS.NOT_STARTED,
        color: TASK_COLORS.BLUE,
        column: KANBAN_COLUMNS.BACKLOG,
      });
    }
  }, [task, form]);

  // Mutação para criar nova tarefa
  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
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

  // Mutação para atualizar tarefa
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
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

  // Submit do formulário
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Enviar os valores diretamente - o servidor vai converter as strings para Date
    if (isEditing && task) {
      updateTaskMutation.mutate({
        id: task.id,
        data: values,
      });
    } else {
      createTaskMutation.mutate(values as InsertTask);
    }
  };

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
                    <FormLabel>Prazo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
