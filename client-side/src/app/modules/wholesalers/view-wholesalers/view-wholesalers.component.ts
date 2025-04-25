import {Component, OnInit} from '@angular/core';
import {NbButtonModule, NbIconModule, NbTooltipModule} from "@nebular/theme";
import {NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-view-wholesalers',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './view-wholesalers.component.html',
  styleUrl: './view-wholesalers.component.scss'
})
export class ViewWholesalersComponent implements OnInit{
  loading: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.loading = true;
  }

}
