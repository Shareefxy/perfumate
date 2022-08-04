const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");

//Wishlist section starts here
module.exports.addToWishlist = (proId, userId) => {
  let wishObj = {
    item: ObjectId(proId),
  };
  return new Promise(async (resolve, reject) => {
    let userWish = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .findOne({ user: ObjectId(userId) });
    if (userWish) {
      let proExist = await userWish.products.findIndex(
        (product) => product.item == proId
      );
      if (proExist != -1) {
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .updateOne(
            { user: ObjectId(userId) },
            {
              $pull: {
                products: { item: ObjectId(proId) },
              },
            }
          )
          .then((response) => {
            console.log("pulled");
            resolve({ pulled: true });
          });
      } else {
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .updateOne(
            { user: ObjectId(userId) },
            {
              $push: {
                products: wishObj,
              },
            }
          )
          .then(() => {
            console.log("pushed");
            resolve({ pushed: true });
          });
      }
    } else {
      let wish = {
        user: ObjectId(userId),
        products: [wishObj],
      };
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .insertOne(wish)
        .then((response) => {
          resolve(response);
          console.log(" Created new wishlist");
        });
    }
  });
};

//Get wishlist products for show in wishlist
module.exports.getWishlistProducts = (userId) => {
  return new Promise(async (resolve, reject) => {
    let wishProducts = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .aggregate([
        {
          $match: {
            user: ObjectId(userId),
          },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ])
      .toArray();
    resolve(wishProducts);
  });
};

module.exports.deleteWishlistProduct = (wishPro) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.WISHLIST_COLLECTION)
      .updateOne(
        { _id: ObjectId(wishPro.wishlist) },
        {
          $pull: {
            products: { item: ObjectId(wishPro.product) },
          },
        }
      )
      .then((response) => {
        console.log("pulled");
        resolve({
          removeProducts: true,
        });
      });
  });
};
