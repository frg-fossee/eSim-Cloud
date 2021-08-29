import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Login } from 'src/app/Libs/Login';

/**
 * Class for Viewing Code in LTI Form Component
 */
@Component({
  selector: 'app-view-code',
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
   * Reference to Textarea element in this component
   */
  @ViewChild('codeArea') textarea: ElementRef;
  /**
   * Reference to div element not containing code in this component
   */
  @ViewChild('noCodeSection') noCodeDiv: ElementRef;
  /**
   * Reference to div element containing code in this component
   */
  @ViewChild('codeSection') codeDiv: ElementRef;
  /**
   * List of code for every arduino of the circuit.
   */
  arduinos = [];

  /**
   * On Init Callback
   */
  ngOnInit() {
    this.noCodeDiv.nativeElement.style.display = 'block';
    this.codeDiv.nativeElement.style.display = 'none';
    this.api.readProject(this.id, this.branch, this.version, Login.getToken()).subscribe(res => {
      this.getCode(res['data_dump']);
    }, err => {
      console.log(err);
    });
  }

  /**
   * Parses the code for every arduino from circuit dump
   * @param dataDump circuit dump
   */
  getCode(dataDump) {
    const dump = JSON.parse(dataDump);
    this.arduinos = dump['ArduinoUno'];
    if (this.arduinos.length > 0) {
      this.codeDiv.nativeElement.style.display = 'block';
      this.noCodeDiv.nativeElement.style.display = 'none';
    } else {
      this.noCodeDiv.nativeElement.style.display = 'block';
      this.codeDiv.nativeElement.style.display = 'none';
    }
  }

  /**
   * Changes textarea's value based on option selected.
   * @param event Event data returned after changing option in select tag
   */
  setCode(event) {
    this.textarea.nativeElement.value = this.arduinos[event.value].data.code;
  }
}
