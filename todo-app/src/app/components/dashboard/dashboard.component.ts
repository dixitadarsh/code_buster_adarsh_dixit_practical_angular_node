import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { TodoStore } from '../../services/todo.service';

import { TodoCardComponent } from '../todo-card/todo-card.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';

import {
    Todo,
    Status,
    Priority,
    CreateTodoPayload,
    UpdateTodoPayload
} from '../../models/todo.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        TodoCardComponent,
        TodoFormComponent
    ],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent {

    /* ==========================================================
        SERVICES INJECT
    ========================================================== */
    private readonly todoStore = inject(TodoStore);

    /* ==========================================================
        UI STATE
    ========================================================== */

    readonly showForm = signal(false);

    readonly editingTodo = signal<Todo | null>(null);

    readonly currentPage = signal(1);

    readonly itemsPerPage = signal(8);



    /* ==========================================================
        SEARCH
    ========================================================== */

    readonly searchText = signal('');



    /* ==========================================================
        FILTERS
    ========================================================== */

    readonly selectedStatus = signal<Status | null>(null);

    readonly selectedPriority = signal<Priority | null>(null);



    /* ==========================================================
        SORTING
    ========================================================== */

    readonly sortBy = signal<
        'newest' |
        'oldest' |
        'priority' |
        'title'
    >('newest');



    /* ==========================================================
        FILTER BUTTONS
    ========================================================== */

    readonly statuses: ReadonlyArray<{
        label: string;
        value: Status | null;
    }> = [
            {
                label: 'All Tasks',
                value: null
            },
            {
                label: 'Not Started',
                value: 'not-started'
            },
            {
                label: 'In Progress',
                value: 'in-progress'
            },
            {
                label: 'Completed',
                value: 'completed'
            }
        ];



    /* ==========================================================
        TODOS SIGNAL
    ========================================================== */

    readonly todos = this.todoStore.todos;



    /* ==========================================================
        FILTERED TODOS
    ========================================================== */

    readonly filteredTodos = computed(() => {

        let todos = [...this.todos()];


        /* Search */

        const search = this.searchText().trim().toLowerCase();

        if (search.length) {

            todos = todos.filter(todo =>
                todo.title.toLowerCase().includes(search) ||

                todo.description
                    ?.toLowerCase()
                    .includes(search)
            );

        }


        /* Status */

        const status = this.selectedStatus();

        if (status) {

            todos = todos.filter(todo =>
                todo.status === status
            );

        }


        /* Priority */

        const priority = this.selectedPriority();

        if (priority) {

            todos = todos.filter(todo =>
                todo.priority === priority
            );

        }


        /* Sorting */

        switch (this.sortBy()) {

            case 'title':

                todos.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );

                break;

            case 'priority':

                const order = {

                    extreme: 3,

                    moderate: 2,

                    low: 1

                };

                todos.sort(
                    (a, b) =>
                        order[b.priority] -
                        order[a.priority]
                );

                break;

            case 'oldest':

                todos.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );

                break;

            default:

                todos.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );

        }

        return todos;

    });



    /* ==========================================================
        STATISTICS
    ========================================================== */

    readonly statistics = computed(() => {

        const todos = this.todos();

        return {

            total: todos.length,

            completed:
                todos.filter(t => t.status === 'completed').length,

            inProgress:
                todos.filter(t => t.status === 'in-progress').length,

            notStarted:
                todos.filter(t => t.status === 'not-started').length

        };

    });



    constructor() { }
    /* ==========================================================
        PAGINATION
    ========================================================== */

    readonly totalPages = computed(() =>
        Math.max(
            1,
            Math.ceil(
                this.filteredTodos().length /
                this.itemsPerPage()
            )
        )
    );

    readonly paginatedTodos = computed(() => {

        const start =
            (this.currentPage() - 1) *
            this.itemsPerPage();

        return this.filteredTodos().slice(
            start,
            start + this.itemsPerPage()
        );

    });

    readonly pageNumbers = computed(() => {

        const total = this.totalPages();

        const current = this.currentPage();

        const pages: number[] = [];

        let start = Math.max(1, current - 2);

        let end = Math.min(total, start + 4);

        start = Math.max(1, end - 4);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;

    });

    readonly startItem = computed(() => {

        if (!this.filteredTodos().length) {
            return 0;
        }

        return (
            (this.currentPage() - 1) *
            this.itemsPerPage() +
            1
        );

    });

    readonly endItem = computed(() =>
        Math.min(
            this.currentPage() *
            this.itemsPerPage(),
            this.filteredTodos().length
        )
    );



    /* ==========================================================
        TODAY
    ========================================================== */

    readonly today = new Intl.DateTimeFormat(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }
    ).format(new Date());



    /* ==========================================================
        SEARCH
    ========================================================== */

    onSearch(value: string): void {

        this.searchText.set(value);

        this.currentPage.set(1);

    }



    /* ==========================================================
        FILTERS
    ========================================================== */

    filterByStatus(
        status: Status | null
    ): void {

        this.selectedStatus.set(status);

        this.currentPage.set(1);

    }

    filterByPriority(
        priority: Priority | null
    ): void {

        this.selectedPriority.set(priority);

        this.currentPage.set(1);

    }

    sort(value: string): void {
        this.sortBy.set(value as 'newest' | 'oldest' | 'priority' | 'title');
    }

    isActiveStatus(
        status: Status | null
    ) {

        return this.selectedStatus() === status;

    }



    /* ==========================================================
        PAGINATION ACTIONS
    ========================================================== */

    goToPage(page: number): void {

        if (
            page >= 1 &&
            page <= this.totalPages()
        ) {

            this.currentPage.set(page);

        }

    }

    nextPage(): void {

        if (
            this.currentPage() <
            this.totalPages()
        ) {

            this.currentPage.update(
                p => p + 1
            );

        }

    }

    previousPage(): void {

        if (this.currentPage() > 1) {

            this.currentPage.update(
                p => p - 1
            );

        }

    }



    /* ==========================================================
        FORM
    ========================================================== */

    openAddForm(): void {

        this.editingTodo.set(null);

        this.showForm.set(true);

    }

    openEditForm(todo: Todo): void {

        this.editingTodo.set(todo);

        this.showForm.set(true);

    }

    closeForm(): void {

        this.showForm.set(false);

        this.editingTodo.set(null);

    }



    /* ==========================================================
        CRUD
    ========================================================== */

    onFormSave(
        payload:
            | CreateTodoPayload
            | UpdateTodoPayload
    ): void {

        const editing =
            this.editingTodo();

        if (editing) {

            this.todoStore.updateTodo(
                editing.id,
                payload as UpdateTodoPayload
            );

        } else {

            this.todoStore.addTodo(
                payload as CreateTodoPayload
            );

        }

        this.closeForm();

    }

    deleteTodo(todo: Todo): void {

        if (
            !confirm(
                `Delete "${todo.title}"?`
            )
        ) {
            return;
        }

        this.todoStore.deleteTodo(todo.id);

        if (
            this.currentPage() >
            this.totalPages()
        ) {

            this.currentPage.set(
                this.totalPages()
            );

        }

    }

    markAsCompleted(
        todo: Todo
    ): void {

        this.todoStore.markAsCompleted(
            todo.id
        );

    }

    /* ==========================================================
    BUTTON CLASSES
========================================================== */

    getFilterButtonClass(status: Status | null): string {
        return this.selectedStatus() === status
            ? 'bg-red-500 text-white border-red-500 shadow'
            : 'bg-white text-slate-600 border-slate-300 hover:border-red-400 hover:text-red-500';
    }



    /* ==========================================================
        PERCENTAGES
    ========================================================== */

    readonly completedPercentage = computed(() => {
        const stats = this.statistics();
        return stats.total
            ? (stats.completed / stats.total) * 100
            : 0;
    });

    readonly inProgressPercentage = computed(() => {
        const stats = this.statistics();
        return stats.total
            ? (stats.inProgress / stats.total) * 100
            : 0;
    });

    readonly notStartedPercentage = computed(() => {
        const stats = this.statistics();
        return stats.total
            ? (stats.notStarted / stats.total) * 100
            : 0;
    });



    /* ==========================================================
        PAGE CORRECTION
    ========================================================== */

    readonly pageWatcher = computed(() => {

        const totalPages = this.totalPages();

        if (this.currentPage() > totalPages) {
            this.currentPage.set(totalPages);
        }

    });



    /* ==========================================================
        TRACK FUNCTIONS
    ========================================================== */

    trackTodo = (_: number, todo: Todo) => todo.id;

    trackPage = (_: number, page: number) => page;

    trackStatus = (_: number, status: { label: string; value: Status | null }) =>
        status.value ?? 'all';

    onStatusChange(event: { todo: Todo; status: Status }): void {
        this.todoStore.updateTodo(event.todo.id, { status: event.status });
    }
}