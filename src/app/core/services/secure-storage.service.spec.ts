import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
  let service: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem', () => {
    it('should store item with prefix', () => {
      service.setItem('test_key', 'test_value');
      expect(localStorage.getItem('bookstore_test_key')).toBe('test_value');
    });

    it('should handle storage errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => service.setItem('test', 'value')).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Storage unavailable');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getItem', () => {
    it('should retrieve item with prefix', () => {
      localStorage.setItem('bookstore_test_key', 'test_value');
      expect(service.getItem('test_key')).toBe('test_value');
    });

    it('should return null for non-existent key', () => {
      expect(service.getItem('non_existent')).toBeNull();
    });

    it('should return null on storage error', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(service.getItem('test')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item with prefix', () => {
      localStorage.setItem('bookstore_test_key', 'test_value');
      service.removeItem('test_key');
      expect(localStorage.getItem('bookstore_test_key')).toBeNull();
    });

    it('should handle removal errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => service.removeItem('test')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear only items with prefix', () => {
      localStorage.setItem('bookstore_key1', 'value1');
      localStorage.setItem('bookstore_key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      service.clear();

      expect(localStorage.getItem('bookstore_key1')).toBeNull();
      expect(localStorage.getItem('bookstore_key2')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });
  });
});
