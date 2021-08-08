import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionlistComponent } from './submissionlist.component';

describe('SubmissionlistComponent', () => {
  let component: SubmissionlistComponent;
  let fixture: ComponentFixture<SubmissionlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
