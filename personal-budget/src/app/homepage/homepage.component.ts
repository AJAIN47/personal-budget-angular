import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  host: {ngSkipHydration : 'true'}
})
export class HomepageComponent implements AfterViewInit {
  public dataSource = {
    datasets: [{
      data: [''],
      backgroundColor: [''],
    }],
    labels: [''],
  };

  @ViewChild('myChart')
  eleRef!: ElementRef;
  public isBrowser: boolean;

  constructor(private http: HttpClient, private chartRef: ElementRef, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.http.get('http://localhost:3000/budget').subscribe((res: any) => {
      console.log(res);
      for (let i = 0; i < res.myBudget.length; i++) {
        this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
        this.dataSource.labels[i] = res.myBudget[i].title;
        this.dataSource.datasets[0].backgroundColor[i] = res.myBudget[i].color;
      }
      this.createChart();
    });
  }

  createChart(){
    var ctx = this.chartRef.nativeElement.querySelector('#myChart').getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: "pie",
        data: this.dataSource
    });
  }
}
