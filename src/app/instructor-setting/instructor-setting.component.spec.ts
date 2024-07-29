import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorSettingComponent } from './instructor-setting.component';

describe('InstructorSettingComponent', () => {
  let component: InstructorSettingComponent;
  let fixture: ComponentFixture<InstructorSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
