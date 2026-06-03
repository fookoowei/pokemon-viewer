import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatBarComponent } from './stat-bar.component';

describe('StatBarComponent', () => {
  let fixture: ComponentFixture<StatBarComponent>;
  let component: StatBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatBarComponent);
    component = fixture.componentInstance;
  });

  it('computes percent relative to max and caps at 100', () => {
    component.value = 100;
    component.max = 200;
    expect(component.percent).toBe(50);

    component.value = 300; // above max
    expect(component.percent).toBe(100);
  });

  it('colours the bar by strength of the stat', () => {
    component.value = 30;
    expect(component.barColor).toBe('#e0556b'); // weak

    component.value = 70;
    expect(component.barColor).toBe('#f0a23b'); // mid

    component.value = 120;
    expect(component.barColor).toBe('#5bbf6a'); // strong
  });

  it('renders the label and value', () => {
    component.label = 'HP';
    component.value = 45;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('HP');
    expect(text).toContain('45');
  });
});
