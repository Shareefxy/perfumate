var db = require("../config/connection");
var collection = require("../config/collection");
const async = require("hbs/lib/async");
const { response } = require("../app");
const ObjectId = require("mongodb").ObjectId;

module.exports.addProduct = (product, callback) => {
  db.get()
    .collection(collection.PRODUCT_COLLECTION)
    .insertOne({
      title: product.title,
      description: product.description,
      category: product.category,
      type: product.type,
      price: Number(product.price),
      stock: Number(product.stock),
      image: product.image,
      isDeleted: false,
    })
    .then((product) => {
      callback(product.insertedId);
    });
};
(module.exports.filterProducts = (filter, price) => {
  try {
    return new Promise(async (resolve, reject) => {
      if (filter.length > 1) {
        let filterProducts = db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: {
                $or: filter,
              },
            },
            {
              $match: {
                price: { $lt: price },
              },
            },
          ])
          .toArray();
        resolve(filterProducts);
      } else {
        let filterProducts = db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: {
                price: { $lt: price },
              },
            },
          ])
          .toArray();
        resolve(filterProducts);
      }
    });
  } catch (error) {
    reject(error);
  }
}),
  //Get brands and products for user header
  (module.exports.getBrands = () => {
    return new Promise(async (resolve, reject) => {
      let brands = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .sort({ $natural: -1 })
        .limit(6)
        .toArray();
      resolve(brands);
    });
  });
//By Brands
module.exports.getProductsByBrand = (name) => {
  return new Promise(async (resolve, reject) => {
    let products = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find({ category: name })
      .toArray();
    resolve(products);
  });
};
module.exports.getHomeProducts = () => {
  return new Promise(async (resolve, reject) => {
    let products = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find()
      .sort({ $natural: -1 })
      .limit(4)
      .toArray();

    resolve(products);
  });
};

module.exports.getAllProduct = () => {
  return new Promise(async (resolve, reject) => {
    let products = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find({
        isDeleted: false,
      })
      .toArray();
    resolve(products);
  });
};

//single view
module.exports.getSingleProduct = (proId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({
        _id: ObjectId(proId),
      })
      .then((products) => {
        resolve(products);
      });
  });
};

//edit product
module.exports.updateProduct = (proId, proDetails) => {
  return new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(proId),
        },
        {
          $set: {
            title: proDetails.title,
            description: proDetails.description,
            price: Number(proDetails.price),
            stock: Number(proDetails.stock),
            image: proDetails.image,
            isDeleted: false,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};
module.exports.getProductDetails = (proId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({
        _id: ObjectId(proId),
      })
      .then((product) => {
        resolve(product);
      });
  });
};

module.exports.delProduct = (proId) => {
  console.log(proId);
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(proId),
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

//get related product
module.exports.getRelatedProducts = () => {
  return new Promise(async (resolve, reject) => {
    let limit = 4;
    let related = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find()
      .sort({ $natural: -1 })
      .limit(6)
      .toArray();
    resolve(related);
  });
};

//get product count
module.exports.countOfProducts = () => {
  return new Promise((resolve, reject) => {
    const productCount = db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .count();
    resolve(productCount);
  });
};

//TO get recently added products
module.exports.getNewProducts = () => {
  return new Promise(async (resolve, reject) => {
    let newProducts = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find()
      .sort({ $natural: -1 })
      .limit(5)
      .toArray();
    resolve(newProducts);
  });
};

module.exports.stockManagment = (orderId) => {
  return new Promise(async (res, rej) => {
    let product = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(orderId),
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
            newQty: {
              $subtract: [
                {
                  $arrayElemAt: ["$product.stock", 0],
                },
                "$quantity",
              ],
            },
          },
        },
      ])
      .toArray();
    let proLen = prod.length;
    for (let i = 0; i < proLen; i++) {
      let item = product[i];
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(item.item) },
          {
            $set: {
              stock: item.newQty,
            },
          }
        );
      if (item.newQty < 1) {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectId(item.item) },
            {
              $set: {
                stockout: true,
              },
            }
          );
      } else {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectId(item.item) },
            {
              $unset: {
                stockout: "",
              },
            }
          );
      }
    }
    resolve();
  });
};

module.exports.categoryCount = () => {
  return new Promise((resolve, reject) => {
    const productCount = db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .count();
    resolve(productCount);
  });
};

//buy now section
module.exports.getBuyNowProduct = (proId) => {
  return new Promise(async (resolve, reject) => {
    let pro = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(proId) });
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
      subtotal: pro.price,
    };
    let product = [proObj];
    resolve(product);
  });
};
module.exports.getBuyNowProductDetails = (pId) => {
  return new Promise(async (resolve, reject) => {
    let product = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(pId) });
    resolve(product);
  });
};

module.exports.getBuyNowTotal = (pId) => {
  return new Promise(async (resolve, reject) => {
    console.log(pId);
    let product = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(pId) });
    console.log(product);
    resolve(product.price);
  });
};
