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
  /**
   * List of branches and their version
   */
  branches = [];
  /**
   * Step for mat-accordian
   */
  step = 0;
  /**
   * Id of active variation
   */
  id: string;
  /**
   * Versoin Id of active variation
   */
  versionId: string;
  /**
   * Branch name of active variation
   */
  branchName: string;
  /**
   * Message to show on confirmation menu
   */
  bannerMsg = 'Are you sure you want to delete this version?';
  /**
   * Object for saving details of variation to be deleted
   */
  toDeleteObj: DeleteObj;

  /**
   * VersioningPanel Component Constructor
   * @param dialog Material Dialog
   * @param api API service for api calls
   * @param aroute Activated Route
   * @param router Router to navigate
   */
  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private aroute: ActivatedRoute,
    private router: Router,
  ) { }

  /**
   * On Init Callback
   */
  ngOnInit() {
    const msg = document.getElementById('msg_text');
    // make branch list empty
    this.branches = [];
    // set step to 0
    this.step = 0;
    this.aroute.queryParams.subscribe(params => {
      this.id = params.id;
      if (params.version && params.branch) {
        // TODO: If version and branch is available in queryParams, fetch respective versions of it
        msg.style.display = 'none';
        this.versionId = params.version;
        this.branchName = params.branch;
        this.getAllVersions();
      } else {
        // TODO: If version and branch is not available in queryParams, show message on frontend
        msg.innerHTML = 'No variation available';
        msg.style.display = 'unset';
      }
    });
  }

  /**
   * Get all variation of project
   */
  getAllVersions() {
    // get Auth token
    const token = Login.getToken();
    this.api.listAllVersions(this.id, token).subscribe((v) => {
      // Push variations into list, within their respective branches
      for (const e in v) {
        if (v.hasOwnProperty(e)) {
          const dateObj = new Date(v[e].save_time);
          v[e].formated_save_time = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()}
        ${dateObj.getHours()}:${dateObj.getMinutes()}`;
          // found flag to false
          let found = false;

          // check if branch already available
          for (const i in this.branches) {
            if (this.branches[i].name === v[e].branch) {
              this.branches[i].versions.push(v[e]);
              // set found flag to false
              found = true;
            }
          }
          if (found) {
            continue;
          } else {
            // add a new branch
            const obj = { name: v[e].branch, versions: [v[e]] };
            this.branches.push(obj);
          }
        }
      }

      // Sort versions in branch
      for (const e in this.branches) {
        if (this.branches.hasOwnProperty(e)) {
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

      // determine current variation, and set value of step
      for (let i = 0; i < this.branches.length; i++) {
        for (const x in this.branches[i].versions) {
          if (this.versionId === this.branches[i].versions[x].version && this.branchName === this.branches[i].name) {
            this.step = i;
          }
        }
      }

    });
  }

  /**
   * Create a new branch
   */
  createBranch() {
    // open CreateVariationDialogComponent dialog
    this.dialog.open(CreateVariationDialogComponent).afterClosed().subscribe((branch: any) => {
      if (branch) {
        // Emit createBranch
        this.createNewBranch.emit({ branch, version: this.versionId });
      }
    });
  }
  /**
   * Delete specific Variation
   * @param variation Variation's Object
   */
  deleteVariation(variation) {
    this.api.deleteVariation(variation.save_id, variation.branch, variation.version, Login.getToken()).subscribe((result) => {
      this.ngOnInit();
    });
  }
  /**
   * Delete specific Branch
   * @param branch Branch's Object
   */
  deleteBranch(branch) {
    this.api.deleteBranch(branch.versions[0].save_id, branch.name, Login.getToken()).subscribe((result) => {
      this.ngOnInit();
    });
  }
  /**
   * Change to clicked variation
   * @param variation Variation clicked
   * @param event Event
   */
  switchVersion(variation, event: Event) {
    if (event.target !== document.getElementById(variation.version)) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/simulator'], {
          queryParams: { id: variation.save_id, version: variation.version, branch: variation.branch }
        })
      );
    }
  }
  /**
   * Change value of step
   * @param index Index clicked
   */
  setStep(index) {
    this.step = index;
  }
  /**
   * Open confirmation menu
   * @param type Branch/Version
   * @param data metadata about element
   */
  delete(type, data) {
    this.toDeleteObj = { type, data };
    // if branch, set message accordingly
    type === 'branch' ? this.bannerMsg = 'Are you sure you want to delete this Variation?'
      : this.bannerMsg = 'Are you sure you want to delete this version?';
    // open confirmation menu
    this.deleteMenuTrigger.openMenu();
  }
  /**
   * Confirm Delete event
   */
  confirmDelete() {
    if (this.toDeleteObj.type === 'branch') {
      this.deleteBranch(this.toDeleteObj.data);
    } else if (this.toDeleteObj.type === 'version') {
      this.deleteVariation(this.toDeleteObj.data);
    }
  }

}
