import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ngOnInit() {

  }

  DeleteLTI(selected) {
    const token = Login.getToken();
    if(token) {
      AlertService.showConfirm('Are You Sure You want to Delete LTI App', () => {
        this.api.removeLTIDetails(selected.id, token).subscribe(_ => {
          selected.lti_id = null;
          AlertService.showAlert("Deleted LTI App successfully");
          this.readOnCloudItems();
        }, err => {
          AlertService.showAlert("Something went wrong");
          console.log(err);
        });
      });
    }
  }

  getLTIApps() {
    this.online.forEach((circuit, index) => {
      if(circuit.lti_id) {
        circuit.index = index;
      }
    });
    return this.online.filter(circuit => circuit.lti_id);
  }
}
