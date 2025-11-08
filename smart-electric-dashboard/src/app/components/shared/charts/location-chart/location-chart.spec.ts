import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationChart } from './location-chart';

describe('LocationChart', () => {
  let component: LocationChart;
  let fixture: ComponentFixture<LocationChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
