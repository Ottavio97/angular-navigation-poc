import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Routable, SecondContext } from '../route.model';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-second',
  templateUrl: './second.component.html',
  styleUrls: ['./second.component.scss']
})
export class SecondComponent implements OnInit, OnDestroy, Routable {

  @HostBinding('id')
  id = `second-${RouteService.generateUniqueID()}`;

  isModal = false;
  outlet!: string;
  number!: number;

  constructor(
    // private router: Router,
    private activatedRoute: ActivatedRoute,
    private route: RouteService
  ) {
    this.number = this.route.getParameter(activatedRoute, 'number');
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    console.log(`second component with number ${this.number} is destroyed`);
  }

  saveContext(): void {
    console.log('callled saved context second component');
    const context = new SecondContext();
    context.data = {
      number: this.number
    };
    this.route.setComponentSessionData(this.id, context);
  }

  handleParamId(): void {
    console.log('called handle param id second component');
  }

  navigate(url: string): void {
    this.route.navigate(url, {
      number: this.route.randomInt(1, 100)
    }, this);
  }

  goBack(): void {
    this.route.goBack(this);
  }
}
