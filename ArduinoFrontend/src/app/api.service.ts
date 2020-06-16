import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = environment.API_URL;
  constructor(private http: HttpClient) {
  }
  saveProject(data: any, token: string) {
    if (data.description === '') {
      data.description = null;
    }
    return this.http.post(`${this.url}api/save`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  listProject(token) {
    return this.http.get(`${this.url}api/save/arduino/list`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  readProject(id: string, token: string) {
    return this.http.get(`${this.url}api/save/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  searchProject(title: string, token: string) {
    const url = encodeURI(`${this.url}api/save/search?name__icontains=${title}&is_arduino=true`);
    return this.http.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  updateProject(id: string, data: any, token: string) {
    return this.http.post(`${this.url}api/save/${id}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  deleteProject(id, token): Observable<any> {
    return this.http.delete(`${this.url}api/save/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
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

  userInfo(token: string): Observable<any> {
    // this.httpOptions.headers.set('Authorization', `Token ${token}`);
    // this.httpOptions.headers.append('Authorization', `Token ${token}`);
    // console.log(this.httpOptions);
    // console.log(this.httpOptions.headers)
    // console.log(this.httpOptions.headers.get('Authorization'));
    return this.http.get(`${this.url}api/auth/users/me`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }

  Sharing(id: string, on: boolean, token: string) {
    const state = on ? 'on' : 'off';
    return this.http.post(`${this.url}api/save/${id}/sharing/${state}`, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
}
