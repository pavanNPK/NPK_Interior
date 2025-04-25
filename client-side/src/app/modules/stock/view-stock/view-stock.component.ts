import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {NbButtonModule, NbCardModule, NbIconModule, NbTabsetModule, NbTooltipModule} from "@nebular/theme";

@Component({
  selector: 'app-view-stock',
  standalone: true,
  imports: [
    NgIf,
    NbCardModule,
    NbTabsetModule,
    NbButtonModule,
    NbTooltipModule,
    NbIconModule
  ],
  templateUrl: './view-stock.component.html',
  styleUrl: './view-stock.component.scss'
})
export class ViewStockComponent implements OnInit{
  loading: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.loading = true;
  }
}
