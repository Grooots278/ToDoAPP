import axios from "axios";
import { CreateTodoDto, Todo, UpdateTodoDto } from "../types/todo";

const API_URL = 'http://localhost:5211/api/todo';

const api = axios.create({
    baseURL: 'http://localhost:5211/api',
    headers:{
        'Content-Type' : 'application/json',
    },
});

export const todoService = {
    async getAllTodos(): Promise<Todo[]> {
    const response = await api.get<Todo[]>('/todo');
    return response.data;
  },

  // GET задача по ID
  async getTodoById(id: number): Promise<Todo> {
    const response = await api.get<Todo>(`/todo/${id}`);
    return response.data;
  },

  // POST создать новую задачу
  async createTodo(todoData: CreateTodoDto): Promise<Todo> {
    const response = await api.post<Todo>('/todo', todoData);
    return response.data;
  },

  // PUT обновить задачу
  async updateTodo(id: number, todoData: UpdateTodoDto): Promise<void> {
    await api.put(`/todo/${id}`, todoData);
  },

  // DELETE удалить задачу
  async deleteTodo(id: number): Promise<void> {
    await api.delete(`/todo/${id}`);
  },
};