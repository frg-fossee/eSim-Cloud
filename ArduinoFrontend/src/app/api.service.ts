import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Login } from './Libs/Login';

/**
 * Class For handlind API.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * The API URL
   */
  url = environment.API_URL;
  /**
   * Constructor for api
   * @param http For http request & response
   */
  constructor(private http: HttpClient) {
  }
  /**
   * Get Http Headers
   * @param token Login Token
   * @returns Http headers as per given conditions
   */
  httpHeaders(token: string) {
    if(environment.production) {
      if(token) {
        return new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
          'Access-Control-Allow-Origin': '*',
        });
      } else {
        return new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
      }
    }
    else {
      if(token) {
        return new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        });
      } else {
        return new HttpHeaders({
          'Content-Type': 'application/json',
        });
      }
    }
  }
  /**
   * Save Project to Cloud
   * @param data The Project data
   * @param token Auth Token
   */
  saveProject(data: any, token: string) {
    if (data.description === '') {
      data.description = null;
    }
    return this.http.post(`${this.url}api/save`, data, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * List all the project created by an user
   * @param token Auth Token
   */
  listProject(token) {
    return this.http.get(`${this.url}api/save/arduino/list`, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Read Project using id
   * @param id Read Project ID
   * @param branch Branch of Variation
   * @param version Version of Variation
   * @param token Auth Token
   */
   readProject(id: string, branch: string, version: string, token: string) {
    return this.http.get(`${this.url}api/save/${id}/${version}/${branch}`, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Find Project using Project name
   * @param title Project name that needs to be searched
   * @param token Auth Token
   */
  searchProject(title: string, token: string) {
    const url = encodeURI(`${this.url}api/save/search?name__icontains=${title}&is_arduino=true`);
    return this.http.get(url, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Update Project from the project id
   * @param id Project id
   * @param data Updated Project Data
   * @param token Auth Token
   */
  updateProject(id: string, data: any, token: string) {
    data.save_id = id;
    return this.http.post(`${this.url}api/save`, data, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Delete Project From  Database
   * @param id Project id
   * @param token Auth Token
   */
  deleteProject(id, token): Observable<any> {
    return this.http.delete(`${this.url}api/save/${id}`, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Compiles code and returns the status and task id
   * @param data The Code and id of arduino
   */
  compileCode(data: any): Observable<any> {
    return this.http.post(`${this.url}api/arduino/compile`, data);
  }
  /**
   * Returns the hex of the compiled code
   * @param taskId Compilation Task ID
   */
  getHex(taskId: string): Observable<any> {
    return this.http.get(`${this.url}api/arduino/compile/status?task_id=${taskId}`);
  }
  /**
   * returns the user name and email
   * @param token Auth Token
   */
  userInfo(token: string): Observable<any> {
    return this.http.get(`${this.url}api/auth/users/me`, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Enable/Disable Sharing a Project
   * @param id Project id
   * @param on Sharing State
   * @param token Auth token
   */
  Sharing(id: string, on: boolean, token: string) {
    const state = on ? 'on' : 'off';
    return this.http.post(`${this.url}api/save/${id}/sharing/${state}`, {}, {
      headers: this.httpHeaders(token),
    });
  }
  /**
   * Fetch Samples
   */
  fetchSamples(): Observable<any> {
    return this.http.get('./assets/samples/Samples.json');
  }

  /**
   * List all the variations with save id
   * @param id Project id
   * @param token Auth Token
   */
  listAllVersions(id, token): Observable<any> {
    return this.http.get(`${this.url}api/save/versions/${id}`, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Delete specific branch
   * @param id Project Id
   * @param branch Branch of variation
   * @param token Auth Token
   */
  deleteBranch(id, branch, token) {
    return this.http.delete(`${this.url}api/save/versions/${id}/${branch}`, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Delete specifit variation
   * @param id Project Id
   * @param branch Branch of variation
   * @param version Version of variation
   * @param token Auth Token
   */
  deleteVariation(id, branch, version, token) {
    return this.http.delete(`${this.url}api/save/versions/${version}/${id}/${branch}`, {
      headers: this.httpHeaders(token),
    });
  }

  /**
 * Logout
 */
  logout(token): void {
    console.log(token);
    this.http.post(`${this.url}api/auth/token/logout/`, '', {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`
      })
    }).subscribe(() => { Login.logout(); }, (e) => { console.log(e); });
  }

  existLTIURL(id: string, token: string) {
    return this.http.get(`${this.url}api/lti/exist/${id}`, {
      headers: this.httpHeaders(token),
    });
  }

  saveLTIDetails(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/build/`, data, {
      headers: this.httpHeaders(token),
    });
  }

  removeLTIDetails(id: number, token: string) {
    return this.http.delete(`${this.url}api/lti/delete/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Token ${token}`,
      })
    });
  }

  updateLTIDetails(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/update/`, data, {
      headers: this.httpHeaders(token),
    })
  }

  submitCircuit(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/submit/`, data, {
      headers: this.httpHeaders(token),
    });
  }

  getSubmissions(consumerKey: string, token: string) {
    return this.http.get(`${this.url}api/lti/submissions/${consumerKey}`, {
      headers: this.httpHeaders(token),
    })
  }
}
