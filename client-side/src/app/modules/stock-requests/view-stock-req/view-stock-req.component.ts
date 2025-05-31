import {Component, OnInit} from '@angular/core';
import {StockService} from "../../../services/stock.service";
import {RequestedStockDTO} from "../../../models/requestedStockDTO";

@Component({
  selector: 'app-view-stock-req',
  standalone: true,
  imports: [],
  templateUrl: './view-stock-req.component.html',
  styleUrl: './view-stock-req.component.scss'
})
export class ViewStockReqComponent implements OnInit {

  requestedStock: RequestedStockDTO[] = [];
  constructor(private stockS: StockService) { }

  ngOnInit(): void {
    this.getReqStock();
  }
  getReqStock(){
    this.stockS.getRequestedStock().subscribe({
      next: (response) => {
        if (response.success) {
          this.requestedStock = response.response || [];
          console.log(this.requestedStock);
        }
      },
      error: (err) => {
        console.log(err);
      }, complete: () => {}
    })
  }
}
