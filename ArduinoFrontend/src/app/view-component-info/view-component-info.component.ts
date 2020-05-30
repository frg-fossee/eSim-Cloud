import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-view-component-info',
  templateUrl: './view-component-info.component.html',
  styleUrls: ['./view-component-info.component.css']
})
export class ViewComponentInfoComponent implements OnInit {
  tableData = [];
  data: any = {};
  columns = ['Name', 'Value'];
  noData = false;

  constructor(public dialogRef: MatDialogRef<ViewComponentInfoComponent>) { }

  ngOnInit() {
    const item = window['Selected'];

    if (item) {
      this.data = item.info;
      for (const propName in this.data.properties) {
        if (this.data.properties[propName]) {
          this.tableData.push({
            Name: propName,
            Value: this.data.properties[propName]
          });
        }
      }
      this.noData = false;
    } else {
      this.noData = true;
    }
    // const key = document.getElementById('propertybox').getAttribute('key');
    // this.data = window['suggestion_json'][key];
  }


  close() {
    this.dialogRef.close();
  }
}
