# Quick Reference Guide

## Project Structure at a Glance

```
src/app/
├── models/
│   └── todo.model.ts              # Types: Todo, Priority, Status
├── services/
│   └── todo.service.ts            # Business logic + RxJS streams
├── components/
│   ├── dashboard/
│   │   └── dashboard.component.ts # Main container (Smart)
│   ├── todo-card/
│   │   └── todo-card.component.ts # Card display (Dumb)
│   └── todo-form/
│       └── todo-form.component.ts # Form add/edit (Dumb)
├── app.ts                         # Root component
├── app.routes.ts                  # Routes
└── app.config.ts                  # Config
```

## Key Files Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `todo.model.ts` | Type definitions | Todo, Priority, Status interfaces |
| `todo.service.ts` | Business logic | TodoService with observables |
| `dashboard.component.ts` | Main UI container | State, filters, CRUD operations |
| `todo-card.component.ts` | Task display | Card UI, action buttons |
| `todo-form.component.ts` | Form UI | Add/Edit form with validation |

## Services Overview

### TodoService API

```typescript
// Reading
getTodos$(): Observable<Todo[]>
getTodoById(id: string): Todo | undefined
getCurrentTodos(): Todo[]
getStatistics(): { completed, inProgress, notStarted, total }

// Writing
addTodo(payload: CreateTodoPayload): void
updateTodo(id: string, payload: UpdateTodoPayload): void
deleteTodo(id: string): void

// Status
markAsCompleted(id: string): void
markAsInProgress(id: string): void

// Filtering
setStatusFilter(status: Status | null): void
setPriorityFilter(priority: Priority | null): void
setSearchTerm(term: string): void

// Observables
todos$: Observable<Todo[]>
filteredTodos$: Observable<Todo[]>
searchTodos$: Observable<string>
statusFilteredTodos$: Observable<Status | null>
priorityFilteredTodos$: Observable<Priority | null>
```

## Component Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Component (Smart)                             │
│ ├─ State: showForm, editingTodo, currentPage            │
│ ├─ Observable: filteredTodos$                           │
│ └─ Methods: onFormSave(), deleteTodo(), etc.            │
└────────────────┬────────────────────────────────────────┘
         ┌───────┴──────────┬──────────────┐
         ▼                  ▼              ▼
    ┌─────────┐      ┌──────────┐   ┌────────────┐
    │ TodoCard│      │TodoForm  │   │ Filters    │
    │ (Dumb)  │      │ (Dumb)   │   │            │
    └────┬────┘      └────┬─────┘   └────┬───────┘
         │                │              │
         └────────┬───────┴──────────────┘
                  │
         @Output events
                  │
         ┌────────▼────────┐
         │ TodoService     │
         │ (Business Logic)│
         └────────┬────────┘
                  │
         emit updated state
                  │
         back to Dashboard
```

## RxJS Operators Quick Reference

| Operator | Purpose | Common Use |
|----------|---------|-----------|
| `shareReplay(1)` | Share cached value | Observable caching |
| `tap()` | Side effects/logging | Debugging |
| `map()` | Transform data | Data shape change |
| `filter()` | Conditional | Filter by status |
| `debounceTime(ms)` | Wait before emit | Search input |
| `distinctUntilChanged()` | Prevent duplicates | Avoid unnecessary updates |
| `switchMap()` | Switch inner observable | Chain requests |
| `combineLatest()` | Combine multiple streams | Multi-filter logic |
| `takeUntil()` | Complete on signal | Cleanup subscriptions |
| `startWith()` | Emit initial value | Default state |

## Component Lifecycle

```
Angular Creates Component
    ↓
ngOnInit() - Initialize data subscriptions
    ↓
User Interacts - Click, type, select
    ↓
Event Handler - Calls service methods
    ↓
Service Updates State - BehaviorSubject.next()
    ↓
Observables Emit - Push new values
    ↓
Components Update - Change detection
    ↓
Template Re-renders - async pipe updates
    ↓
ngOnDestroy() - Cleanup subscriptions
    ↓
Component Destroyed
```

## Form Validation Quick Guide

```typescript
// Required field
title: ['', Validators.required]

// Minimum length
title: ['', Validators.minLength(3)]

// Custom validator
title: ['', [
  Validators.required,
  Validators.minLength(3)
]]

// Check if valid
form.valid // true/false

// Get field error
form.get('fieldName')?.hasError('required')

// Mark as touched to show errors
form.markAllAsTouched()
```

## State Management Pattern

```typescript
// Signals (UI state)
readonly showForm = signal(false);
readonly currentPage = signal(1);

// Update signal
this.showForm.set(true);
this.currentPage.update(p => p + 1);

// Observables (data state)
public todos$ = this.todoSubject.asObservable();

// Update observable
this.todoSubject.next(newValue);

// Subscribe to signal
const isOpen = this.showForm(); // Direct access
{{ showForm() }} // Template access

// Subscribe to observable
(todos$ | async) // Template subscription
this.todos$.subscribe(...) // Manual subscription
```

## Debugging Tips

### 1. Console Logging with tap()
```typescript
this.todos$.pipe(
  tap(todos => console.log('Todos:', todos))
).subscribe();
```

### 2. View Signal Values
```typescript
console.log(this.showForm()); // Get current value
console.log(this.currentPage.get()); // Alternative
```

### 3. Check Form State
```typescript
console.log(this.form.value);      // Form data
console.log(this.form.valid);      // Is valid?
console.log(this.form.errors);     // Errors
console.log(this.form.touched);    // Was touched?
```

### 4. Subscribe Manually (Development)
```typescript
this.todos$.subscribe({
  next: value => console.log('Next:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Complete')
});
```

## Performance Checklist

- [ ] Using `shareReplay()` for observables
- [ ] Unsubscribing in `ngOnDestroy()`
- [ ] Using `OnPush` change detection (when applicable)
- [ ] Pagination implemented for large lists
- [ ] No unnecessary subscriptions
- [ ] Form validation on input (not on every change)
- [ ] Images optimized
- [ ] CSS utilities used (not custom CSS)
- [ ] No console errors/warnings
- [ ] Signals for local UI state (not Observables)

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property of undefined` | Null/undefined access | Add null check or optional chaining |
| `Expression has changed...` | Change detection issue | Use OnPush strategy, fix async issues |
| `Memory leak` | Subscription not unsubscribed | Use takeUntil in ngOnDestroy |
| `Form invalid` | Validation not passing | Check required fields, patterns |
| `Observable not emitting` | Wrong operator used | Check shareReplay, tap, etc. |
| `Infinite loop` | Circular subscriptions | Avoid nested subscribes |

## VS Code Extensions for Development

```json
{
  "extensions": [
    "Angular.ng-template",
    "TypeScriptLang.TypeScript",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ritwickdey.LiveServer",
    "eamodio.gitlens"
  ]
}
```

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch files during development
npm run watch

# Format code with Prettier
npm run format

# Lint code
npm run lint
```

## Browser DevTools Tips

### Angular DevTools
1. Install Angular DevTools extension
2. Open DevTools → Angular tab
3. Inspect component state
4. View change detection events
5. Profile performance

### Console
```javascript
// Get component instance
const comp = ng.getComponent(element)

// View service
const service = ng.probe(element).injector.get(ServiceName)

// Trigger change detection
ng.probe(element).injector.get(ApplicationRef).tick()
```

## Template Syntax Cheat Sheet

```html
<!-- Property binding -->
<div [property]="value"></div>

<!-- Event binding -->
<button (click)="method()"></button>

<!-- Two-way binding (forms)-->
<input [(ngModel)]="value">

<!-- Structural directive -->
<div *ngIf="condition">...</div>
<div *ngFor="let item of items">...</div>

<!-- Attribute directive -->
<div [ngClass]="{'active': isActive}"></div>
<div [ngStyle]="{'color': isDark ? 'white' : 'black'}"></div>

<!-- Pipe -->
{{ date | date: 'shortDate' }}
{{ todos$ | async | slice:0:10 }}

<!-- Safe navigation -->
{{ todo?.title }}
{{ todo?.tags | slice:0:3 }}
```

## Git Workflow

```bash
# Feature branch
git checkout -b feature/add-categories
git add .
git commit -m "feat: add task categories"
git push origin feature/add-categories

# Create Pull Request
# Review → Merge → Delete branch

# Update from main
git fetch origin
git rebase origin/main
```

## Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] All tests pass: `npm test`
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Production build optimized
- [ ] SEO tags added
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Monitoring enabled

## Resources

- 📚 [Angular Documentation](https://angular.io/)
- 📚 [RxJS Documentation](https://rxjs.dev/)
- 📚 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 📚 [Tailwind CSS](https://tailwindcss.com/)
- 🎓 [Angular University](https://angular-university.io/)
- 🎓 [RxJS Course](https://www.udemy.com/course/rxjs-reactive-programming/)
- 🎨 [Design Patterns](https://refactoring.guru/design-patterns)

## Tips for Success

1. **Type Everything** - Use TypeScript to catch errors early
2. **Keep Components Small** - Single Responsibility Principle
3. **Use Services** - Centralize business logic
4. **Optimize Observables** - Use shareReplay, tap wisely
5. **Clean Up** - Always unsubscribe in ngOnDestroy
6. **Test Often** - Write unit tests for services
7. **Document Code** - Add comments for complex logic
8. **Follow Conventions** - Maintain consistent naming
9. **Performance First** - Use OnPush when possible
10. **Security Always** - Validate inputs, sanitize outputs

---

**Need Help?**
- Check documentation in `/docs` folder
- See code examples in `CODE_EXAMPLES.md`
- Review architecture in `ARCHITECTURE.md`
- Refer to app features in `APP_DOCUMENTATION.md`

**Last Updated**: July 7, 2026
