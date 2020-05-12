import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEditorComponent } from './code-editor.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CodeEditorComponent', () => {
  let component: CodeEditorComponent;
  let fixture: ComponentFixture<CodeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeEditorComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
