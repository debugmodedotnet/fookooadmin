import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyTableComponent } from './technology-table.component';

describe('TechnologyTableComponent', () => {
  let component: TechnologyTableComponent;
  let fixture: ComponentFixture<TechnologyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnologyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
