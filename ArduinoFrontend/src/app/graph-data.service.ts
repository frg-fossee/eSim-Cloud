import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {

  public static portDChange: EventEmitter<Object> = new EventEmitter<Object>();
  public static portBChange: EventEmitter<Object> = new EventEmitter<Object>();
  public static voltageChange: EventEmitter<Object> = new EventEmitter<Object>();

  constructor() { }  
}
