const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { resolve } = require("path");
const moment = require("moment");
require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//place-order
module.exports.placeOrder = (order, products, total) => {
  return new Promise((resolve, reject) => {
    let status =
      order["payment-method"] === "Cash-on-delivery" ? "placed" : "pending";

    //To get today date
    let dateIso = new Date();
    let date = moment(dateIso).format("YYYY/MM/DD");
    let time = moment(dateIso).format("HH:mm:ss");
    let orderObj = {
      deliveryInfo: {
        firstname: order.fname,
        lastname: order.lname,
        number: parseInt(order.number),
        email: order.email,
        address: order.address,
        town: order.town,
        state: order.state,
        zip: parseInt(order.zip),
      },
      userId: ObjectId(order.userId),
      paymentMethod: order["payment-method"],
      products: products,
      totalAmount: total,
      status: status,
      date: date,
      time: time,
    };
    db.get()
      .collection(collection.ORDER_COLLECTION)
      .insertOne(orderObj)
      .then((response) => {
        db.get()
          .collection(collection.CART_COLLECTION)
          .deleteOne({
            user: ObjectId(order.userId),
          });
        resolve(response.insertedId);
      });
  });
};

//get order details
module.exports.getOrderDetails = (userId) => {
  return new Promise(async (resolve, reject) => {
    let orders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
          },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $project: {
            date: "$date",
            time: "$time",
            totalAmount: "$totalAmount",
            status: "$status",
            paymentMethod: "$paymentMethod",
            item: "$products.item",
            deliveryInfo: "$deliveryInfo",
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
            date: 1,
            time:1,
            status: 1,
            deliveryInfo: 1,
            totalAmount: 1,
            paymentMethod: 1,
            quantity: 1,
            products: {
              $arrayElemAt: ["$product", 0],
            },
          },
        },
      ])
      .toArray();
    resolve(orders);
  });
};

module.exports.getOrderProducts = (orderId) => {
  return new Promise(async (resolve, reject) => {
    let orderItems = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            _id: ObjectId(orderId),
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
      ])
      .toArray();
    console.log(orderItems);
    resolve(orderItems);
  });
};

(module.exports.getAllOrders = () => {
  return new Promise(async (resolve, reject) => {
    let orders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find()
      .sort({ $natural: -1 })
      .toArray();
    resolve(orders);
  });
}),

  (module.exports.generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("order is", order);
          resolve(order);
        }
      });
    });
  });

module.exports.verifyPayment = (details) => {
  return new Promise((resolve, reject) => {
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(
      details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    if (hmac == details["payment[razorpay_signature]"]) {
      console.log(true);
      resolve();
    } else {
      console.log("hellp");
      reject();
    }
  });
};

module.exports.changePaymentStatus = (orderId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.ORDER_COLLECTION)
      .updateOne(
        { _id: ObjectId(orderId) },
        {
          $set: {
            status: "placed",
          },
        }
      )
      .then(() => {
        resolve();
      });
  });
};

//change order status
module.exports.changeOrderStatus = (orderId, stat) => {
  return new Promise((resolve, reject) => {
    console.log("change orderId entered");
    if (stat == "Delivered") {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: stat,
              Delivered: true,
              Cancelled: false,
            },
          }
        )
        .then(() => {
          resolve();
        });
    } else if (stat == "Cancelled") {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: stat,
              Cancelled: true,
            },
          }
        )
        .then(() => {
          resolve();
        });
    } else {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: stat,
            },
          }
        )
        .then(() => {
          resolve();
        });
    }
  });
};

module.exports.cancelOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            Cancelled: true,
            status: "Cancelled",
          },
        }
      )
      .then((resp) => {
        resolve(resp);
      });
  }).catch((err) => {
    console.log(err);
    alert(err);
  });
};

//get total income
module.exports.getTotalIncome = () => {
  let Total = 0;
  return new Promise(async (resolve, reject) => {
    let total = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ])
      .toArray();

    if (total[0]) {
      let newTotal = total[0].total;
      resolve(newTotal);
    } else {
      resolve(Total);
    }
  });
};

//Get total number of orders
module.exports.getTotalOrders = () => {
  return new Promise(async (resolve, reject) => {
    let orders = await db.get().collection(collection.ORDER_COLLECTION).count();
    resolve(orders);
  });
};

//get all payment method
module.exports.getAllMethods = () => {
  let methods = [];
  return new Promise(async (resolve, reject) => {
    let codProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            paymentMethod: "Cash-on-delivery",
          },
        },
      ])
      .toArray();
    let codLen = codProducts.length;
    methods.push(codLen);

    let razorpayProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            paymentMethod: "ONLINE",
          },
        },
      ])
      .toArray();
    let razorpayLen = razorpayProducts.length;
    methods.push(razorpayLen);
    resolve(methods);
  });
};

//get all status
module.exports.getAllStatus = () => {
  let orderStatus = [];
  return new Promise(async (resolve, reject) => {
    let placedProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "placed",
          },
        },
      ])
      .toArray();
    let placedLen = placedProducts.length;
    orderStatus.push(placedLen);
    let shippedProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "Shipped",
          },
        },
      ])
      .toArray();
    let shippedLen = shippedProducts.length;
    orderStatus.push(shippedLen);
    let deliveredProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "delivered",
          },
        },
      ])
      .toArray();
    let deliveredLen = deliveredProducts.length;
    orderStatus.push(deliveredLen);
    let canceledProducts = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "Cancelled",
          },
        },
      ])
      .toArray();
    let canceledLen = canceledProducts.length;
    orderStatus.push(canceledLen);
    resolve(orderStatus);
  });
};

//To get recent orders
module.exports.getNewOrders = () => {
  return new Promise(async (resolve, reject) => {
    let neworders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find()
      .sort({ $natural: -1 })
      .limit(5)
      .toArray();
    resolve(neworders);
  });
};

module.exports.getSingleOrderDetails = (orderId) => {
  console.log("in confirm");
  return new Promise(async (resolve, reject) => {
    console.log(orderId);
    let order = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .findOne({ _id: ObjectId(orderId) });
    resolve(order);
    console.log(order + "kmioio");
  });
};

//Get products of a specific order with order id
module.exports.getOrderedProducts = (orderId) => {
  return new Promise(async (resolve, reject) => {
    let orderItem = await db
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
            as: "products",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: {
              $arrayElemAt: ["$products", 0],
            },
            subtotal: {
              $multiply: [
                {
                  $arrayElemAt: ["$products.price", 0],
                },
                "$quantity",
              ],
            },
          },
        },
      ])
      .toArray();
    resolve(orderItem);
  });
};
