var db = require("../config/connection");
var collection = require("../config/collection");
const ObjectId = require("mongodb").ObjectId;

//category management
//find categories
module.exports.viewCategory = () => {
  return new Promise(async (resolve, reject) => {
    let dataInfo = await db
      .get()
      .collection(collection.CATEGORY_COLLECTION)
      .find({
        isDeleted: false,
      })
      .toArray();

    resolve(dataInfo);
  });
};

//add categories

module.exports.addCategory = (data) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .insertOne({
        name: data.name,
        isDeleted: false,
      })
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

//edit category
module.exports.editCategory = (catId, catDetails) => {
  return new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(catId),
        },
        {
          $set: {
            name: catDetails.name,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

module.exports.deleteCategory = (proId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
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
      .then(() => {
        resolve();
      });
  });
};

//add category offers
// Category offers
module.exports.addCategoryOffer = (data) => {
  console.log(data);
  let cname = data.Category;
  data.catOfferPercentage = parseInt(data.catOfferPercentage);
  return new Promise(async (resolve, reject) => {
    data.startDateIso = new Date(data.Starting);
    data.endDateIso = new Date(data.Expiry);
    let response = {};
    let exist = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ name: data.Category, offer: { $exists: true } });
    if (exist) {
      response.exist = true;
      resolve(response);
    } else {
      db.get()
        .collection(collection.CATEGORY_OFFERS)
        .insertOne(data)
        .then(async (response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};
//start category offer
(module.exports.startCategoryOffer = (date) => {
  let startDateIso = new Date(date);
  return new Promise(async (resolve, reject) => {
    let data = await db
      .get()
      .collection(collection.CATEGORY_OFFERS)
      .find({ startDateIso: { $lte: startDateIso } })
      .toArray();
    if (data.length > 0) {
      await data.map(async (onedata) => {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ category: onedata.Category, offer: { $exists: false } })
          .toArray();
        await products.map(async (product) => {
          let actualPrice = product.price;
          let newPrice = (product.price * onedata.catOfferPercentage) / 100;
          newPrice = newPrice.toFixed();
          console.log(actualPrice, newPrice, onedata.catOfferPercentage);
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: ObjectId(product._id) },
              {
                $set: {
                  actualPrice: actualPrice,
                  price: actualPrice - newPrice,
                  offer: true,
                  catOfferPercentage: onedata.catOfferPercentage,
                },
              }
            );
        });
      });
      resolve();
    } else {
      resolve();
    }
  });
}),
  (module.exports.deleteCatOffer = (id) => {
    return new Promise(async (resolve, reject) => {
      let categoryOffer = await db
        .get()
        .collection(collection.CATEGORY_OFFERS)
        .findOne({ _id: ObjectId(id) });
      let cname = categoryOffer.Category;
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: cname, offer: { $exists: true } })
        .toArray();
      console.log(products);
      if (products) {
        db.get()
          .collection(collection.CATEGORY_OFFERS)
          .deleteOne({ _id: ObjectId(id) })
          .then(async () => {
            await products.map(async (product) => {
              db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  { _id: ObjectId(product._id) },
                  {
                    $set: {
                      price: product.actualPrice,
                    },
                    $unset: {
                      offer: "",
                      catOfferPercentage: "",
                      actualPrice: "",
                    },
                  }
                )
                .then(() => {
                  resolve();
                });
            });
          });
      } else {
        resolve();
      }
    });
  }),
  //get category offers
  (module.exports.getAllCatOffers = () => {
    return new Promise(async (resolve, reject) => {
      let categoryOffer = await db
        .get()
        .collection(collection.CATEGORY_OFFERS)
        .find()
        .toArray();
      resolve(categoryOffer);
    });
  });
