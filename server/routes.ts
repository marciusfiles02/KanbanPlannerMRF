import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - Todos prefixados com /api
  const apiRouter = express.Router();
  
  // Middleware para tratamento de erros de validação Zod
  const validateRequest = (schema: z.ZodType<any, any>) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({
            message: "Erro de validação",
            errors: validationError.details
          });
        }
        next(error);
      }
    };
  };
  
  // Rota para obter todas as tarefas
  apiRouter.get("/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tarefas" });
    }
  });
  
  // Rota para obter uma tarefa específica
  apiRouter.get("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tarefa" });
    }
  });
  
  // Rota para criar uma nova tarefa
  apiRouter.post("/tasks", validateRequest(insertTaskSchema), async (req, res) => {
    try {
      const task = await storage.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar tarefa" });
    }
  });
  
  // Rota para atualizar uma tarefa
  apiRouter.put("/tasks/:id", validateRequest(updateTaskSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const updatedTask = await storage.updateTask(id, req.body);
      if (!updatedTask) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar tarefa" });
    }
  });
  
  // Rota para excluir uma tarefa
  apiRouter.delete("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir tarefa" });
    }
  });
  
  // Registrar as rotas da API
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
