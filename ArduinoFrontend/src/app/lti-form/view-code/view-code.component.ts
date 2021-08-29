import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Login } from 'src/app/Libs/Login';

/**
 * Class for Viewing Code in LTI Form Component
 */
@Component({
  selector: 'lti-view-code',
  templateUrl: './view-code.component.html',
  styleUrls: ['./view-code.component.css']
})
export class ViewCodeComponent implements OnInit {

  /**
   * View Code Component Constructor
   * @param api API service for api calls
   */
  constructor(
    private api: ApiService,
  ) { }

  /**
   * Id of the circuit received from LTI-Form
   */
  @Input() id: string;
  /**
   * Branch of the circuit received from LTI-Form
   */
  @Input() branch: string;
  /**
   * Version of the circuit received from LTI-Form
   */
  @Input() version: string;
  /**
   * Reference of Textarea element in this component
   */
  @ViewChild('codeArea') textarea: ElementRef;
  /**
   * List of code for every arduino of the circuit.
   */
  arduinos = [];

  /**
   * On Init Callback
   */
  ngOnInit() {
    this.api.readProject(this.id, this.branch, this.version, Login.getToken()).subscribe(res => {
      this.getCode(res['data_dump']);
    }, err => {
      console.log(err);
    })
  }

  /**
   * Parses the code for every arduino from circuit dump
   * @param dataDump circuit dump
   */
  getCode(dataDump) {
    let dump = JSON.parse(dataDump);
    this.arduinos = dump['ArduinoUno'];
  }

  /**
   * Changes textarea's value based on option selected.
   * @param event Event data returned after changing option in select tag
   */
  setCode(event) {
    this.textarea.nativeElement.value = this.arduinos[event.value].data.code;
  }
}
