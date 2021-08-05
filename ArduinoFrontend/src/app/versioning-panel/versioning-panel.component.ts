import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatAccordion, MatDialog, MatMenuTrigger } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';
import { CreateVariationDialogComponent } from './create-variation-dialog/create-variation-dialog.component';

export class DeleteObj {
  type: string;
  data: any;
}
@Component({
  selector: 'app-versioning-panel',
  templateUrl: './versioning-panel.component.html',
  styleUrls: ['./versioning-panel.component.css']
})
export class VersioningPanelComponent implements OnInit {

  @Output() createNewBranch = new EventEmitter();
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('deleteMenuTrigger') deleteMenuTrigger: MatMenuTrigger;

  branches = [];
  step = 0;
  id: string;
  versionId: string;
  branchName: string;
  bannerMsg = 'Are you sure you want to delete this version?';
  toDeleteObj: DeleteObj;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private aroute: ActivatedRoute,
    private router: Router,
  ) {

  }

  ngOnInit() {
    const msg = document.getElementById('msg_text');
    this.branches = [];
    this.step = 0;
    this.aroute.queryParams.subscribe(params => {
      this.id = params.id;
      if (params.version && params.branch) {
        msg.style.display = 'none';
        this.versionId = params.version;
        this.branchName = params.branch;
        this.getAllVersions();
      } else {
        msg.innerHTML = 'No variation available';
        msg.style.display = 'unset';
      }
    });
  }

  getAllVersions() {
    const token = Login.getToken();
    this.api.listAllVersions(this.id, token).subscribe((v) => {
      for (const e in v) {
        const dateObj = new Date(v[e].save_time);
        v[e].formated_save_time = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()}
        ${dateObj.getHours()}:${dateObj.getMinutes()}`;
        let found = false;

        // check if already avail
        for (const i in this.branches) {
          if (this.branches[i].name === v[e].branch) {
            this.branches[i].versions.push(v[e]);
            found = true;
          }
        }
        if (found) {
          continue;
        } else {
          const obj = { name: v[e].branch, versions: [v[e]] };
          this.branches.push(obj);
        }
      }

      // Sort versions in branch
      for (const e in this.branches) {
        this.branches[e].versions.sort((a, b) => {
          const date1 = new Date(a.save_time);
          const date2 = new Date(b.save_time);
          if (date1 > date2) {
            return -1;
          } else if (date1 < date2) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      // Sort branches
      this.branches.sort((a, b) => {
        const branch1Last = new Date(a.versions[a.versions.length - 1].save_time);
        const branch2Last = new Date(b.versions[b.versions.length - 1].save_time);
        if (branch1Last < branch2Last) {
          return 1;
        } else if (branch1Last > branch2Last) {
          return -1;
        } else {
          return 0;
        }
      });

      for (let i = 0; i < this.branches.length; i++) {
        for (const x in this.branches[i].versions) {
          if (this.versionId === this.branches[i].versions[x].version && this.branchName === this.branches[i].name) {
            this.step = i;
          }
        }
      }

    });
  }

  createBranch() {
    this.dialog.open(CreateVariationDialogComponent).afterClosed().subscribe((branch: any) => {
      if (branch) {
        this.createNewBranch.emit({ branch, version: this.versionId });
      }
    });
  }

  deleteVariation(variation) {
    this.api.deleteVariation(variation.save_id, variation.branch, variation.version, Login.getToken()).subscribe((result) => {
      console.log(result);
      this.ngOnInit();
    });
  }

  deleteBranch(branch) {
    this.api.deleteBranch(branch.versions[0].save_id, branch.name, Login.getToken()).subscribe(result => {
      console.log(result);
      this.ngOnInit();
    });
  }

  switchVersion(variation, event: Event) {
    if (event.target !== document.getElementById(variation.version)) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/simulator'], {
          queryParams: { id: variation.save_id, version: variation.version, branch: variation.branch }
        })
      );
    }
  }

  setStep(index) {
    this.step = index;
  }

  delete(type, data) {
    this.toDeleteObj = { type, data };
    type === 'branch' ? this.bannerMsg = 'Are you sure you want to delete this branch?'
      : this.bannerMsg = 'Are you sure you want to delete this version?';
    this.deleteMenuTrigger.openMenu();
  }

  confirmDelete() {
    if (this.toDeleteObj.type === 'branch') {
      this.deleteBranch(this.toDeleteObj.data);
    } else if (this.toDeleteObj.type === 'version') {
      this.deleteVariation(this.toDeleteObj.data);
    }
  }

}
