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

  constructor(public dialogRef: MatDialogRef<ViewComponentInfoComponent>) { }

  ngOnInit() {
    const key = document.getElementById('propertybox').getAttribute('key');
    this.data = window['suggestion_json'][key];

    for (const propName in this.data.properties) {
      if (this.data.properties[propName]) {
        this.tableData.push({
          Name: propName,
          Value: this.data.properties[propName]
        });
      }
    }
  }


  close() {
    this.dialogRef.close();
  }
}
