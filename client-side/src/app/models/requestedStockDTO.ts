export class RequestedStockDTO {
  name?: string;
  _id?: string;
  slug?: string;
  requestedStock?: number;
  description?: string;
  requestedOn?: Date;
  requestUpdatedOn?: Date;
  requestedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
}
