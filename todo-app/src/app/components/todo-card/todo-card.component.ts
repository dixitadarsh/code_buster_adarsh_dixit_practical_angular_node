import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Status, Todo } from '../../models/todo.model';

@Component({
    selector: 'app-todo-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './todo-card.component.html',
    styles: [],
})
export class TodoCardComponent {
    @Input() todo!: Todo;
    @Output() edit = new EventEmitter<Todo>();
    @Output() delete = new EventEmitter<Todo>();
    @Output() markCompleted = new EventEmitter<Todo>();

    // Naya output — koi bhi status set karne ke liye generic event
    @Output() statusChange = new EventEmitter<{ todo: Todo; status: Status }>();

    readonly expanded = signal(false);
    readonly menuOpen = signal(false);
    readonly tagsExpanded = signal(false);

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-menu-root]')) {
            this.menuOpen.set(false);
        }
    }

    getPriorityRingClass(): string {
        switch (this.todo.priority) {
            case 'extreme':
                return 'border-red-500';
            case 'moderate':
                return 'border-blue-500';
            case 'low':
                return 'border-green-500';
            default:
                return 'border-gray-400';
        }
    }

    getPriorityTextClass(): string {
        switch (this.todo.priority) {
            case 'extreme':
                return 'text-red-600';
            case 'moderate':
                return 'text-blue-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    }

    getStatusTextClass(): string {
        switch (this.todo.status) {
            case 'completed':
                return 'text-green-600';
            case 'in-progress':
                return 'text-blue-600';
            case 'not-started':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    }

    getPriorityLabel(priority: string): string {
        switch (priority) {
            case 'extreme':
                return 'Extreme';
            case 'moderate':
                return 'Moderate';
            case 'low':
                return 'Low';
            default:
                return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in-progress':
                return 'In Progress';
            case 'not-started':
                return 'Not Started';
            default:
                return '';
        }
    }

    formatDate(date: Date): string {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    toggleMenu(): void {
        this.menuOpen.update(v => !v);
    }

    toggleDescription(): void {
        this.expanded.update(v => !v);
    }

    /**
     * Generic status changer — menu se koi bhi status select
     * karne par yeh call hoga.
     */
    onChangeStatus(status: Status): void {
        this.statusChange.emit({ todo: this.todo, status });
        this.menuOpen.set(false);
    }

    onEdit(): void {
        this.edit.emit(this.todo);
        this.menuOpen.set(false);
    }

    onDelete(): void {
        this.delete.emit(this.todo);
        this.menuOpen.set(false);
    }

    onMarkCompleted(): void {
        this.onChangeStatus('completed');
    }

    getPriorityBarClass(): string {
        switch (this.todo.priority) {
            case 'extreme': return 'bg-gradient-to-r from-red-400 to-rose-500';
            case 'moderate': return 'bg-gradient-to-r from-blue-400 to-indigo-500';
            case 'low': return 'bg-gradient-to-r from-emerald-400 to-green-500';
            default: return 'bg-slate-300';
        }
    }

    getPriorityPillClass(): string {
        switch (this.todo.priority) {
            case 'extreme': return 'bg-red-50 text-red-600';
            case 'moderate': return 'bg-blue-50 text-blue-600';
            case 'low': return 'bg-emerald-50 text-emerald-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    getPriorityDotClass(): string {
        switch (this.todo.priority) {
            case 'extreme': return 'bg-red-500';
            case 'moderate': return 'bg-blue-500';
            case 'low': return 'bg-emerald-500';
            default: return 'bg-slate-400';
        }
    }

    getStatusPillClass(): string {
        switch (this.todo.status) {
            case 'completed': return 'bg-emerald-500 text-white';
            case 'in-progress': return 'bg-blue-500 text-white';
            case 'not-started': return 'bg-slate-100 text-slate-500';
            default: return 'bg-slate-100 text-slate-500';
        }
    }


    toggleTags(): void {
        this.tagsExpanded.update(v => !v);
    }
}