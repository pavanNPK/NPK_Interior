export const ExcelFormatForBulkProducts = [
  {
    header: 'Name',
    key: 'name',
    value: 'Please enter only alphabets and numbers if needed. Do not use special characters',
    type: 'String',
    index: 1
  },
  {
    header: 'Slug',
    key: 'slug',
    value: 'This is a unique slug for the product. Please dont enter the slug manually. Use the Generate Slug. And copy the slug',
    link: 'https://slugify.online/',
    type: 'String',
    index: 2
  },
  {
    header: 'Description',
    key: 'description',
    value: 'Please enter only alphabets and numbers if needed. Do not use special characters',
    type: 'String',
    index: 3
  },
  {
    header: 'Category',
    key: 'category',
    type: 'Object',
    value: 'Its an object of category id and category name, If you dont have category, You need to create it first.',
    children: [
      {
        key: 'id',
        value: 'You need to enter the category ID from the Category collection',
        type: 'String',
        index: 4.1
      },
      {
        key: 'name',
        value: 'You need to enter the category Name for that ID from the Category collection',
        type: 'String',
        index: 4.2
      }
    ],
    index: 4
  },
  {
    header: 'Sub Category',
    key: 'subCategory',
    type: 'Object',
    children: [
      {
        key: 'id',
        value: 'You need to enter the Sub Category ID from the Sub Category collection and must be in the same category',
        type: 'String',
        index: 5.1
      },
      {
        key: 'name',
        value: 'You need to enter the Sub Category Name for that ID from the Sub Category collection and must be in the same category',
        type: 'String',
        index: 5.2
      }
    ],
    index: 5
  },
  {
    header: 'Price',
    key: 'price',
    value: 'Must be a number',
    type: 'Number',
    index: 6
  },
  {
    header: 'Discount',
    key: 'discount',
    value: 'Must be a number, 0-99',
    type: 'Number',
    index: 7
  },
  {
    header: 'Discounted Price',
    key: 'discountedPrice',
    value: 'Must be a number, To get the discounted price, use this formula',
    formula: 'price - (price * discount / 100)',
    type: 'Number',
    index: 8
  },
  {
    header: 'EMI Starts At',
    key: 'emiStartsAt',
    value: 'Must be a number, Its the EMI for 3 months, To get the EMI for 3 months, You need to make the calculations for EMI Details',
    type: 'Number',
    index: 9
  },
  {
    header: 'Annual Interest',
    key: 'annualInterest',
    value: 'Must be a number, 0-16',
    type: 'Number',
    index: 9
  },
  {
    header: 'EMI Details',
    key: 'emiDetails',
    value: 'Must be an array of objects, To get the EMI details, You need to make the calculations for EMI Details',
    note: '- EXCEL headers for EMI is emailDetails3, emailDetails6, emailDetails9, emailDetails12',
    subNote: ' Where:\n' +
      '    &nbsp;&nbsp;. Annual Interest Rate: 12%\n' +
      '    &nbsp;&nbsp;. Monthly Interest Rate: 1% (12 / 12 / 100 = 0.01)\n' +
      '    &nbsp;&nbsp;. P = Discounted Price (47500)\n' +
      '    &nbsp;&nbsp;. R = Monthly Interest Rate (0.01)\n' +
      '    &nbsp;&nbsp;. N = Number of months (3, 6, 9, or 12)',
    formula: 'EMI = (P x R x (1 + R)^N) / ((1 + R)^N - 1)',
    type: 'Array',
    children: [
      {
        key: 'month',
        value: 'Must be a number, 3, 6, 9, 12',
        type: 'Number',
        index: 11.1
      },
      {
        key: 'monthlyEmi',
        value: 'Need to pay monthly EMI',
        type: 'Number',
        index: 11.2
      },
      {
        key: 'totalPayable',
        value: 'After 3, 6, 9, 12 months, total amount to be paid',
        type: 'Number',
        index: 11.3
      },
      {
        key: 'interestAmount',
        value: 'Annual Interest amount',
        type: 'Number',
        index: 11.4
      },
      {
        key: 'principal',
        value: 'Original Price means discounted price',
        type: 'Number',
        index: 11.5
      }
    ],
    index: 11
  },
  {
    header: 'Is Featured',
    key: 'isFeatured',
    value: 'Must be a boolean',
    type: 'Boolean',
    index: 12
  },
  {
    header: 'Is Trending',
    key: 'isTrending',
    value: 'Must be a boolean',
    type: 'Boolean',
    index: 13
  },
  {
    header: 'Is New Arrival',
    key: 'isNewArrival',
    value: 'Must be a boolean',
    type: 'Boolean',
    index: 14
  },
  {
    header: 'Cart',
    key: 'cart',
    value: 'Must be a boolean',
    type: 'Boolean',
    index: 15
  },
  {
    header: 'Wishlist',
    key: 'wishlist',
    value: 'Must be a boolean',
    type: 'Boolean',
    index: 16
  },
  {
    header: 'Specifications',
    key: 'specifications',
    type: 'Object',
    value: 'Product specifications',
    index: 17,
    children: [
      {
        key: 'color',
        value: 'Must be a string',
        type: 'String',
        index: 17.1
      },
      {
        key: 'finish',
        value: 'Must be a string',
        type: 'String',
        index: 17.2
      },
      {
        key: 'size',
        value: 'Must be a string',
        type: 'String',
        index: 17.3
      },
      {
        key: 'material',
        value: 'Must be a string',
        type: 'String',
        index: 17.4
      },
      {
        key: 'brand',
        value: 'Must be a string',
        type: 'String',
        index: 17.5
      },
      {
        key: 'washingInstructions',
        value: 'Must be a string',
        type: 'String',
        index: 17.6
      },
      {
        key: 'dimensions',
        value: 'Must be a string (4x4x4 cm|mm|in)',
        note: 'format "LxWxH cm|mm|in"',
        type: 'String',
        index: 17.7
      },
      {
        key: 'weight',
        value: 'Must be a string (4 lb|kg|g|oz)',
        type: 'String',
        note: 'format "weight lb|kg|g|oz"',
        index: 17.7
      },
      {
        key: 'warranty',
        value: 'Must be a string (6|12|18|24|30|36 months)',
        note: 'format "6|12|18|24|30|36 months"',
        type: 'String',
        index: 17.8
      }
    ]
  },
  {
    header: 'Images',
    key: 'images',
    type: 'Array',
    value: 'Product images, max 5 images. You can upload images in URL (key) format from the AWS S3 bucket.',
    note: 'EXCEL headers for Images is images1, images2, images3, images4 and images5',
    subNote: '&nbsp;&nbsp;. It\'s an optional field for bulk upload. However, for single or multiple products through the form,\n' +
      '&nbsp;&nbsp;. it is a required field. You can update later once you have uploaded the products, but you must upload the images.',
    children: [
      {
        key: 'name',
        value: 'Must be a string of image name',
        type: 'String',
        index: 18.1
      },
      {
        key: 'key',
        value: 'Must be a string of image key from AWS S3 bucket',
        type: 'String',
        index: 18.1
      },
      {
        key: 'type',
        value: 'Must be a string of image type',
        type: 'String',
        index: 18.1
      }
    ],
    index: 18
  },
  {
    header: 'Remaining Count of Products',
    key: 'remainingCount',
    value: 'Must be a number',
    type: 'Number',
    index: 19
  }
];
