import { TestBed } from '@angular/core/testing';
import { AnnouncerService } from './announcer.service';

describe('AnnouncerService', () => {
  let service: AnnouncerService;
  let mockAnnouncer: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnnouncerService]
    });
    service = TestBed.inject(AnnouncerService);

    mockAnnouncer = document.createElement('div');
    mockAnnouncer.id = 'announcer';
    document.body.appendChild(mockAnnouncer);
  });

  afterEach(() => {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.remove();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should announce message with polite politeness by default', (done) => {
    service.announce('Test message');

    setTimeout(() => {
      expect(mockAnnouncer.getAttribute('aria-live')).toBe('polite');
      expect(mockAnnouncer.textContent).toBe('Test message');
      done();
    }, 150);
  });

  it('should announce message with assertive politeness', (done) => {
    service.announce('Urgent message', 'assertive');

    setTimeout(() => {
      expect(mockAnnouncer.getAttribute('aria-live')).toBe('assertive');
      expect(mockAnnouncer.textContent).toBe('Urgent message');
      done();
    }, 150);
  });

  it('should clear previous message before announcing new one', (done) => {
    mockAnnouncer.textContent = 'Old message';
    
    service.announce('New message');

    expect(mockAnnouncer.textContent).toBe('');

    setTimeout(() => {
      expect(mockAnnouncer.textContent).toBe('New message');
      done();
    }, 150);
  });

  it('should handle missing announcer element gracefully', () => {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.remove();
    }

    expect(() => service.announce('Test')).not.toThrow();
  });
});
