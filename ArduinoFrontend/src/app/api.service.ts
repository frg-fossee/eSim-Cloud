import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  fetchSuggestions(): Observable<any> {
    return this.http.get('assets/jsons/specification.json');
  }
}
