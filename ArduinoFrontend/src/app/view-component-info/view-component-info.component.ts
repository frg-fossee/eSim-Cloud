import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

/**
 * Class for View Info Dialog Component
 */
@Component({
  selector: 'app-view-component-info',
  templateUrl: './view-component-info.component.html',
  styleUrls: ['./view-component-info.component.css']
})
export class ViewComponentInfoComponent implements OnInit {
  /**
   * Data That need to show in table
   */
  tableData = [];
  /**
   * Data including decription and image
   */
  data: any = {};
  /**
   * Column Names
   */
  readonly columns = ['Name', 'Value'];
  /**
   * Variable to specify if there is no data
   */
  noData = false;

  /**
   * View Project Info Dialog Component
   * @param dialogRef Material Dialog Reference
   */
  constructor(public dialogRef: MatDialogRef<ViewComponentInfoComponent>) { }

  /**
   * On Init Function
   */
  ngOnInit() {
    // Get the Selected Item
    const item = window['Selected'];

    if (item) {
      // get the info
      this.data = item.info;
      // Create the table array
      for (const propName in this.data.properties) {
        if (this.data.properties[propName]) {
          this.tableData.push({
            Name: propName,
            Value: this.data.properties[propName]
          });
        }
      }
      // Data is present
      this.noData = false;

      if (this.data.innerHTMLContent) {
        document.getElementById('dynamic-content').innerHTML = this.data.innerHTMLContent;
      }

    } else {
      // No Data is Present
      this.noData = true;
    }
  }
  /**
   * Close View Component info dialog
   */
  close() {
    this.dialogRef.close();
  }
}
