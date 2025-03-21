export class ProductsDTO {
  name?: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
  price?: number;
  discount?: number;
  stock?: string;
  images?: string[];
  specifications?: {
    material: string;
    dimensions: string;
    weight: string;
    color: string;
    finish: string;
    warranty: string;
  };
  additionalDetails?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
