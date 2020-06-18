import { Component, OnInit, Input } from '@angular/core';
import { Login } from '../Libs/Login';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  token: string;
  username: string;
  @Input() title: string;
  @Input() color: string;
  @Input() front = false;
  constructor(private api: ApiService) { }

  ngOnInit() {
    this.token = Login.getToken();
    if (this.token) {
      this.api.userInfo(this.token).subscribe((v) => {
        this.username = v.username;
      }, (err) => {
        // console.log(err.status)
        // console.log(err);
        // if (err.status === 401) {
          Login.logout();
        // }
      });
    }
  }
  Login() {
    Login.redirectLogin(this.front);
  }
  Logout() {
    Login.logout();
  }
}
