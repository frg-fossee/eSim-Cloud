import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';

declare var window;

@Component({
  selector: 'app-componentlist',
  templateUrl: './componentlist.component.html',
  styleUrls: ['./componentlist.component.css']
})
export class ComponentlistComponent implements OnInit {

  constructor(public dialog: MatDialog) { }
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
    window.Selected = window.scope[key][0];
    const dialogRef = this.dialog.open(ViewComponentInfoComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      window.Selected = null;
    });
  }
}
