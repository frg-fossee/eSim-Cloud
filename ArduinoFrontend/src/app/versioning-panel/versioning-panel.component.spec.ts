import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersioningPanelComponent } from './versioning-panel.component';

describe('VersioningPanelComponent', () => {
  let component: VersioningPanelComponent;
  let fixture: ComponentFixture<VersioningPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersioningPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersioningPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
