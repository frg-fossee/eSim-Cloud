import { Component, OnInit, Input } from '@angular/core';
import { Login } from '../Libs/Login';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  token: string;
  @Input() title: string;
  @Input() color: string;
  @Input() front = false;
  constructor() { }

  ngOnInit() {
    this.token = Login.getToken();
  }
  Login() {

  }
  Logout() {
  }
}
