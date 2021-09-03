import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  /**
   * Change password form creation
   */
  changePasswordForm: FormGroup;

  /**
   * Field current text type password
   */
  fieldCurrentTextType: boolean;
  /**
   * Field new text type for new Password
   */
  fieldNewTextType: boolean;
  /**
   * Repeat field text type of repeat password
   */
  repeatFieldTextType: boolean;
  /**
   * user login Token  
   */
  token
  /**
   * Error message is displaying or not
   */
  isErrorMessage = false;

  /**
   * success message is displaying or not
   */
  isSuccessMessage = false;

  /**
   * Message text for success or error.
   */
  messageText
  constructor(
    private fb: FormBuilder,
    public api: ApiService,
    public router:Router
  ) { }

  ngOnInit() {
    this.token = Login.getToken();
    this.initChangePasswordForm();
  }

  /**
   * Inits change password form
   */
  initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ["", Validators.required],
      newPassword: ["", Validators.required],
      confirmPassword: ["", Validators.required]
    });
  }
  /**
   * Toggle eye icon for textBox
   */
  toggleFieldTextType() {
    this.fieldCurrentTextType = !this.fieldCurrentTextType;
  }

  /**
   * Toggles new field Toggle eye icon for textBox
   */
  toggleNewFieldTextType() {
    this.fieldNewTextType = !this.fieldNewTextType;
  }
  /**
   * Toggles repeat field text Toggles eye icon for textBox
   */
  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }

  /**
   * Submit change password Data
   */
  submit(val: any) {
    // Modifiend Data
    let modifiedData = {
      current_password: val.currentPassword,
      new_password: val.newPassword,
      re_new_password: val.confirmPassword
    }
    this.api.changePassword(this.token, modifiedData).subscribe((success: any) => {
      this.isSuccessMessage = true;
      this.isErrorMessage = false;
      this.messageText = 'The password has been changed successfully.';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    }, (error: HttpErrorResponse) => {
      this.isSuccessMessage = false;
      this.isErrorMessage = true;
      if (error.error.current_password) {
        this.messageText = error.error.current_password;
      } else {
        this.messageText = error.error.new_password;
      }
    });
  }


}
