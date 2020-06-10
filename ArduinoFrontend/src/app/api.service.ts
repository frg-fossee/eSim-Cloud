import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': `Token ${token}`,
      'Access-Control-Allow-Origin': '*',
    })
  };
  url = 'http://localhost:8000/';
  constructor(private http: HttpClient) { }
  saveProject(data: any) {
    // this.httpOptions.headers.set('', '');
    return this.http.post(`${this.url}api/save`, data);
  }
  listProject() {
    return this.http.get(`${this.url}api/save/list`);
  }
  readProject(projectId: string) {
    return this.http.get(`${this.url}api/save/${projectId}`);
  }
  updateProject(projectId: string, data: any) {
    return this.http.post(`${this.url}api/save/${projectId}`, data);
  }
  deleteProject() {

  }
  fetchSuggestions(): Observable<any> {
    return this.http.get('assets/jsons/specification.json');
  }

  compileCode(data: any): Observable<any> {
    return this.http.post(`${this.url}api/arduino/compile`, data);
  }

  getHex(taskId: string): Observable<any> {
    return this.http.get(`${this.url}api/arduino/compile/status?task_id=${taskId}`);
  }

  getToken() {

  }

  redirectToLogin() {
    console.log(window.location.host);
  }
}
