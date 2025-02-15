export class CategoriesDTO{
  _id?: string;
  name?: string;
  description?: string;
  enableSubCategory?: boolean;
  subcategories?: SubCategories[];
}
export class SubCategories{
  _id?: string;
  name?: string;
  description?: string;
}
