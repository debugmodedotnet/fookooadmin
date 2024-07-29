import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeSettingComponent } from './youtube-setting.component';

describe('YoutubeSettingComponent', () => {
  let component: YoutubeSettingComponent;
  let fixture: ComponentFixture<YoutubeSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubeSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
