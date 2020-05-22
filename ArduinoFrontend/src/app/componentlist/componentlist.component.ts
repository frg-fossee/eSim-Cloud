import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';
declare var window;

@Component({
  selector: 'app-componentlist',
  templateUrl: './componentlist.component.html',
  styleUrls: ['./componentlist.component.css']
})
export class ComponentlistComponent implements OnInit {

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ComponentlistComponent>) { }
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

  exportCSV(filename: string, data: string) {
    const blob = new Blob(['\ufeff' + data], {
      type: 'text/csv;charset=utf-8;'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.setAttribute('download', `${filename}.csv`);
    a.style.visibility = 'hidden';
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
  }

  DownloadCSV() {
    if (this.noComponets) {
      window.showToast('No Components On Workspace');
      return;
    }
    let csv = `S.No,Name,Quantity\n`;
    let sno = 1;
    for (const key in this.data) {
      if (this.data[key]) {
        csv += `${sno},${key},${this.data[key].cnt}\n`;
        ++sno;
      }
    }
    this.exportCSV('download', csv);
    this.dialogRef.close();
  }
}
