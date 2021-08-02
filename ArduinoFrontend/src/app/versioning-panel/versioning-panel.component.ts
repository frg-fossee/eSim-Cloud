import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatAccordion, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';
import { CreateVariationDialogComponent } from './create-variation-dialog/create-variation-dialog.component';

@Component({
  selector: 'app-versioning-panel',
  templateUrl: './versioning-panel.component.html',
  styleUrls: ['./versioning-panel.component.css']
})
export class VersioningPanelComponent implements OnInit {

  @Output() onCreateNewBranch = new EventEmitter();
  @ViewChild(MatAccordion) accordion: MatAccordion;

  branches = [
  ];
  step = 0;
  id: string;
  versionId: string;
  branchName: string;

  constructor(
    private _dialog: MatDialog,
    private api: ApiService,
    private aroute: ActivatedRoute,
    private _router: Router
  ) {

  }

  ngOnInit() {
    this.branches = [];
    this.step = 0;
    this.aroute.queryParams.subscribe(params => {
      const token = Login.getToken();
      this.id = params.id;
      this.versionId = params.version;
      this.branchName = params.branch;
      this.api.listAllVersions(this.id, token).subscribe((v) => {

        console.log('--->', v);
        let stepIndex = 0;
        for (const e in v) {
          let date_obj = new Date(v[e].save_time)
          v[e].formated_save_time = `${date_obj.getDate()}/${date_obj.getMonth()}/${date_obj.getFullYear()} ${date_obj.getHours()}:${date_obj.getMinutes()}`
          let found = false;

          if (this.versionId == v[e].version) {
            this.step = stepIndex;
          }

          // check if already avail
          for (const i in this.branches) {
            if (this.branches[i].name === v[e].branch) {
              this.branches[i].versions.push(v[e])
              found = true;
            }
          }
          if (found) {
            continue;
          } else {
            let obj = { name: v[e].branch, versions: [v[e]] }
            this.branches.push(obj);
          }
          stepIndex++;
        }

        for (const e in this.branches) {
          this.branches[e].versions.sort((a, b) => {
            let date1 = new Date(a.save_time);
            let date2 = new Date(b.save_time);
            if (date1 > date2) {
              return -1;
            } else if (date1 < date2) {
              return 1;
            } else {
              return 0;
            }
          })
        }

      })
    })
  }

  createBranch() {
    this._dialog.open(CreateVariationDialogComponent).afterClosed().subscribe((branch: any) => {
      if (branch) {
        this.onCreateNewBranch.emit({ branch: branch, version: this.versionId });
      }
    })
  }

  deleteVariation(variation) {
    this.api.deleteVariation(variation.save_id, variation.branch, variation.version, Login.getToken()).subscribe((result) => {
      console.log(result);
      this.ngOnInit();
    })
  }

  deleteBranch(branch) {
    this.api.deleteBranch(branch.versions[0].save_id, branch.name, Login.getToken()).subscribe(result => {
      console.log(result);
      this.ngOnInit();
    })
  }

  switchVersion(variation) {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this._router.navigate(['/simulator'], { queryParams: { id: variation.save_id, version: variation.version, branch: variation.branch } })
    );
  }

  setStep(index) {
    this.step = index;
  }

}
