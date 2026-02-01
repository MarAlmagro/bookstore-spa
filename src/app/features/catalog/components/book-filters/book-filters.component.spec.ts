import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BookFiltersComponent } from './book-filters.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('BookFiltersComponent', () => {
  let component: BookFiltersComponent;
  let fixture: ComponentFixture<BookFiltersComponent>;

  const mockCategories = ['Fiction', 'Tech', 'Science'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookFiltersComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(BookFiltersComponent);
    component = fixture.componentInstance;
    component.categories = mockCategories;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have search control initialized', () => {
    expect(component.searchControl).toBeTruthy();
    expect(component.searchControl.value).toBe('');
  });

  it('should emit categoryChange when category selected', () => {
    jest.spyOn(component.categoryChange, 'emit');

    component.categoryControl.setValue('Fiction');

    expect(component.categoryChange.emit).toHaveBeenCalledWith('Fiction');
  });

  it('should emit null when all categories selected', () => {
    jest.spyOn(component.categoryChange, 'emit');

    component.categoryControl.setValue(null);

    expect(component.categoryChange.emit).toHaveBeenCalledWith(null);
  });

  it('should clear filters', () => {
    jest.spyOn(component.searchChange, 'emit');
    component.searchControl.setValue('test', { emitEvent: false });
    component.categoryControl.setValue('Fiction', { emitEvent: false });

    component.clearFilters();

    expect(component.searchControl.value).toBe('');
    expect(component.categoryControl.value).toBeNull();
    expect(component.searchChange.emit).toHaveBeenCalledWith('');
  });

  it('should detect active filters', () => {
    expect(component.hasActiveFilters()).toBe(false);

    component.searchControl.setValue('test');
    expect(component.hasActiveFilters()).toBe(true);

    component.searchControl.setValue('');
    component.categoryControl.setValue('Fiction');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should set initial category from input', () => {
    component.selectedCategory = 'Tech';
    component.ngOnInit();

    expect(component.categoryControl.value).toBe('Tech');
  });
});
