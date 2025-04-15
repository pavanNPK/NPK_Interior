import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private navbarTriggerSubject = new Subject<void>();
  navbarTrigger$ = this.navbarTriggerSubject.asObservable();

  triggerNavbar() {
    this.navbarTriggerSubject.next();
  }
  constructor() { }
}
