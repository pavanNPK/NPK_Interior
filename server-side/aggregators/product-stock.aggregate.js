export const productStockAggregate = function(type) {
    let filter = {};

    if (type === 'lowStock') {
        filter = { remainingCount: { $lt: 51, $gt: 0 } };
    } else if (type === 'outOfStock') {
        filter = { remainingCount: { $lt: 1 } };
    } else if (type === 'appliedStock') {
        filter = { requested: true };
    }

    return [
        {
            $match: filter
        },
        // {
        //     $lookup: {
        //         from: 'wholesalers',
        //         pipeline: [  // Aggregate wholesalers as part of the lookup
        //             {
        //                 $project: {
        //                     name: 1,
        //                     email: 1,
        //                     code: 1,
        //                     profilePicture: { $arrayElemAt: ["$images.key", 0] } // First image from the array
        //                 }
        //             }
        //         ],
        //         as: 'wholesalers'  // Add all wholesalers in an array
        //     }
        // },
        {
            $project: {
                name: 1,
                slug: 1,
                remainingCount: 1,
                _id: 1,
                requiredStock: 1,
                // wholesalers: {
                //     _id: 1,
                //     name: 1,
                //     email: 1,
                //     code: 1,
                //     profilePicture: 1  // Include the profile picture (first image)
                // }
            }
        }
    ];
};
