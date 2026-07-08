import { Injectable, signal, computed } from '@angular/core';
import { Todo, CreateTodoPayload, UpdateTodoPayload, Priority, Status } from '../models/todo.model';

@Injectable({
    providedIn: 'root', // Singleton — pura app ek hi instance share karta hai
})
export class TodoStore {
    private readonly STORAGE_KEY = 'todos';

    // ── Core state (Signals) ──────────────────────────────────────
    
    private readonly todosSignal = signal<Todo[]>(this.loadTodos());

    private readonly searchTermSignal = signal<string>('');

    private readonly statusFilterSignal = signal<Status | null>(null);
    private readonly priorityFilterSignal = signal<Priority | null>(null);

    // ── Readonly signals (public API) ───────────────────────────
    readonly todos = this.todosSignal.asReadonly();
    readonly searchTerm = this.searchTermSignal.asReadonly();
    readonly statusFilter = this.statusFilterSignal.asReadonly();
    readonly priorityFilter = this.priorityFilterSignal.asReadonly();

    // ── Computed signals (derived state) ──────────────────────────
    readonly filteredTodos = computed(() => {
        const search = this.searchTermSignal().toLowerCase().trim();
        const status = this.statusFilterSignal();
        const priority = this.priorityFilterSignal();

        return this.todosSignal().filter((todo) => {
            const matchesSearch = search
                ? todo.title.toLowerCase().includes(search) ||
                  todo.description?.toLowerCase().includes(search)
                : true;
            const matchesStatus = status ? todo.status === status : true;
            const matchesPriority = priority ? todo.priority === priority : true;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    });

    readonly statistics = computed(() => {
        const todos = this.todosSignal();
        return {
            completed: todos.filter((t) => t.status === 'completed').length,
            inProgress: todos.filter((t) => t.status === 'in-progress').length,
            notStarted: todos.filter((t) => t.status === 'not-started').length,
            total: todos.length,
        };
    });

    // ── Mutation methods (state ko change karne ka sirf yahi tareeka) ──

    addTodo(payload: CreateTodoPayload): void {
        const newTodo: Todo = {
            id: this.generateId(),
            ...payload,
            status: 'not-started',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.todosSignal.update((list) => [newTodo, ...list]);
        this.saveTodos(this.todosSignal());
    }

    updateTodo(id: string, payload: UpdateTodoPayload): void {
        this.todosSignal.update((list) =>
            list.map((todo) =>
                todo.id === id
                    ? { ...todo, ...payload, updatedAt: new Date() }
                    : todo
            )
        );
        this.saveTodos(this.todosSignal());
    }

    
    deleteTodo(id: string): void {
        this.todosSignal.update((list) => list.filter((todo) => todo.id !== id));
        this.saveTodos(this.todosSignal());
    }

    
    getTodoById(id: string): Todo | undefined {
        return this.todosSignal().find((todo) => todo.id === id);
    }

    
    setSearchTerm(term: string): void {
        this.searchTermSignal.set(term);
    }

    
    setStatusFilter(status: Status | null): void {
        this.statusFilterSignal.set(status);
    }

    
    setPriorityFilter(priority: Priority | null): void {
        this.priorityFilterSignal.set(priority);
    }

    
    markAsCompleted(id: string): void {
        this.updateTodo(id, { status: 'completed' });
    }

    
    markAsInProgress(id: string): void {
        this.updateTodo(id, { status: 'in-progress' });
    }

    // ── Private helpers ─────────────────────────────────────────

    private generateId(): string {
        return `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private getInitialTodos(): Todo[] {
        return [
            {
                id: 'todo-1',
                title: "Attend Nischal's Birthday Party",
                description: 'Buy gifts on the way and pick up cake from the bakery. (8 PM Fresh Elements)',
                dueDate: new Date(2025, 5, 20),
                priority: 'moderate',
                status: 'not-started',
                tags: ['personal', 'event'],
                createdAt: new Date(2025, 5, 15),
                updatedAt: new Date(2025, 5, 15),
            },
            {
                id: 'todo-2',
                title: 'Landing Page Design for TravelDays',
                description: 'Get the work done by EOD and discuss with client before leaving. (4 PM | Meeting Room)',
                dueDate: new Date(2025, 5, 22),
                priority: 'moderate',
                status: 'in-progress',
                tags: ['work', 'design'],
                createdAt: new Date(2025, 5, 15),
                updatedAt: new Date(2025, 5, 16),
            },
            {
                id: 'todo-3',
                title: 'Presentation on Final Product',
                description: 'Make sure everything is functioning and all the necessities are properly met. Prepare the team and get the documents ready for...',
                dueDate: new Date(2025, 5, 25),
                priority: 'moderate',
                status: 'in-progress',
                tags: ['work', 'presentation'],
                createdAt: new Date(2025, 5, 15),
                updatedAt: new Date(2025, 5, 16),
            },
            {
                id: 'todo-4',
                title: 'Walk the dog',
                description: 'Take the dog to the park and bring treats as well.',
                dueDate: new Date(2025, 5, 18),
                priority: 'low',
                status: 'completed',
                tags: ['personal'],
                createdAt: new Date(2025, 5, 10),
                updatedAt: new Date(2025, 5, 18),
            },
            {
                id: 'todo-5',
                title: 'Conduct meeting',
                description: 'Meet with the client and finalize requirements.',
                dueDate: new Date(2025, 5, 19),
                priority: 'extreme',
                status: 'completed',
                tags: ['work', 'meeting'],
                createdAt: new Date(2025, 5, 12),
                updatedAt: new Date(2025, 5, 19),
            },
            {
                id: 'todo-6',
                title: 'Code review for backend API',
                description: 'Review the new authentication module and provide feedback.',
                dueDate: new Date(2025, 5, 23),
                priority: 'extreme',
                status: 'in-progress',
                tags: ['work', 'code-review'],
                createdAt: new Date(2025, 5, 16),
                updatedAt: new Date(2025, 5, 17),
            },
        ];
    }

    private loadTodos(): Todo[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored).map((todo: Todo) => ({
                ...todo,
                dueDate: new Date(todo.dueDate),
                createdAt: new Date(todo.createdAt),
                updatedAt: new Date(todo.updatedAt),
            }));
        }

        const todos = this.getInitialTodos();
        this.saveTodos(todos);
        return todos;
    }

    private saveTodos(todos: Todo[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    }
}