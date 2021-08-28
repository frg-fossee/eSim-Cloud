import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Login } from 'src/app/Libs/Login';

@Component({
  selector: 'lti-view-code',
  templateUrl: './view-code.component.html',
  styleUrls: ['./view-code.component.css']
})
export class ViewCodeComponent implements OnInit {

  constructor(
    private api: ApiService,
  ) { }

  @Input() id: string;
  @Input() branch: string;
  @Input() version: string;
  @ViewChild('codeArea') textarea: ElementRef;

  arduinos = [];

  ngOnInit() {
    this.api.readProject(this.id, this.branch, this.version, Login.getToken()).subscribe(res => {
      this.getCode(res['data_dump']);
    }, err => {
      console.log(err);
    })
  }
  
  getCode(dataDump) {
    let dump = JSON.parse(dataDump);
    console.log(dump);
    this.arduinos = dump['ArduinoUno'];
  }

  setCode(event) {
    this.textarea.nativeElement.value = this.arduinos[event.value].data.code;
  }
}
