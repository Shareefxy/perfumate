const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const { response } = require("../app");
const asyncWrapper = require("../middleware/asyncWrapper");
const async = require("hbs/lib/async");

module.exports.addToCart = (proId, userId) => {
  let proObj = {
    item: ObjectId(proId),
    quantity: 1,
  };
  return new Promise(async (resolve, reject) => {
    let userCart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({
        user: ObjectId(userId),
      });
    if (userCart) {
      let proExist = userCart.products.findIndex(
        (product) => product.item == proId
      );
      console.log(proExist);
      if (proExist != -1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              user: ObjectId(userId),
              "products.item": ObjectId(proId),
            },
            {
              $inc: {
                "products.$.quantity": 1,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              user: ObjectId(userId),
            },
            {
              $push: {
                products: proObj,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      }
    } else {
      let cartObj = {
        user: ObjectId(userId),
        products: [proObj],
      };
      db.get()
        .collection(collection.CART_COLLECTION)
        .insertOne(cartObj)
        .then((response) => {
          resolve(response);
        });
    }
  });
};
module.exports.getCartProducts = (userId) => {
  return new Promise(async (resolve, reject) => {
    let cartItems = await db
      .get()
      .collection(collection.CART_COLLECTION)
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
            quantity: "$products.quantity",
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
            quantity: 1,
            product: {
              $arrayElemAt: ["$product", 0],
            },
          },
        },
        {
          $addFields: {
            totalPrice: {
              $multiply: ["$quantity", "$product.price"],
            },
          },
        },
      ])
      .toArray();
    resolve(cartItems);
  });
};

module.exports.getCartCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    let cart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({
        user: ObjectId(userId),
      });
    if (cart) {
      count = cart.products.length;
    }
    resolve(count);
  });
};

module.exports.changeProductQuantity = (details) => {
  details.count = parseInt(details.count);
  details.quantity = parseInt(details.quantity);
  return new Promise((resolve, reject) => {
    if (details.count == -1 && details.quantity == 1) {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.cart),
          },
          {
            $pull: {
              products: {
                item: ObjectId(details.product),
              },
            },
          }
        )
        .then((response) => {
          resolve({
            removeProduct: true,
          });
        });
    } else {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.cart),
            "products.item": ObjectId(details.product),
          },
          {
            $inc: {
              "products.$.quantity": details.count,
            },
          }
        )
        .then((response) => {
          resolve({
            status: true,
          });
        });
    }
  });
};

module.exports.getTotalPrice = async (userId) => {
  return new Promise(async (resolve, reject) => {
    let cart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({
        user: ObjectId(userId),
      });
    if (cart) {
      if (cart.products.length > 0) {
        let total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: {
                user: new ObjectId(userId),
              },
            },
            {
              $unwind: {
                path: "$products",
              },
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "product",
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: {
                  $arrayElemAt: ["$product", 0],
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$quantity", "$product.price"],
                  },
                },
              },
            },
          ])
          .toArray();
        resolve(total[0].total);
        console.log(total);
      } else {
        console.log("no products");
        let total = [
          {
            total: 0,
          },
        ];
        resolve(total[0].total);
      }
    } else {
      resolve();
    }
  }).catch((err) => {
    resolve(err);
  });
};

module.exports.getCartProductsList = (userId) => {
  return new Promise(async (resolve, reject) => {
    let cart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({
        user: ObjectId(userId),
      });
    resolve(cart.products);
  });
};

//remove cart products
module.exports.deleteCartProduct = (cartPro) => {
  console.log(true);
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CART_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(cartPro.cart),
        },
        {
          $pull: {
            products: {
              item: ObjectId(cartPro.product),
            },
          },
        }
      )
      .then((response) => {
        resolve({
          removeProducts: true,
        });
      });
  });
};

//For clear cart after placing order
module.exports.clearCart = (User) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CART_COLLECTION)
      .deleteOne({ user: objectId(User) })
      .then(() => {
        resolve();
      });
  });
};
