const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
//Get banners from banner collection
module.exports.getBanners = () => {
  return new Promise(async (resolve, reject) => {
    try {
        let banners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banners);
      
    } catch (error) {
        reject(error)
    }

  });
};

//add banners
module.exports.addBanner = (data) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.BANNER_COLLECTION)
      .insertOne(data)
      .then((response) => {
        resolve(response.insertedId.toString());
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.getBannerDetails = (id) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.BANNER_COLLECTION)
      .findOne({ _id: ObjectId(id) })
      .then((banner) => {
        resolve(banner);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.updateBanner = (id, newData) => {
  console.log(newData);
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.BANNER_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            bannerName: newData.bannerName,
            description: newData.description,
            offer: newData.offer,
          },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.deleteBanner = (id) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.BANNER_COLLECTION)
      .deleteOne({ _id: ObjectId(id) })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
