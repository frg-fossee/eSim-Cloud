import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitConfirmDialogComponent } from './exit-confirm-dialog.component';

describe('ExitConfirmDialogComponent', () => {
  let component: ExitConfirmDialogComponent;
  let fixture: ComponentFixture<ExitConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExitConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
