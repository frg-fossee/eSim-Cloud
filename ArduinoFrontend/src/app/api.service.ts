import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { Login } from './Libs/Login';
import { ActivatedRoute } from '@angular/router';

/**
 * Class For handlind API.
 */
/**
 * Injectable
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

  isAuthenticated = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    public aroute: ActivatedRoute
  ) {
  }
  /**
   * Get Http Headers only for those API calls where token is not mandatory
   * @param token Login Token
   * @returns Http headers as per given parameter and environment
   */
  httpHeaders(token: string) {
    if (environment.production) {
      if (token) {
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
    } else {
      if (token) {
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
   * Save Project to Gallery
   * @param data The Project gallery data
   * @param token Auth Token
   */
  saveProjectToGallery(data: any, token: string) {
    return this.http.post(`${this.url}api/save/gallery/` + data.save_id, data, {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        // 'Access-Control-Allow-Origin': '*',
      })
    });
  }
  /**
   * List all the project created by an user
   * @param token Auth Token
   */
  listProject(token) {
    return this.http.get(`${this.url}api/save/arduino/list`, {
      headers: this.httpHeaders(token)
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
    let url = `${this.url}api/save/${id}`;
    url += version ? `/${version}` : '';
    url += branch ? `/${branch}` : '';
    return this.http.get(url, {
      headers: this.httpHeaders(token)
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
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        // 'Access-Control-Allow-Origin': '*',
      }),
      observe: 'response',
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
  Sharing(id: string, branch: string, version: string, on: boolean, token: string) {
    const state = on ? 'on' : 'off';
    return this.http.post(`${this.url}api/save/${id}/sharing/${state}/${version}/${branch}`, {}, {
      headers: this.httpHeaders(token)
    });
  }
  /**
   * Fetch Samples
   */
  fetchSamples(): Observable<any> {
    // return this.http.get('./assets/samples/Samples.json');
    return this.http.get(`${this.url}api/save/gallery?is_arduino=true`);
  }

  /**
   * Fetchs single project  gallery to simulator
   * @param id  unique id for gallery circuit
   */
  fetchSingleProjectToGallery(id: any) {
    return this.http.get(`${this.url}api/save/gallery/` + id);
  }

  /**
   * Deletes single project from gallery
   * @param id Project id
   * @param token  Auth Token
   */
  deleteProjectFromGallery(id: any, token: any) {
    return this.http.delete(`${this.url}api/save/gallery/` + id, {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`,
      })
    });
  }

  /**
   * List all the variations with save id
   * @param id Project id
   * @param token Auth Token
   */
  listAllVersions(id, token): Observable<any> {
    return this.http.get(`${this.url}api/save/versions/${id}`, {
      headers: this.httpHeaders(token)
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
   * Request to fetch LTI App details for id of the given circuit
   * @param id save_id of the circuit
   * @param token Auth Token
   */
  existLTIURL(id: string, token: string) {
    return this.http.get(`${this.url}api/lti/exist/${id}`, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Request to save LTI details at the backend
   * @param token Auth Token
   * @param data LTI Details containing ids of model and student circuits, consumer and secret keys
   */
  saveLTIDetails(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/build/`, data, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Requests for deleting the LTI app
   * @param id Model Circuit ID Number
   * @param token Auth Token
   */
  removeLTIDetails(id: number, token: string) {
    return this.http.delete(`${this.url}api/lti/delete/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`,
      })
    });
  }
  /**
   * Development Mode Login.
   */
  login() {
    return new Promise((reslove, reject) => {
      if (environment.production === false) {
        this.aroute.queryParams.subscribe((paramData: any) => {
          if (paramData.token != null) {
            localStorage.setItem('esim_token', paramData.token);
            this.isAuthenticated.next(true);
            reslove(1);
          } else if (Login.getToken()) {
            this.isAuthenticated.next(true);
            reslove(1);
          }
        });
      } else {
        reslove(0);
      }
    });
  }

  /**
   * Request to update LTI details at the backend
   * @param token Auth Token
   * @param data LTI Details containing ids of model and student circuits, consumer and secret keys
   */
  updateLTIDetails(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/update/`, data, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Requests for creating submission for the circuit with given id
   * @param token Auth Token
   * @param data LTI data (contains save_id, lti_id, lti_nonce, lti_user_id)
   */
  submitCircuit(token: string, data: any) {
    return this.http.post(`${this.url}api/lti/submit/`, data, {
      headers: this.httpHeaders(token),
    });
  }

  /**
   * Requests to retrieve all the submissions for given LTI App from backend
   * @param id save_id of the circuit
   * @param branch branch of the circuit
   * @param version version of the circuit
   * @param token Auth Token
   */
  getSubmissions(id: string, branch: string, version: string, token: string) {
    return this.http.get(`${this.url}api/lti/submissions/${id}/${version}/${branch}`, {
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
    }).subscribe(() => {
      this.isAuthenticated.next(false);
      Login.logout();
    }, (e) => { console.log(e); });
  }
  /**
   * Specific User Role.
   * @param token Auth Token
   */
  getRole(token): Observable<any> {
    return this.http.get(`${this.url}api/workflow/role/`, {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        // 'Access-Control-Allow-Origin': '*',
      })
    });
  }
}
