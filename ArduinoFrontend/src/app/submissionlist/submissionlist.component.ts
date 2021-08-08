import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../alert/alert-service/alert.service';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

export interface submission {
  id: string;
  user: string;
  user_id: string;
  save_time: Date;
  score: number;
}

@Component({
  selector: 'app-submissionlist',
  templateUrl: './submissionlist.component.html',
  styleUrls: ['./submissionlist.component.css']
})
export class SubmissionlistComponent implements OnInit {

  submissions = new MatTableDataSource<submission>();
  columnNames: string[];
  actions: string[];
  columnHeadings: string[];
  consumerKey: string;
  searchString: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private aroute: ActivatedRoute,
    private api: ApiService,
    private alertService: AlertService,
    ) { }

  ngOnInit() {
    this.columnHeadings = ['LMS User ID', 'User', 'Submitted on', 'Score']
    this.columnNames = ['user_id', 'user', 'save_time', 'score']
    this.actions = [ 'run', ]
    this.submissions.filterPredicate = (data, filter) => data.user.includes(filter) || data.user_id.includes(filter); 
    this.submissions.sort = this.sort;
    this.submissions.paginator = this.paginator;
    this.aroute.queryParams.subscribe(v => {
      const token = Login.getToken();
      if(!v.consumer_key || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.consumerKey = v.consumer_key;
      if(v.scored) {
        this.PopulateSubmissions();
      }
    });
  }

  searchNFilter(searchString: string) {
    this.submissions.filter = searchString.trim().toLocaleLowerCase();
  }

  PopulateSubmissions() {
    const token = Login.getToken();
    this.api.getSubmissions(this.consumerKey, token).subscribe(res => {
      console.log(res);
      for(let i = 0; i < res['length']; i++) {
        this.submissions.data.push({
          user: res[i]['student'] ? res[i]['student']['username'] : 'Anonymous User',
          user_id: res[i]['ltisession']['user_id'],
          save_time: new Date(res[i]['schematic']['save_time']),
          score: res[i]['score'],
          id: res[i]['schematic']['save_id'],
        });
      }
    }, err=> console.log(err));
  }

}
