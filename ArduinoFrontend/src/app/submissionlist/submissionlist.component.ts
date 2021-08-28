import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../alert/alert-service/alert.service';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

export interface submission {
  id: string;
  branch: string;
  version: string;
  lis_outcome_service_url: string;
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

  submissions = new MatTableDataSource<submission>([]);
  columnNames: string[];
  actions: string[];
  id: string;
  branch: string;
  version: string;
  searchString: string;
  lti: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private aroute: ActivatedRoute,
    private api: ApiService,
    private alertService: AlertService,
    ) { }

  ngOnInit() {
    document.title= 'Submissions | Arduino on Cloud';
    this.columnNames = ['user', 'user_id', 'save_time', 'lis_outcome_service_url', 'score', 'run', ]
    this.aroute.queryParams.subscribe(v => {
      const token = Login.getToken();
      if(!v.id || !v.branch || !v.version || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.id = v.id;
      this.branch = v.branch;
      this.version = v.version;
      this.lti = v.lti;
      if(v.scored) {
        this.PopulateSubmissions();
      }
    });
  }

  setUpTable() {
    this.submissions.filterPredicate = (data, filter) => data.user.toLocaleLowerCase().includes(filter) || data.user_id.toLocaleLowerCase().includes(filter);
    this.submissions.paginator = this.paginator;
    this.submissions.sort = this.sort;
    // this.submissions.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.submissions.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'save_time': {
          let newDate = new Date(item.save_time);
          return newDate;
        }
        default: {
          return item[property];
        }
      }
    };
  }

  searchNFilter(searchString: string) {
    console.log(searchString);
    console.log(this.submissions);
    this.submissions.filter = searchString.trim().toLocaleLowerCase();
    if (this.submissions.paginator) {
      this.submissions.paginator.firstPage();
    }
  }

  PopulateSubmissions() {
    const token = Login.getToken();
    this.api.getSubmissions(this.id, this.branch, this.version, token).subscribe(res => {
      console.log(res);
      for(let i = 0; i < res['length']; i++) {
        this.submissions.data.push({
          user: res[i]['student'] ? res[i]['student']['username'] : 'Anonymous User',
          user_id: res[i]['ltisession']['user_id'],
          save_time: res[i]['schematic']['save_time'],
          score: res[i]['score'],
          id: res[i]['schematic']['save_id'],
          branch: res[i]['schematic']['branch'],
          version: res[i]['schematic']['version'],
          lis_outcome_service_url: res[i]['ltisession']['lis_outcome_service_url'].split('://')[1],
        });
      }
      this.setUpTable();
    }, err => {
      console.log(err);
      this.setUpTable();
    });
  }

  getFormattedDate(date: string) {
    const dateObj = new Date(date);
    return `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
  }
}
