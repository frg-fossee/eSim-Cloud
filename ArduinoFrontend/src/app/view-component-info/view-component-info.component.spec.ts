import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComponentInfoComponent } from './view-component-info.component';
import { MatLabel, MatDialog, MatDialogModule } from '@angular/material';
import { Component } from '@angular/Core';

describe('ViewComponentInfoComponent', () => {
  let component: ViewComponentInfoComponent;
  let fixture: ComponentFixture<ViewComponentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [ViewComponentInfoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewComponentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
