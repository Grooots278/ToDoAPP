export interface Todo{
    id: number;
    title: string;
    desctiption: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTodoDto
{
    title: string;
    description: string;
}

export interface UpdateTodoDto{
    title?: string;
    description?: string;
    isCompleted?: boolean;
}