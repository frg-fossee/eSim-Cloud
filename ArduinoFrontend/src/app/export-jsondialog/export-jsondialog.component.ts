import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-export-jsondialog',
  templateUrl: './export-jsondialog.component.html',
  styleUrls: ['./export-jsondialog.component.css']
})
export class ExportJSONDialogComponent implements OnInit {

  description:string;
  constructor(public dialogRef: MatDialogRef<ExportJSONDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.description = data.description
      this.fileName = data.title;
    }

  ngOnInit() {
  }

  fileName:string = '';

  saveProject(){
    Workspace.SaveJson(this.fileName, this.description);
  }

}
