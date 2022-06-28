import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {

  public static portDChange: EventEmitter<object> = new EventEmitter<object>();
  public static portBChange: EventEmitter<object> = new EventEmitter<object>();
  public static voltageChange: EventEmitter<object> = new EventEmitter<object>();

  constructor() { }
}
