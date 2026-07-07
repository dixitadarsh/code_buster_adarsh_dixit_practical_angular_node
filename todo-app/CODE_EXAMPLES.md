# Code Examples & Extension Guide

This guide provides practical examples for extending the Todo app with common features and patterns.

## Adding a New Feature: Task Categories

### Step 1: Update the Model

```typescript
// models/todo.model.ts

export interface Todo {
  // ... existing fields
  categoryId?: string;
  category?: TaskCategory;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}
```

### Step 2: Extend the Service

```typescript
// services/todo.service.ts

export class TodoService {
  private categorySubject = new BehaviorSubject<TaskCategory[]>([]);
  public categories$ = this.categorySubject.asObservable();

  // Add category
  addCategory(category: TaskCategory): void {
    const current = this.categorySubject.getValue();
    this.categorySubject.next([...current, category]);
  }

  // Filter by category
  filterByCategory(categoryId: string): Observable<Todo[]> {
    return this.todos$.pipe(
      map(todos => todos.filter(t => t.categoryId === categoryId)),
      shareReplay(1)
    );
  }
}
```

### Step 3: Update the Component

```typescript
// components/dashboard/dashboard.component.ts

export class DashboardComponent {
  categories$: Observable<TaskCategory[]>;

  constructor(private todoService: TodoService) {
    this.categories$ = this.todoService.categories$;
  }

  filterByCategory(categoryId: string): void {
    this.todoService.filterByCategory(categoryId)
      .subscribe(filtered => {
        // Handle filtered todos
      });
  }
}
```

### Step 4: Update the Template

```html
<!-- dashboard.component.html -->

<!-- Add category filter buttons -->
<div class="mb-6 flex gap-2 overflow-x-auto">
  <button 
    *ngFor="let category of (categories$ | async)"
    (click)="filterByCategory(category.id)"
    class="px-4 py-2 rounded-lg font-medium"
    [style.backgroundColor]="category.color"
  >
    {{ category.name }}
  </button>
</div>
```

## Adding LocalStorage Persistence

### Create a Storage Service

```typescript
// services/storage.service.ts

import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'todos';

  // Save todos to localStorage
  saveTodos(todos: Todo[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  }

  // Load todos from localStorage
  loadTodos(): Todo[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Storage load error:', error);
      return [];
    }
  }

  // Clear localStorage
  clearTodos(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

### Update TodoService to Use Storage

```typescript
// services/todo.service.ts

export class TodoService {
  private readonly todoSubject = new BehaviorSubject<Todo[]>(
    this.loadInitialTodos()
  );

  constructor(private storage: StorageService) {}

  private loadInitialTodos(): Todo[] {
    const stored = this.storage.loadTodos();
    return stored.length > 0 ? stored : this.getInitialTodos();
  }

  public addTodo(payload: CreateTodoPayload): void {
    const newTodo: Todo = { /* ... */ };
    const currentTodos = this.todoSubject.getValue();
    const updated = [newTodo, ...currentTodos];
    
    this.todoSubject.next(updated);
    this.storage.saveTodos(updated); // Persist
  }

  public deleteTodo(id: string): void {
    const currentTodos = this.todoSubject.getValue();
    const filtered = currentTodos.filter(t => t.id !== id);
    
    this.todoSubject.next(filtered);
    this.storage.saveTodos(filtered); // Persist
  }
}
```

## Adding Search Functionality

### Enhanced Service with Search

```typescript
// services/todo.service.ts

export class TodoService {
  private searchSubject = new Subject<string>();

  public searchResults$: Observable<Todo[]> = this.searchSubject
    .asObservable()
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => 
        this.todos$.pipe(
          map(todos => {
            if (!searchTerm) return todos;
            
            const lower = searchTerm.toLowerCase();
            return todos.filter(t =>
              t.title.toLowerCase().includes(lower) ||
              t.description.toLowerCase().includes(lower) ||
              t.tags.some(tag => tag.toLowerCase().includes(lower))
            );
          })
        )
      ),
      shareReplay(1)
    );

  public setSearchTerm(term: string): void {
    this.searchSubject.next(term);
  }
}
```

### Component Search Input

```typescript
// components/dashboard/dashboard.component.ts

export class DashboardComponent {
  searchResults$: Observable<Todo[]>;

  constructor(private todoService: TodoService) {
    this.searchResults$ = this.todoService.searchResults$;
  }

  onSearchChange(value: string): void {
    this.todoService.setSearchTerm(value);
  }
}
```

### Template

```html
<!-- dashboard.component.html -->

<input 
  type="text"
  placeholder="Search tasks..."
  (input)="onSearchChange($event.target.value)"
  class="w-full px-4 py-2 border rounded-lg"
/>

<div *ngFor="let todo of (searchResults$ | async)">
  <!-- Display todo -->
</div>
```

## Adding Due Date Reminders

### Create a Reminder Service

```typescript
// services/reminder.service.ts

import { Injectable } from '@angular/core';
import { TodoService } from './todo.service';
import { interval, switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(private todoService: TodoService) {
    this.initializeReminders();
  }

  private initializeReminders(): void {
    // Check every minute for upcoming deadlines
    interval(60000)
      .pipe(
        switchMap(() => this.todoService.getTodos$()),
        map(todos => this.getUpcomingTodos(todos))
      )
      .subscribe(upcomingTodos => {
        upcomingTodos.forEach(todo => this.showReminder(todo));
      });
  }

  private getUpcomingTodos(todos: Todo[]): Todo[] {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return todos.filter(todo =>
      todo.status !== 'completed' &&
      new Date(todo.dueDate) <= in24Hours &&
      new Date(todo.dueDate) > now
    );
  }

  private showReminder(todo: Todo): void {
    const message = `Reminder: "${todo.title}" is due soon!`;
    console.warn(message);
    
    // Could integrate with browser Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Task Reminder', { body: message });
    }
  }
}
```

## Adding Task Dependencies

### Model Extension

```typescript
// models/todo.model.ts

export interface Todo {
  // ... existing fields
  dependsOn?: string[]; // IDs of dependent tasks
  blockedBy?: string[]; // IDs of blocking tasks
}
```

### Service Logic

```typescript
// services/todo.service.ts

export class TodoService {
  public canMarkAsComplete(todoId: string): boolean {
    const blockedBy = this.getBlockingTodos(todoId);
    return blockedBy.length === 0;
  }

  private getBlockingTodos(todoId: string): Todo[] {
    const todos = this.getCurrentTodos();
    const todo = todos.find(t => t.id === todoId);
    
    if (!todo?.blockedBy) return [];

    return todos.filter(t =>
      todo.blockedBy?.includes(t.id) &&
      t.status !== 'completed'
    );
  }

  public getDependentTodos(todoId: string): Todo[] {
    const todos = this.getCurrentTodos();
    return todos.filter(t => t.blockedBy?.includes(todoId));
  }
}
```

## Adding Export Feature

### Export to CSV

```typescript
// services/export.service.ts

import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  exportToCSV(todos: Todo[]): void {
    const headers = ['Title', 'Description', 'Due Date', 'Priority', 'Status', 'Tags'];
    
    const csvContent = [
      headers.join(','),
      ...todos.map(todo =>
        [
          `"${todo.title}"`,
          `"${todo.description}"`,
          todo.dueDate.toLocaleDateString(),
          todo.priority,
          todo.status,
          `"${todo.tags.join('; ')}"`
        ].join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, 'todos.csv', 'text/csv');
  }

  exportToJSON(todos: Todo[]): void {
    const json = JSON.stringify(todos, null, 2);
    this.downloadFile(json, 'todos.json', 'application/json');
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }
}
```

### Use in Component

```typescript
// components/dashboard/dashboard.component.ts

export class DashboardComponent {
  constructor(
    private todoService: TodoService,
    private exportService: ExportService
  ) {}

  exportTodos(): void {
    const todos = this.todoService.getCurrentTodos();
    this.exportService.exportToCSV(todos);
  }
}
```

## Adding Dark Mode

### Theme Service

```typescript
// services/theme.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(
    localStorage.getItem('theme') === 'dark'
  );

  toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    this.applyTheme(newMode);
  }

  private applyTheme(isDark: boolean): void {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
```

### Component Integration

```typescript
// components/dashboard/dashboard.component.ts

export class DashboardComponent {
  isDarkMode = this.themeService.isDarkMode;

  constructor(private themeService: ThemeService) {}

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}
```

### Template

```html
<button (click)="toggleDarkMode()">
  {{ isDarkMode() ? '☀️ Light' : '🌙 Dark' }}
</button>
```

## Testing Examples

### Service Unit Test

```typescript
// services/todo.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { CreateTodoPayload } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add a todo', (done) => {
    const payload: CreateTodoPayload = {
      title: 'Test Todo',
      description: 'Test Description',
      dueDate: new Date(),
      priority: 'moderate',
      tags: ['test']
    };

    service.addTodo(payload);
    
    service.getTodos$().subscribe(todos => {
      expect(todos.length).toBeGreaterThan(0);
      expect(todos[0].title).toBe('Test Todo');
      done();
    });
  });

  it('should delete a todo', (done) => {
    const payload: CreateTodoPayload = {
      title: 'Test Delete',
      description: 'Test',
      dueDate: new Date(),
      priority: 'low',
      tags: []
    };

    service.addTodo(payload);
    
    service.getTodos$().subscribe(todos => {
      if (todos.length > 0) {
        const firstTodo = todos[0];
        service.deleteTodo(firstTodo.id);
        
        service.getTodos$().subscribe(updatedTodos => {
          expect(updatedTodos.find(t => t.id === firstTodo.id)).toBeUndefined();
          done();
        });
      }
    });
  });
});
```

### Component Unit Test

```typescript
// components/todo-card/todo-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoCardComponent } from './todo-card.component';
import { Todo } from '../../models/todo.model';

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test',
    dueDate: new Date(),
    priority: 'moderate',
    status: 'not-started',
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    component.todo = mockTodo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display todo title', () => {
    const titleElement = fixture.nativeElement.querySelector('h3');
    expect(titleElement.textContent).toContain('Test Todo');
  });

  it('should emit edit event on edit button click', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalledWith(mockTodo);
  });

  it('should emit delete event on delete button click', () => {
    spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalledWith(mockTodo);
  });
});
```

## Common Patterns

### Observable Composition

```typescript
// Combine multiple observables
const combined$ = combineLatest([
  this.todoService.todos$,
  this.todoService.selectedFilter$,
  this.todoService.searchResults$
]).pipe(
  map(([todos, filter, search]) => {
    // Apply combined logic
    return todos.filter(t => {/* ... */});
  }),
  shareReplay(1)
);
```

### Unsubscribe Pattern

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.observable$
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {/* ... */});
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Form Value Changes

```typescript
this.form.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  )
  .subscribe(value => {
    // Auto-save or validation
  });
```

---

**Happy Coding! 🚀**

For more Angular examples, check the [Angular Documentation](https://angular.io/docs)
