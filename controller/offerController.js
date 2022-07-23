var db = require("../config/connection");
var collection = require("../config/collection");
const moment = require("moment");
const {
  ObjectId
} = require("mongodb");
//get all coupons
module.exports.getAllCoupons = () => {
  return new Promise(async (resolve, reject) => {
    let coupons = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .find()
      .toArray();
    resolve(coupons);
  });
};

module.exports.addCoupon = (data) => {
  return new Promise(async (resolve, reject) => {
    let startDateIso = new Date(data.Starting);
    let endDateIso = new Date(data.Expiry);
    // let expiry = await moment(data.Expiry).format('YYYY-MM-DD')
    // let starting = await moment(data.Starting).format('YYYY-MM-DD')
    let expiry = await data.Expiry;
    let starting = await data.Starting;
    let dataobj = await {
      Coupon: data.Coupon,
      Offer: parseInt(data.Offer),
      Starting: starting,
      Expiry: expiry,
      startDateIso: startDateIso,
      endDateIso: endDateIso,
      Users: [],
    };
    db.get()
      .collection(collection.COUPON_COLLECTION)
      .insertOne(dataobj)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

(module.exports.startCouponOffers = (date) => {
  let couponStartDate = new Date(date);
  return new Promise(async (resolve, reject) => {
    let data = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .find({
        startDateIso: {
          $lte: couponStartDate
        }
      })
      .toArray();
    if (data) {
      await data.map(async (oneData) => {
        console.log(oneData);
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .updateOne({
            _id: ObjectId(oneData._id)
          }, {
            $set: {
              Available: true,
            },
          })
          .then(() => {
            resolve();
          });
      });
    } else {
      resolve();
    }
  });
}),
(module.exports.updateCoupon = (couponId) => {
  user = req.session.user._id
  return new Promise(async (resolve, reject) => {
    let changeCouponStatus = db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .updateOne({
        _id: ObjectId(couponId)
      }, {
        $push: {
          Users: user,
        }
      })
    resolve(changeCouponStatus)

  });
});
module.exports.couponValidate = (data, user) => {
  return new Promise(async (resolve, reject) => {
    console.log("in coupon");
    obj = {};
    let date = new Date();
    date = moment(date).format("YYYY-MM-DD");
    let coupon = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .findOne({
        Coupon: data.Coupon,
        Available: true
      });
    console.log(coupon);
    if (coupon) {

      let users = coupon.Users;
      console.log("hello" + users);
      let userChecker = users.includes(user);
      if (userChecker) {
        obj.couponUsed = true;
        console.log("Already used");
        resolve(obj);
      } else {
        if (date <= coupon.Expiry) {
          let total = parseInt(data.Total);
          let percentage = parseInt(coupon.Offer);
          let discountVal = ((total * percentage) / 100).toFixed();
          obj.total = total - discountVal;
          obj.success = true;
          resolve(obj);

        } else {
          obj.couponExpired = true;
          console.log("Expired");
          resolve(obj);
        }
      }
    } else {
      obj.invalidCoupon = true;
      console.log("invalid");
      resolve(obj);
    }
  });
};
module.exports.deleteCoupons = (id) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.COUPON_COLLECTION)
      .deleteOne({
        _id: ObjectId(id)
      })
      .then(() => {
        console.log(true);
        resolve();
      });
  });
};