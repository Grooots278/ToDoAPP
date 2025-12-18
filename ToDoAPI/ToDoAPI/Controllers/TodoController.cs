using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoAPI.Data;
using ToDoAPI.Models;

namespace ToDoAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController  : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TodoController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems() => await
            _context.TodoItems
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null) return NotFound();

            return todoItem;
        }

        [HttpPost]
        public async Task<ActionResult<TodoItem>> CreateTodoItem(CreateTodoDto createDto)
        {
            var todoItem = new TodoItem()
            {
                Title = createDto.Title,
                Description = createDto.Description,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodoItem(int id, UpdateTodoDto updateDto)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null) return NotFound();

            if (updateDto.Title != null) todoItem.Title = updateDto.Title;
            if (updateDto.Description != null) todoItem.Description = updateDto.Description;
            if (updateDto.IsCompleted.HasValue) todoItem.IsCompleted = updateDto.IsCompleted.Value;
            todoItem.UpdatedAt = DateTime.UtcNow;

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if(todoItem == null) return NotFound();

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(int id) => _context.TodoItems.Any(e => e.Id == id);
    }
}
