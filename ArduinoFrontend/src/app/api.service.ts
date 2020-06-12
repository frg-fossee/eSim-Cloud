import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = 'http://localhost:8000/';
  constructor(private http: HttpClient) {
    if (window.location.host.indexOf('4200') <= -1) {
      this.url = '';
    }
  }
  saveProject(data: any, token: string) {
    // const data = new HttpParams();
    // data.set('name', 'name');
    // data.set('description', 'description');
    // data.set('is_arduino', 'true');
    // data.set('data_dump', 'sss');
    // data.set('base64_image','ss');
    // test.set()
    // console.log(data);
    // console.log(data.toString());
    return this.http.post(`${this.url}api/save`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Token ${token}`,
        'Access-Control-Allow-Origin': '*',
      })
    });
  }
  listProject() {
    return this.http.get(`${this.url}api/save/arduino/list`);
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
}
