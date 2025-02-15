import {Component, OnInit} from '@angular/core';
import {CategoriesDTO} from "../../../models/categoriesDTO";
import {CategoriesService} from "../../../services/categories.service";
import {ResponseWithError} from "../../../models/commonDTO";
import {NbButtonModule, NbIconModule, NbTooltipModule} from "@nebular/theme";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-view-categories',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    RouterLink
  ],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.scss'
})
export class ViewCategoriesComponent implements OnInit {
  loading: boolean = true;
  categories: CategoriesDTO[] = [];
  constructor(private categoriesService: CategoriesService) { }
  ngOnInit(): void {
    this.loadCategories();
  }
  loadCategories(){
    this.loading = true;
    this.categoriesService.getCategories('').subscribe({
      next: (response: ResponseWithError<CategoriesDTO[]>) => {
        if (response.success)
          this.categories = response.response || [];
        else
          this.categories = [];
        this.loading = false;
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = false),
    });
  }
}
