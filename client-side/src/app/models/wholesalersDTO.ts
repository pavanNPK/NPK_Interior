export class WholesalersDTO {
  _id?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  state_id?: string;
  country_id?: string;
  zipCode?: string;
  phone?: string;
  code?: string;
  email?: string;
  website?: string;
  bankName?: string;
  bankAccountNumber?: string;
  IFSCCode?: string;
  description?: string;
  images?: WholesalersImagesDTO[];
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
export class WholesalersImagesDTO {
  key?: string;
  name?: string;
  type?: string;
  keyId?: string;
}
