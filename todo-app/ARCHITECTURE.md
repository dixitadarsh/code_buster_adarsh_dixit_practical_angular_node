# Architecture & Best Practices Guide

## Overview

This document outlines the Angular architecture and best practices used in this Todo application.

## Architecture Pattern: Smart/Dumb Component Pattern

### Smart Components (Container Components)
**File**: `dashboard.component.ts`

Responsibilities:
- State management via signals
- Observable subscriptions
- Business logic orchestration
- Event handling and routing

```typescript
// State Management with Signals
readonly showForm = signal(false);
readonly editingTodo = signal<Todo | null>(null);
readonly currentPage = signal(1);

// Observable streams
filteredTodos$: Observable<Todo[]>;

// Business logic methods
onFormSave(payload: CreateTodoPayload | UpdateTodoPayload)
deleteTodo(todo: Todo)
markAsCompleted(todo: Todo)
```

### Dumb Components (Presentational Components)
**Files**: `todo-card.component.ts`, `todo-form.component.ts`

Responsibilities:
- Display data
- Emit user interactions
- No dependency on services
- Pure component logic

```typescript
// Input from parent
@Input() todo!: Todo;
@Input() form!: FormGroup;

// Output events to parent
@Output() edit = new EventEmitter<Todo>();
@Output() delete = new EventEmitter<Todo>();
@Output() save = new EventEmitter<any>();
```

## Service Architecture

### TodoService - Reactive Data Management

```
State Layer (BehaviorSubject)
     ↓
Observable Streams (with RxJS operators)
     ↓
Public Methods (Business Logic)
     ↓
Components (Subscribe to observables)
```

**Key Principles:**

1. **Single Responsibility**: Service handles all todo-related logic
2. **Observable-First**: All data exposed via observables
3. **Immutability**: State updates create new arrays
4. **Error Handling**: Built-in error logging with tap()

**Observable Streams:**

```typescript
// Main data stream
public readonly todos$ = this.todoSubject.asObservable()
  .pipe(shareReplay(1));

// Filtered streams
public readonly searchTodos$ = this.searchTermSubject
  .asObservable()
  .pipe(debounceTime(300), shareReplay(1));

// Combined filters
public readonly combinedFilteredTodos$: Observable<Todo[]>
  .pipe(filter(), tap(), shareReplay(1));
```

## State Management Strategy

### Why Signals + Observables?

**Signals Handle:**
- UI state (form visibility, current page)
- Local component state
- Simple boolean/number values

**Observables Handle:**
- Complex data flows
- Async operations
- Multi-subscriber scenarios
- Data transformation pipelines

### State Flow

```
User Action
     ↓
Component Method
     ↓
Service Method (updates BehaviorSubject)
     ↓
New value emitted to Observable
     ↓
Components subscribed via async pipe
     ↓
Template updates (Change Detection)
```

## Reactive Forms Strategy

### Form Validation

```typescript
// FormBuilder with validators
this.form = this.formBuilder.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  dueDate: ['', Validators.required],
  priority: ['moderate', Validators.required],
  tags: [[]],
  tagsInput: [''],
});

// Real-time validation feedback
getFieldError(fieldName: string): string | null {
  const field = this.form.get(fieldName);
  if (field?.hasError('required')) {
    return `${fieldName} is required`;
  }
  // ... more error types
}
```

### Dynamic Field Management

```typescript
// Tags input with debounce
this.tagsInput?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe((value: string) => {
    if (value && value.includes(',')) {
      const tags = value.split(',').map(tag => tag.trim());
      this.form.patchValue({ tags: [...new Set([...currentTags, ...tags])] });
    }
  });
```

## RxJS Operators Explained

| Operator | Purpose | Use Case |
|----------|---------|----------|
| `shareReplay(1)` | Cache latest value, share across subscribers | Observable streams |
| `tap()` | Side effects, debugging | Logging, console checks |
| `distinctUntilChanged()` | Prevent duplicate emissions | Avoid unnecessary updates |
| `debounceTime()` | Wait before emitting | Search inputs |
| `filter()` | Conditional emissions | Filter by status |
| `map()` | Transform data | Convert data shape |
| `startWith()` | Emit initial value | Default states |

## Component Communication Patterns

### Parent → Child (One-way binding)

```typescript
// Parent
<app-todo-card [todo]="todo"></app-todo-card>

// Child
@Input() todo!: Todo;
```

### Child → Parent (Event emission)

```typescript
// Child
@Output() edit = new EventEmitter<Todo>();
onEdit(): void { this.edit.emit(this.todo); }

// Parent
(edit)="openEditForm($event)"
```

### Service-Based Communication (Complex flows)

```typescript
// All components subscribe to service observables
constructor(private todoService: TodoService) {
  this.filteredTodos$ = this.todoService.getTodos$();
}
```

## Type Safety with TypeScript

### Model Interfaces

```typescript
// Defines shape of todo data
export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Request payload type
export interface CreateTodoPayload {
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  tags: string[];
}

// Union types for specific values
export type Priority = 'extreme' | 'moderate' | 'low';
export type Status = 'not-started' | 'in-progress' | 'completed';
```

### Type-Safe Method Signatures

```typescript
// Clear input/output types
public addTodo(payload: CreateTodoPayload): void { ... }
public updateTodo(id: string, payload: UpdateTodoPayload): void { ... }
public getTodoById(id: string): Todo | undefined { ... }
public getStatistics(): { completed: number; ... } { ... }
```

## Memory Management

### Subscription Cleanup

```typescript
// Using takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.valueChanges$
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {...});
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Async Pipe (Auto-unsubscribe)

```typescript
// Template automatically handles subscriptions
<div *ngFor="let todo of (filteredTodos$ | async)">
  {{ todo.title }}
</div>
```

## Change Detection Strategy

### Current: Default Strategy
```typescript
@Component({
  selector: 'app-dashboard',
  // Change detection: Default (checks entire tree)
})
```

### For Production: OnPush Strategy
```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush
  // Only checks when @Input changes or events occur
})
```

**Benefits:**
- 🚀 Improved performance
- 💾 Reduced memory usage
- 🎯 Predictable updates

## Error Handling Strategy

### Service Level
```typescript
private applyAllFilters(todos: Todo[]): Todo[] {
  try {
    // Filtering logic
  } catch (error) {
    console.error('Filter error:', error);
    return todos; // Fallback
  }
}
```

### Form Level
```typescript
getFieldError(fieldName: string): string | null {
  const field = this.form.get(fieldName);
  if (!field) return null;
  
  if (field.hasError('required')) return 'Field required';
  if (field.hasError('minlength')) return 'Too short';
  return null;
}
```

### User Confirmation
```typescript
deleteTodo(todo: Todo): void {
  if (confirm(`Delete "${todo.title}"?`)) {
    this.todoService.deleteTodo(todo.id);
  }
}
```

## Styling Strategy: Tailwind CSS

### Utility-First Approach

```html
<!-- Instead of writing CSS, use utility classes -->
<div class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg">
  <!-- Readable at a glance -->
</div>
```

### Responsive Design

```html
<!-- Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Custom Animations

```css
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

## Testing Recommendations

### Unit Testing Services

```typescript
describe('TodoService', () => {
  let service: TodoService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should add todo', (done) => {
    service.addTodo({...payload});
    service.getTodos$().subscribe(todos => {
      expect(todos.length).toBe(1);
      done();
    });
  });
});
```

### Component Testing

```typescript
describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCardComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
  });

  it('should emit edit event', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalled();
  });
});
```

## Performance Considerations

### Current Optimizations
✅ ShareReplay for observable caching
✅ Signals for fine-grained reactivity
✅ Pagination to limit DOM elements
✅ OnDestroy cleanup

### Future Optimizations
- [ ] OnPush change detection strategy
- [ ] TrackBy function in *ngFor
- [ ] Virtual scrolling for large lists
- [ ] Lazy loading routes
- [ ] Code splitting
- [ ] Progressive image loading

## Security Best Practices

### Input Validation
```typescript
// Server-side validation should also be implemented
if (title.length < 3) {
  throw new Error('Title too short');
}
```

### XSS Prevention
```typescript
// Angular automatically escapes template expressions
{{ todo.title }} <!-- Safe from XSS -->

// Pipe for sanitization if needed
<div [innerHTML]="safeHtml | sanitizer"></div>
```

### CSRF Protection
```typescript
// When implementing API calls:
// Use HttpClient with CSRF tokens
// Configure CSRF interceptor
```

## Summary: Angular Best Practices Checklist ✅

- [x] Standalone components
- [x] Service layer abstraction
- [x] Observable-based state management
- [x] Reactive forms with validation
- [x] Proper typing with TypeScript
- [x] Component communication patterns
- [x] Memory management (unsubscribe)
- [x] Error handling strategy
- [x] Responsive design
- [x] Accessibility considerations
- [x] Performance optimizations
- [x] Code organization and SRP
- [x] User feedback (dialogs, errors)
- [x] Clean, readable code
- [x] Documentation

---

This architecture ensures maintainability, scalability, and follows Angular framework best practices.
