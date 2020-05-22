import { Component, OnInit } from '@angular/core';

declare var window;

@Component({
  selector: 'app-componentlist',
  templateUrl: './componentlist.component.html',
  styleUrls: ['./componentlist.component.css']
})
export class ComponentlistComponent implements OnInit {

  constructor() { }
  data: any = {};
  noComponets = true;

  ngOnInit() {
    for (const key in window.scope) {
      if (window.scope[key] && window.scope[key].length > 0) {
        for (const item of window.scope[key]) {
          if (item.getName) {
            const name = item.getName();
            this.noComponets = false;
            if (this.data[name] && this.data[name].cnt > 0) {
              this.data[name].cnt += 1;
            } else {
              this.data[name] = {
                cnt: 1,
                key: item.keyName
              };
            }
          }
        }
      }
    }
    console.log(this.data);
  }
  OpenInfo(key: string) {
    console.log(key);
  }
}
