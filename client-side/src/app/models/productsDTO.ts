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
  annualInterest?: number;
  remainingCount?: number;
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
  notified?: boolean;
  createdAt?: Date;
  fetchRemainingTime?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  cart?: boolean;
  wishlist?: boolean;
}
export class ProductImagesDTO {
  key?: string;
  type?: string;
  name?: string;
  url?: string;
  fetchedImageTime?: string;
  file?: File;
}
export class EMIDetailsDTO{
  month?: number;
  monthlyEmi?: number;
  totalPayable?: number;
  interestAmount?: number;
  principal?: number;
}
