import { Route } from '@angular/compiler/src/core';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {
  /**
   * Username  of register user.
   */
  username = '';
  /**
   * Group role of dashboard component
   */
  groupRole = [];
  /**
   * Token
   */
  token;
  // configuration for side nav.
  @ViewChild('sidenav') sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;

  constructor(
    public api: ApiService,
    public router: Router
  ) { }

  ngOnInit() {
    // In Angular  Development Mode.
    this.api.login().then(() => {
      this.token = Login.getToken();
      this.userInfo(this.token);
      this.readRoles(this.token);
    });
  }

  /**
   * Getting User Information.
   */
  userInfo(token) {

    // If token is available then get username
    if (token) {
      this.api.userInfo(token).subscribe((v) => {
        this.username = v.username;
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
   * Reads roles
   */
  readRoles(token: string) {
    this.api.getRole(token).subscribe((result: any) => {
      this.groupRole = result.group;
    }, (e) => {
      console.log(e);
    });
  }

}
