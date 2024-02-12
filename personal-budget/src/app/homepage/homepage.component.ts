import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';
import * as d3j from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  host: { ngSkipHydration: 'true' }, // Angular 17 feature
})
export class HomepageComponent implements AfterViewInit {
  public dataSource = {
    datasets: [
      {
        data: [''],
        backgroundColor: [''],
      },
    ],
    labels: [''],
  };

  public data = [];
  private svg: any;
  private color: any;
  private height = 600;
  private width = 750;
  private margin = 50;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;

  @ViewChild('myChart')
  eleRef!: ElementRef;

  public isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private chartRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any,
    private dataService: DataService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    // implemented Data Service for using the data in charts from data service and not from a local variable
    this.dataService.generateData().subscribe((res: any) => {
      for (var i = 0; i < res.myBudget.length; i++) {
        this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
        this.dataSource.labels[i] = res.myBudget[i].title;
        this.dataSource.datasets[0].backgroundColor[i] = res.myBudget[i].color;
        this.data = res.myBudget; //using this variable for D3Chart
      }
      this.createChart();
      this.createD3Chart();
    });
  }

  //Function for displaying normal chart using Angular
  createChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = <HTMLCanvasElement>document.getElementById('myChart');
      var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: this.dataSource,
      });
    }
  }

  // Function for displaying D3JS chart using Angular
  createD3Chart(): void {
    this.svg = d3j
      .select('figure#pie')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );

    this.color = d3j
      .scaleOrdinal()
      .domain(this.data.map((d: any) => d.budget.toString()))
      .range(this.dataSource.datasets[0].backgroundColor);

    const pie = d3j.pie<any>().value((d: any) => Number(d.budget));

    this.svg
      .selectAll('p')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', d3j.arc().innerRadius(0).outerRadius(this.radius))
      .attr('fill', (d: any, i: any) => this.color(i))
      .attr('stroke', '#FFFFFF')
      .style('stroke-width', '1px');

    const labelArc = d3j
      .arc()
      .innerRadius(this.radius - 30)
      .outerRadius(this.radius - 30);

    this.svg
      .selectAll('p')
      .data(pie(this.data))
      .enter()
      .append('text')
      .text((d: any) => d.data.title)
      .attr('transform', (d: any) => 'translate(' + labelArc.centroid(d) + ')')
      .style('text-anchor', 'middle')
      .style('font-size', 12);
  }
}
