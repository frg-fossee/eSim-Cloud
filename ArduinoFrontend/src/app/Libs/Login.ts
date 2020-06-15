import { environment } from '../../environments/environment';

export class Login {

  static getToken(): string {
    return window.localStorage.getItem('esim_token');
  }

  static getUser() {

  }
  static logout() {
    window.localStorage.removeItem('esim_token');
    window.open(new URL('../../', window.location.href).href, '_self');
  }

  static redirectLogin(isFront: boolean = false): void {
    const dashboardURI = (new URL(environment.DASHBOARD_URL, window.location.href)).href;
    if (Login.getToken()) {
      window.open(dashboardURI, '_self');
    } else {
      let redirectUri = isFront ? dashboardURI : window.location.href;
      redirectUri = encodeURIComponent(redirectUri);
      // const url = `${window.location.protocol}\\\\${window.location.host}\\eda\\#\\login?url=${redirectUri}`;
      const url = `${environment.LOGIN_URL}${redirectUri}`;
      window.open(url, '_self');
    }
  }
}
