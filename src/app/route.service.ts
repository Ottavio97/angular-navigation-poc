import { ChangeDetectorRef, ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ActivationStart, ChildrenOutletContexts, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { modalRoutes } from './app-routing.module';
import * as _ from 'lodash';
import { Location } from '@angular/common';


export class StackEntry {
  url!: string | undefined;
  params!: any;

  constructor(url: string | undefined, params: any) {
    this.url = url;
    this.params = params;
  }
}
export class RouterOutletStack {
  public name!: string;
  public stack!: StackEntry[];

  constructor(name: string) {
    this.name = name;
    this.stack = [];
  }
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  routerOutletIndex = 0;

  routerOutletStack: RouterOutletStack[] = [];

  routerOutletMap: Map<string, RouterOutlet> = new Map();

  primaryRouterOutletQueryParams: any;

  get isModalOpen(): boolean {
    return this.routerOutletStack.length > 0;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
  ) {
    // quick and dirty per risolvere problema apertura N modali
    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart && e.snapshot.outlet.startsWith('modal')) {
        this.routerOutletMap.get(e.snapshot.outlet)?.deactivate();
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.primaryRouterOutletQueryParams = params;
    });
  }

  /**
   * Restituisce il router outlet attualmente attivo, ovvero quello incima allo stack
   * di router outlet che sono stati istanziati.
   */
  getCurrentActiveRouterOutlet(): RouterOutletStack {
    return this.routerOutletStack[this.routerOutletIndex - 1];
  }

  /**
   * Metodo proxy verso router.navigate di Angular che deve implementare tutta la gestione
   * della navigazione sia per il primary outlet che per i secondary outlet, salvanto contemporaneamente 
   * i dati necessari per mantenere la history.
   */
  navigate(url?: string, params?: any): void {
    if (!this.isModalOpen) {
      this.router.navigate([url], {
        queryParams: params
      });
    } else if (this.isModalOpen) {
      const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
      const outlets = {};
      (outlets as any)[activeRouterOutlet.name] = url ? [`${url}`] : null;
      activeRouterOutlet.stack.push(new StackEntry(url, params));
      this.router.navigate([{ outlets }], {
        skipLocationChange: false,
        queryParams: this.primaryRouterOutletQueryParams
      });
    }
  }

  /**
   * Metodo che deve implementare tutta la gestione del goBack in stile browser anche su modale e
   * quindi su router outlet secondary (location.back() funziona bene solo con il primary outlet)
   */
  goBack(): void {
    if (!this.isModalOpen) {
      this.location.back();
    } else {
      const entry = this.popPreviousUrl();
      if (entry) {
        this.navigate(entry.url, entry.params);
      }
    }
  }

  /**
   * Ripulisce la route settando come path 'null', attenzione: nella definizione delle route
   * deve essere prevista una route '' altrimenti va in errore.
   */
  clearRoute(): void {
    if (!this.isModalOpen) {
      this.router.navigate([null]);
    } else if (this.isModalOpen) {
      const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
      const outlets = {};
      (outlets as any)[activeRouterOutlet.name] = null;
      this.router.navigate([{ outlets }], {
        skipLocationChange: false,
        queryParams: this.primaryRouterOutletQueryParams
      });
    }
  }

  /**
   * Crea il router outlet con il nome passato in input e lo salva nella mappa dei router outlet
   */
  createRouterOutlet(
    parentContexts: ChildrenOutletContexts,
    location: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    name: string,
    changeDetector: ChangeDetectorRef): RouterOutlet {
    const outlet = new RouterOutlet(parentContexts, location, resolver, name, changeDetector);
    this.routerOutletMap.set(name, outlet);
    return outlet;
  }

  /**
   * Ripulisce il router outlet e quindi:
   *  - prende il router outlet attivo
   *  - resetta la route
   *  - toglie dalle route quelle aggiunte a runtime per il router outlet che stiamo ripulendo
   *  - disattiva il router outlet
   */
  clearRouterOutlet(): void {
    const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
    this.clearRoute();
    this.clearDynamicModalRoutes(activeRouterOutlet.name);
    const outlet = this.routerOutletMap.get(activeRouterOutlet.name);
    if (outlet) {
      outlet.deactivate();
      outlet.ngOnDestroy();
    }
  }

  getActiveRouterOutletByName(name: string): RouterOutlet | undefined {
    return this.routerOutletMap.get(name);
  }

  /**
   * Metodo usato dai componenti per ottenere i parametri di input con il quale
   * è stato invocato in base al contesto (primary router outlet o secondary router outlet)
   */
  getParameter(name: string): any {
    return this.getRouterOutletParams(name) ?
      this.getRouterOutletParams(name) : this.activatedRoute.snapshot.queryParams.number;
  }

  /**
   * Metodo che restituisce i parametri passati in input al componente sfruttando lo stack di history
   * del router outlet attivo.
   */
  private getRouterOutletParams(name: string): any {
    const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
    if (this.isModalOpen && activeRouterOutlet && activeRouterOutlet.stack.length > 0) {
      const entry = activeRouterOutlet.stack[activeRouterOutlet.stack.length - 1];
      return entry && entry.params ? entry.params[name] : null;
    }
    return null;
  }

  /**
   * Ritorna la history del router outlet attualmente attivo
   */
  public getCurrentRouterOutletHistory(): StackEntry[] {
    const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
    return activeRouterOutlet ? activeRouterOutlet.stack : [];
  }

  /**
   * Restituisce l'entry dello stack del componente precedente quello attualmente visualizzato.
   */
  public getPreviousUrl(): StackEntry {
    const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
    return activeRouterOutlet.stack[activeRouterOutlet.stack.length - 2];
  }

  /**
   * Restituisce l'entru dello stack del componente precedentemente visualizzato e contemporaneamente 
   * elimina dallo stack le entry necessarie per ripulire la history.
   *
   * Metodo usato per implementare il goBack();
   */
  public popPreviousUrl(): StackEntry | undefined {
    const activeRouterOutlet = this.getCurrentActiveRouterOutlet();
    activeRouterOutlet.stack.pop(); // current
    return activeRouterOutlet.stack.pop();  //previous
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Aggiunge dinamicamente le route alle route di angular
   */
  addDynamicModalRoutes(): string {
    const name = this.getRouterOutletName();
    this.routerOutletStack.push(new RouterOutletStack(name));
    const routes = _.cloneDeep(modalRoutes);
    for (const route of routes) {
      route.outlet = name;
    }

    this.router.config.push(...routes);
    return name;
  }

  /**
   * Dato il nome dell router outlet ripulisce le route ad esso associato, ripristinando le route
   * angular originali.
   */
  clearDynamicModalRoutes(outlet: string): void {
    const routes = this.router.config.filter(route => route.outlet !== outlet);
    this.router.resetConfig(routes);
    this.routerOutletStack.pop();
    this.routerOutletIndex = this.routerOutletIndex - 1;
  }

  getRouterOutletName(): string {
    // const name = 'modal_' + this.randomInt(0, 10000);
    const name = 'modal_' + this.routerOutletIndex; // genera problema 'Cannot activate an already activated outlet'
    this.routerOutletIndex = this.routerOutletIndex + 1;
    return name;
  }
}
