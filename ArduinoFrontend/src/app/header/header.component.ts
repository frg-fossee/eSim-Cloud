import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Login } from '../Libs/Login';
import { ApiService } from '../api.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Class For Header Component (DO Eager Loading)
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * Login Token
   */
  token: string;
  /**
   * Username
   */
  username: string;
  /**
   * window
   */
  window: any;
  /**
   * Header Title
   */
  @Input() title: string;
  /**
   * Color of the title
   */
  @Input() color: string;
  /**
   * Is it a Front Page
   */
  @Input() front = false;

  /**
   * Name  of the user
   */
  name: string;
  /**
   * Constructor for Header
   * @param api API Service
   */

  /**
   * getting subscription of user;
   */
  subscription = new Subscription();
  constructor(
    private api: ApiService,
    private aroute: ActivatedRoute) { }
  /**
   * On Init
   */
  ngOnInit() {
    this.getUserInfo();
    this.stateChangeUserInfo();
    // Initializing window
    this.window = window;
  }
  /**
   * Redirect to login
   */
  Login() {
    Login.redirectLogin(this.front);
  }
  /**
   * Handle Logout
   */
  Logout() {
    // Login.logout();
    this.api.logout(this.token);
  }
  /**
   * Getting User Information.
   */
  stateChangeUserInfo() {
    // Get Login Token
    this.subscription = this.api.isAuthenticated.subscribe((res: boolean) => {
      if (res === true) {
        this.getUserInfo();
      } else {
        this.username = undefined;
      }
    });
  }

  getUserInfo() {
    this.token = Login.getToken();
    // If token is available then get username
    if (this.token) {
      this.api.userInfo(this.token).subscribe((v) => {
        this.username = v.username;
        this.name = this.username;
      }, (err) => {
        // console.log(err.status)
        console.log(err);
        // if (err.status === 401) {
        Login.logout();
        // }
      });
    }
  }
  /**
   * on destroy when page is dead then call
   */
  ngOnDestroy() {
    // destroy  auth subject.
    this.subscription.unsubscribe();
  }
}
