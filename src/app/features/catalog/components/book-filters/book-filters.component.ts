import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-book-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './book-filters.component.html',
  styleUrls: ['./book-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookFiltersComponent implements OnInit {
  @Input() categories: string[] = [];
  @Input() selectedCategory: string | null = null;
  @Output() categoryChange = new EventEmitter<string | null>();
  @Output() searchChange = new EventEmitter<string>();

  private readonly destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  categoryControl = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.searchChange.emit(value || '');
    });

    this.categoryControl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.categoryChange.emit(value);
    });

    if (this.selectedCategory) {
      this.categoryControl.setValue(this.selectedCategory, { emitEvent: false });
    }
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue(null);
    this.searchChange.emit('');
  }

  hasActiveFilters(): boolean {
    return !!(this.searchControl.value || this.categoryControl.value);
  }
}
