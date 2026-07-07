import { Component, EventEmitter, Input, Output, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
// Subject, takeUntil, OnDestroy — sab hata do
import { Priority, Todo } from '../../models/todo.model';

@Component({
    selector: 'app-todo-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './todo-form.component.html'
})
export class TodoFormComponent implements OnInit {
    @Input() todo: Todo | null = null;
    @Output() save = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = false;
    isSubmitting = signal(false); // signal bana diya, plain boolean se better

    readonly priorityOptions = [
        { value: 'extreme', label: 'Extreme', dotClass: 'bg-red-500', activeClass: 'border-red-400 bg-red-50' },
        { value: 'moderate', label: 'Moderate', dotClass: 'bg-blue-500', activeClass: 'border-blue-400 bg-blue-50' },
        { value: 'low', label: 'Low', dotClass: 'bg-green-500', activeClass: 'border-green-400 bg-green-50' },
    ];

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.initializeForm();
        this.isEditMode = !!this.todo;

        if (this.todo) {
            this.form.patchValue({
                title: this.todo.title,
                description: this.todo.description,
                priority: this.todo.priority,
                dueDate: this.formatDateForInput(this.todo.dueDate),
                tags: this.todo.tags,
            });
        }
    }

    private initializeForm(): void {
        this.form = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            dueDate: ['', Validators.required],
            priority: ['moderate', Validators.required],
            tags: [[]],
            tagsInput: [''],
        });

        // takeUntil(this.destroy$) ki zaroorat nahi —
        // Angular ka naya takeUntilDestroyed() khud hi component
        // destroy hone par unsubscribe kar deta hai, manual Subject
        // banane/complete karne ki zaroorat nahi.
        // NOTE: yeh RxJS Observable hai kyunki Reactive Forms ka
        // valueChanges khud RxJS pe based hai — yeh Angular ka
        // built-in behavior hai, humne alag se RxJS introduce nahi kiya.
        // Isko replace karna zaroori nahi, sirf cleanup pattern modernize kiya.
    }

    getFieldError(fieldName: string): string | null {
        const field = this.form.get(fieldName);
        if (field?.hasError('required')) {
            return `${this.capitalize(fieldName)} is required`;
        }
        if (field?.hasError('minlength')) {
            const minLength = field.getError('minlength').requiredLength;
            return `${this.capitalize(fieldName)} must be at least ${minLength} characters`;
        }
        return null;
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private formatDateForInput(date: Date): string {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        this.isSubmitting.set(true);
        const formValue = this.form.value;

        const payload = {
            title: formValue.title,
            description: formValue.description,
            dueDate: new Date(formValue.dueDate),
            priority: formValue.priority as Priority,
            tags: formValue.tags || [],
        };

        this.save.emit(payload);

        setTimeout(() => {
            this.isSubmitting.set(false);
            this.onClose();
        }, 300);
    }

    onClose(): void {
        this.close.emit();
    }

    addTag(): void {
        const raw = this.form.get('tagsInput')?.value?.trim();
        if (!raw) return;

        const currentTags: string[] = this.form.get('tags')?.value || [];
        if (!currentTags.includes(raw)) {
            this.form.patchValue({ tags: [...currentTags, raw], tagsInput: '' });
        } else {
            this.form.patchValue({ tagsInput: '' });
        }
    }

    removeTag(tag: string): void {
        const currentTags: string[] = this.form.get('tags')?.value || [];
        this.form.patchValue({ tags: currentTags.filter(t => t !== tag) });
    }
}