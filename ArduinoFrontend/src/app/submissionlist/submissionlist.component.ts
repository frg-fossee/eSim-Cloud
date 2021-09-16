import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

export interface Submission {
  id: string;
  branch: string;
  version: string;
  lis_outcome_service_url: string;
  user: string;
  user_id: string;
  save_time: Date;
  score: number;
}

/**
 * Class for Submission List
 */
@Component({
  selector: 'app-submissionlist',
  templateUrl: './submissionlist.component.html',
  styleUrls: ['./submissionlist.component.css']
})
export class SubmissionlistComponent implements OnInit {

  /**
   * Data source/list of submissions shown on the mat table
   */
  submissions = new MatTableDataSource<Submission>([]);
  /**
   * Ordered list representing column names in table headers
   */
  columnNames: string[];
  /**
   * Id of the circuit received from query parameters
   */
  id: string;
  /**
   * Branch of the circuit received from query parameters
   */
  branch: string;
  /**
   * Version of the circuit received from query parameters
   */
  version: string;
  /**
   * LTI Id of the circuit received from query parameters
   * Used in return button above the table
   */
  lti: string;
  /**
   * a state keeping track of value in search box.
   */
  searchString: string;
  /**
   * for adding mat sort functionality to mat table
   */
  @ViewChild(MatSort) sort: MatSort;
  /**
   * for adding mat paginator functionality to mat table
   */
  @ViewChild(MatPaginator) paginator: MatPaginator;

  /**
   * Submission List Component Constructor
   * @param router Router to navigate
   * @param aroute Activated Route
   * @param api API service for api calls
   */
  constructor(
    private router: Router,
    private aroute: ActivatedRoute,
    private api: ApiService,
  ) { }

  /**
   * On Init Callback
   */
  ngOnInit() {
    document.title = 'Submissions | Arduino on Cloud';
    this.columnNames = ['user', 'user_id', 'save_time', 'lis_outcome_service_url', 'score', 'run', ];
    this.submissions.data.splice(0, this.submissions.data.length);
    this.aroute.queryParams.subscribe(v => {
      const token = Login.getToken();
      if (!v.id || !v.branch || !v.version || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.id = v.id;
      this.branch = v.branch;
      this.version = v.version;
      this.lti = v.lti;
      if (v.scored) {
        this.PopulateSubmissions();
      }
    });
  }

  /**
   * Sets up the table accessing functions for the mat table
   */
  setUpTable() {
    this.submissions.filterPredicate = (data, filter) =>
      data.user.toLocaleLowerCase().includes(filter) || data.user_id.toLocaleLowerCase().includes(filter);
    this.submissions.paginator = this.paginator;
    this.submissions.sort = this.sort;
    // this.submissions.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.submissions.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'save_time': {
          const newDate = new Date(item.save_time);
          return newDate;
        }
        default: {
          return item[property];
        }
      }
    };
  }

  /**
   * Function that executes on modifying value in the search box
   * @param searchString String entered as input by user
   */
  searchNFilter(searchString: string) {
    this.submissions.filter = searchString.trim().toLocaleLowerCase();
    if (this.submissions.paginator) {
      this.submissions.paginator.firstPage();
    }
  }

  /**
   * Retrieves submissions from backend
   */
  PopulateSubmissions() {
    const token = Login.getToken();
    this.api.getSubmissions(this.id, this.branch, this.version, token).subscribe(res => {
      for (let i = 0; i < res['length']; i++) {
        this.submissions.data.push({
          user: res[i]['student'] ? res[i]['student']['username'] : 'Anonymous User',
          user_id: res[i]['ltisession']['user_id'],
          save_time: res[i]['schematic']['save_time'],
          score: res[i]['score'],
          id: res[i]['schematic']['save_id'],
          branch: res[i]['schematic']['branch'],
          version: res[i]['schematic']['version'],
          lis_outcome_service_url: this.getHostFromUrl(res[i]['ltisession']['lis_outcome_service_url']),
        });
      }
      this.setUpTable();
    }, err => {
      console.log(err);
      this.setUpTable();
    });
  }

  /**
   * Converts date string in appropriate format
   * @param date Date string returned by backend
   * @returns date string in human readable format
   */
  getFormattedDate(date: string) {
    const dateObj = new Date(date);
    let str = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} `;
    str += `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
    return str;
  }

  getHostFromUrl(url: string) {
    return url ? (url.search('://') === -1 ? url.split('://')[0] : url.split('://')[1]).split('/')[0] : 'None';
  }
}
