import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
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

  branches = [];

  constructor(
    private _dialog: MatDialog,
    private api: ApiService,
    private aroute: ActivatedRoute,
    private _router: Router
  ) {
    this.aroute.queryParams.subscribe(params => {
      const token = Login.getToken();
      const id = params.id;
      this.api.listAllVersions(id, token).subscribe((v) => {

        console.log('--->', v);
        for (const e in v) {
          let date_obj = new Date(v[e].save_time)
          v[e].formated_save_time = `${date_obj.getDate()}/${date_obj.getMonth()}/${date_obj.getFullYear()} ${date_obj.getHours()}:${date_obj.getMinutes()}`
          let found = false;
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

  ngOnInit() {
  }

  createBranch() {
    this._dialog.open(CreateVariationDialogComponent).afterClosed().subscribe((val: any) => {
      console.log(val);
      if (val) {
        this.onCreateNewBranch.emit(val);
      }
    })
  }

  deleteVariation(variation) {
    this.api.deleteVariation(variation.save_id, variation.branch, variation.version, Login.getToken()).subscribe((result) => {
      console.log(result);
    })
  }

  deleteBranch(branch) {
    this.api.deleteBranch(branch.versions[0].save_id, branch.name, Login.getToken()).subscribe(result => {
      console.log(result);
    })
  }

  switchVersion(variation) {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this._router.navigate(['/simulator'], { queryParams: { id: variation.save_id, version: variation.version, branch: variation.branch } })
    );
  }

}
