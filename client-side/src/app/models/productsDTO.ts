export class ProductsDTO {
  _id?: string;
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
  discountedPrice?: number;
  emiStartsAt?: number;
  anualInterest?: number;
  stock?: string;
  slug?: string;
  images?: ProductImagesDTO[];
  emiDetails?: EMIDetailsDTO[];
  specifications?: {
    brand?: string;
    material?: string;
    washingInstructions?: string;
    dimensions?: string;
    weight?: string;
    color?: string;
    finish?: string;
    warranty?: string;
  };
  additionalDetails?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export class ProductImagesDTO {
  key?: string;
  type?: string;
  name?: string;
  url?: string;
  file?: File;
}
export class EMIDetailsDTO{
  month?: number;
  monthlyEmi?: number;
  totalPayable?: number;
  interestAmount?: number;
  principal?: number;
}
