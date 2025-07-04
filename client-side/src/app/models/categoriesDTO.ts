export class CategoriesDTO{
  _id?: string;
  name?: string;
  description?: string;
  enableSubCategory?: boolean;
  subCategories?: SubCategoriesDTO[];
  createdOn?: Date;
  updatedOn?: Date;
}
export class SubCategoriesDTO{
  _id?: string;
  name?: string;
  description?: string;
  category_id?: string;
  createdOn?: Date;
  updatedOn?: Date;
}
export class GetCatAndSubCatDTO{
  _id?: string;
  name?: string;
  subCategories?: SubCategoriesDTO[];
}
