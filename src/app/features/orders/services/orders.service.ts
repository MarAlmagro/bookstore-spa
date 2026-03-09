import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { API_ENDPOINTS } from '@app/core/constants/api.constants';
import { Order, CreateOrderRequest } from '@app/models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(
      `${environment.apiUrl}${API_ENDPOINTS.ORDERS.CREATE}`,
      order
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(
      `${environment.apiUrl}${API_ENDPOINTS.ORDERS.BY_ID(id)}`
    );
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${environment.apiUrl}${API_ENDPOINTS.ORDERS.BY_USER(userId)}`
    );
  }
}
