import {Component, computed, OnInit} from '@angular/core';
import {NbButtonModule, NbCardModule, NbIconModule, NbTooltipModule} from "@nebular/theme";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {WholesalersService} from "../../../services/wholesalers.service";
import {WholesalersDTO} from "../../../models/wholesalersDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {LocationsDTO} from "../../../models/locationsDTO";
import {LocationsService} from "../../../services/locations.service";

@Component({
  selector: 'app-view-wholesalers',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    RouterLink,
    NbCardModule,
    NgOptimizedImage
  ],
  templateUrl: './view-wholesalers.component.html',
  styleUrl: './view-wholesalers.component.scss'
})
export class ViewWholesalersComponent implements OnInit{
  loading: boolean = false;
  wsData: WholesalersDTO[] = [];

  constructor(private ws: WholesalersService,
              private locationsService: LocationsService) {
  }

  ngOnInit(): void {
    this.loadWSData();
  }

  loadWSData() {
    this.ws.getWholesalers().subscribe({
      next: (response: ResponseWithError<WholesalersDTO[]>) => {
        if (response.success)
          this.wsData = response.response || [];
        else
          this.wsData = [];
      },
      error: (error) => console.error('Error fetching wholesalers', error),
      complete: () => {
        this.loading = true;
        this.getStateName(this.wsData)
      }
    });
  }
  getStateName(wsData: WholesalersDTO[]) {
    wsData.forEach(wholesaler => {
      const state = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'state'))().find((state: LocationsDTO) => state._id === wholesaler.state_id);
      const country = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'country'))().find((state: LocationsDTO) => state._id === wholesaler.country_id);
      wholesaler.state = state?.name || '';
      wholesaler.country = country?.name || '';
    });
  }
}
