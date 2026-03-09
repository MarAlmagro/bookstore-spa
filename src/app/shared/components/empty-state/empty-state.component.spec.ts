import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.message = 'No items found';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default icon as "info"', () => {
    component.message = 'No items';
    fixture.detectChanges();
    expect(component.icon).toBe('info');
  });

  it('should display the message', () => {
    component.message = 'No results found';
    fixture.detectChanges();
    const messageEl = fixture.debugElement.query(By.css('.empty-message'));
    expect(messageEl.nativeElement.textContent).toContain('No results found');
  });

  it('should display the icon', () => {
    component.icon = 'search_off';
    component.message = 'No results';
    fixture.detectChanges();
    const iconEl = fixture.debugElement.query(By.css('.empty-icon'));
    expect(iconEl.nativeElement.textContent).toContain('search_off');
  });

  it('should show action button when actionLabel is provided', () => {
    component.message = 'No items';
    component.actionLabel = 'Browse All';
    fixture.detectChanges();
    const actionBtn = fixture.debugElement.query(By.css('[data-testid="empty-state-action"]'));
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.nativeElement.textContent).toContain('Browse All');
  });

  it('should not show action button when actionLabel is not provided', () => {
    component.message = 'No items';
    fixture.detectChanges();
    const actionBtn = fixture.debugElement.query(By.css('[data-testid="empty-state-action"]'));
    expect(actionBtn).toBeFalsy();
  });

  it('should emit actionClick when action button is clicked', () => {
    component.message = 'No items';
    component.actionLabel = 'Browse All';
    fixture.detectChanges();

    jest.spyOn(component.actionClick, 'emit');
    const actionBtn = fixture.debugElement.query(By.css('[data-testid="empty-state-action"]'));
    actionBtn.triggerEventHandler('click', null);

    expect(component.actionClick.emit).toHaveBeenCalled();
  });

  it('should call onAction which emits actionClick', () => {
    jest.spyOn(component.actionClick, 'emit');
    component.onAction();
    expect(component.actionClick.emit).toHaveBeenCalled();
  });
});
