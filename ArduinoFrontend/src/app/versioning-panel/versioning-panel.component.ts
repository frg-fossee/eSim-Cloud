import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CreateVariationDialogComponent } from './create-variation-dialog/create-variation-dialog.component';

@Component({
  selector: 'app-versioning-panel',
  templateUrl: './versioning-panel.component.html',
  styleUrls: ['./versioning-panel.component.css']
})
export class VersioningPanelComponent implements OnInit {

  branches = [
    { name: 'branch1', versions: [{ name: 'one' }, { name: 'two' }] },
    { name: 'branch2', versions: [{ name: 'one' }] }
  ]

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createBranch() {
    this._dialog.open(CreateVariationDialogComponent)
  }

}
