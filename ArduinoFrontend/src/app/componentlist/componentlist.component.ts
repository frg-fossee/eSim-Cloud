import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ViewComponentInfoComponent } from '../view-component-info/view-component-info.component';
/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Class for Component list (Table) Dialog
 */
@Component({
  selector: 'app-componentlist',
  templateUrl: './componentlist.component.html',
  styleUrls: ['./componentlist.component.css']
})
export class ComponentlistComponent implements OnInit {
  /**
   * Data that needs to shown as table
   */
  data: any = {};
  /**
   * if No comonents are in the workspace
   */
  noComponets = true;
  /**
   * Constructor for Component List
   * @param dialog Material Dialog
   * @param dialogRef Material Dialog Reference
   */
  constructor(private dialog: MatDialog, public dialogRef: MatDialogRef<ComponentlistComponent>) { }
  /**
   * On Init Component List Dialog
   */
  ngOnInit() {
    // For each item in the scope
    for (const key in window.scope) {
      // Check item is present and item contains at least one quantity
      if (window.scope[key] && window.scope[key].length > 0) {
        // For each item get Component name and increment its count
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
  }
  /**
   * Shoe Information of a Component
   * @param key The Compoment Key
   */
  OpenInfo(key: string) {
    window.Selected = window.scope[key][0];
    // Show view Info Dialog
    const dialogRef = this.dialog.open(ViewComponentInfoComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      window.Selected = null;
    });
  }
  /**
   * Export CSV from table
   * @param filename Filename of the downloaded CSV
   * @param data Data inside the csv
   */
  exportCSV(filename: string, data: string) {
    const blob = new Blob(['\ufeff' + data], {
      type: 'text/csv;charset=utf-8;'
    });
    // Download Logic
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.setAttribute('download', `${filename}.csv`);
    a.style.visibility = 'hidden';
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
  }
  /**
   * Download CSV Button event handler
   */
  DownloadCSV() {
    // if no components are present show a toast message
    if (this.noComponets) {
      window.showToast('No Components On Workspace', true);
      return;
    }
    // CSV heading
    let csv = `S.No,Name,Quantity\n`;
    let sno = 1;
    // Convert table to csv format
    for (const key in this.data) {
      if (this.data[key]) {
        csv += `${sno},${key},${this.data[key].cnt}\n`;
        ++sno;
      }
    }
    this.exportCSV('download', csv);
    // Close the Export Dialog
    this.dialogRef.close();
  }
}
