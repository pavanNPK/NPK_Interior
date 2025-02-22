export class CategoriesDTO{
  _id?: string;
  name?: string;
  description?: string;
  enableSubCategory?: boolean;
  subCategories?: SubCategories[];
  createdOn?: Date;
  updatedOn?: Date;
}
export class SubCategories{
  _id?: string;
  name?: string;
  description?: string;
  category_id?: string;
  createdOn?: Date;
  updatedOn?: Date;
}
