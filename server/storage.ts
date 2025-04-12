import { 
  users, 
  tasks, 
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask, 
  type UpdateTask
} from "@shared/schema";

// Interface de armazenamento
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tarefas
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

// Implementação de armazenamento em memória
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userCurrentId: number;
  private taskCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
  }

  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Métodos de tarefas
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  // Função para gerar código único de 3 dígitos para tarefas
  private generateTaskCode(): string {
    // Gera um número entre 100 e 999
    return String(Math.floor(Math.random() * 900) + 100);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const currentDate = new Date();
    
    // Gerar código único para a tarefa
    const taskCode = this.generateTaskCode();
    
    const task: Task = {
      ...insertTask,
      id,
      taskCode,
      description: insertTask.description || null,
      predecessorId: insertTask.predecessorId || null,
      createdAt: currentDate
    };
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = {
      ...existingTask,
      ...updateData,
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
