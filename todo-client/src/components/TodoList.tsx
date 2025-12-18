import React, { useState, useEffect } from 'react';
import { Todo, CreateTodoDto } from '../types/todo';
import { todoService } from '../services/todoService';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<CreateTodoDto>({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // GET все задачи при загрузке
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getAllTodos();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке задач');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // POST создать новую задачу
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const createdTodo = await todoService.createTodo(newTodo);
      setTodos([createdTodo, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Ошибка при создании задачи');
      console.error(err);
    }
  };

  // PUT обновить статус задачи
  const handleToggleComplete = async (id: number, isCompleted: boolean) => {
    try {
      await todoService.updateTodo(id, { isCompleted: !isCompleted });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      ));
      setError('');
    } catch (err) {
      setError('Ошибка при обновлении задачи');
      console.error(err);
    }
  };

  // PUT обновить задачу (редактирование)
  const handleUpdateTodo = async (id: number, title: string, description: string) => {
    try {
      await todoService.updateTodo(id, { title, description });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, title, description } : todo
      ));
      setError('');
    } catch (err) {
      setError('Ошибка при обновлении задачи');
      console.error(err);
    }
  };

  // DELETE удалить задачу
  const handleDeleteTodo = async (id: number) => {
    if (!window.confirm('Удалить эту задачу?')) return;

    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError('Ошибка при удалении задачи');
      console.error(err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Менеджер задач</h1>
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Форма создания задачи */}
      <form onSubmit={handleCreateTodo} style={{ marginBottom: '30px' }}>
        <h3>Добавить новую задачу</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={newTodo.title}
            onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
            placeholder="Название задачи"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            value={newTodo.description}
            onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
            placeholder="Описание задачи"
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Добавить задачу
        </button>
      </form>

      {/* Список задач */}
      <div>
        <h3>Список задач ({todos.length})</h3>
        {todos.length === 0 ? (
          <p>Нет задач</p>
        ) : (
          <div>
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент отдельной задачи
interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  onUpdateTodo: (id: number, title: string, description: string) => void;
  onDeleteTodo: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggleComplete, 
  onUpdateTodo, 
  onDeleteTodo 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.desctiption);

  const handleSave = () => {
    onUpdateTodo(todo.id, editTitle, editDescription);
    setIsEditing(false);
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: todo.isCompleted ? '#f0f0f0' : 'white'
    }}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={{ width: '100%', marginBottom: '10px', padding: '5px', minHeight: '60px' }}
          />
          <button onClick={handleSave} style={{ marginRight: '10px' }}>
            Сохранить
          </button>
          <button onClick={() => setIsEditing(false)}>
            Отмена
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                textDecoration: todo.isCompleted ? 'line-through' : 'none' 
              }}>
                {todo.title}
              </h4>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                {todo.desctiption || 'Нет описания'}
              </p>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Создано: {new Date(todo.createdAt).toLocaleDateString()}
                {todo.updatedAt && ` | Обновлено: ${new Date(todo.updatedAt).toLocaleDateString()}`}
              </div>
            </div>
            <div>
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => onToggleComplete(todo.id, todo.isCompleted)}
                style={{ marginRight: '10px' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => setIsEditing(true)}
              style={{ marginRight: '10px', padding: '5px 10px' }}
            >
              Редактировать
            </button>
            <button 
              onClick={() => onDeleteTodo(todo.id)}
              style={{ 
                padding: '5px 10px', 
                backgroundColor: '#ff4444', 
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;