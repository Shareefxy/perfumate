var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const async = require("hbs/lib/async");
const categoryController = require("../controller/categoryController");
const cartController = require("../controller/cartController");
const productController = require("../controller/productController");
const otpHelpers = require("./otpController");
const wishlistController = require("../controller/wishlistController");
const orderController = require("../controller/orderController");
const bannerController = require("../controller/bannerController");
const offerController = require("../controller/offerController");
const { resolve } = require("promise");
const session = require("express-session");
const { makeOtp } = require("./otpController");
const { asyncWrapper } = require("../middleware/asyncWrapper");
const ObjectId = require("mongodb").ObjectId;
const Swal = require("sweetalert2");
const { response } = require("express");
const otpController = require("./otpController");

const accountSid = process.env.TWILIO_ACCOUNTS_ID;
const authToken = process.env.TWILIO_AUTHTOKEN_ID;
const client = require("twilio")(accountSid, authToken);
let filteredProducts;

//get home page
module.exports.index = async function (req, res, next) {
  try {
    let user = req.session.user;
    let cartCount = null;
    let banners = await bannerController.getBanners();
    let homePro = await productController.getHomeProducts();
    let relatedProducts = await productController.getRelatedProducts();
    let todayDate = new Date().toISOString().slice(0, 10);
    let startCatOffer = await categoryController.startCategoryOffer(todayDate);
    let startCoupon = await offerController.startCouponOffers(todayDate);
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    res.render("user/index", {
      user,
      homePro,
      cartCount,
      relatedProducts,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

//get admin login page
module.exports.getLogin = (req, res, next) => {
  try {
    if (req.session.userloggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login", {
        loginErr: req.session.userLoginErr,
      });
      req.session.userLoginErr = null;
    }
  } catch (error) {
    next(error);
  }
};

//get signup page
module.exports.getSignup = (req, res, next) => {
  try {
    let exist = req.session.exist;
    res.render("user/signup", {
      exists: exist,
    });
  } catch (error) {
    next(error);
  }
};

//page after login action
module.exports.postLogin = (req, res, next) => {
  try {
    this.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.userLoggedIn = true;
        req.session.user = response.user;
        res.redirect("/");
      } else {
        req.session.userLoginErr = true;
        res.redirect("/login");
      }
    });
  } catch (error) {
    next(error);
  }
};

//forgot password -number submission
module.exports.forgotPassword = (req, res) => {
  res.render("user/forgot-password", { userHeader: true });
};

module.exports.postForgotPassword = (req, res, next) => {
  try {
    req.session.whole = req.body;
    otpController.makeOtp(req.session.whole).then((data) => {
      req.session.otp = data._id;
      if (data) {
        res.render("user/otpForm");
      } else {
        res.redirect("/user/forgot-password");
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.otpCheck = (req, res, next) => {
  try {
    otpHelpers.verifyOtp(req.body, req.session.whole).then((response) => {
      if (response.valid) {
        res.render("user/set-password");
      } else {
        res.redirect("/otp-check");
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.doUpdate = (data, userId) => {
  return new Promise(async (res, rej) => {
    try {
      data.password = await bcrypt.hash(data.password1, 10);
      console.log();
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          { $set: { password: data.password1 } }
        )
        .then((response) => {
          res(response);
        });
    } catch (error) {
      rej(error);
    }
  });
};
module.exports.setPassword = async (req, res, next) => {
  try {
    await this.doUpdate(req.body).then((response) => {
      req.session.userLoggedIn;
    });
  } catch (error) {
    next(error);
  }
};
//add details in signup form
module.exports.doSignup = (userData) => {
  userData.isBlocked = false;
  return new Promise(async (resolve, reject) => {
    try {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    } catch (error) {
      reject(error);
    }
  });
};

//process after signup action
module.exports.postSignup = async (req, res, next) => {
  try {
    req.session.whole = req.body;
    this.doUnique(req.body).then((response) => {
      if (response.exist) {
        req.session.exist = true;
        console.log(response);
        res.redirect("/signup");
        req.session.exist = false;
      } else {
        otpController.makeOtp(req.session.whole).then((data) => {
          if (data) {
            res.render("user/otp");
          } else {
            res.redirect("/signup");
          }
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

//checking if the email is unique
module.exports.doUnique = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let valid = {};
      let email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          email: userData.email,
        });
      if (email) {
        valid.exist = true;
        resolve(valid);
      } else {
        resolve(valid);
      }
    } catch (error) {
      reject(error);
    }
  });
};

//post otp
module.exports.postOtp = (req, res, next) => {
  try {
    otpHelpers.verifyOtp(req.body, req.session.whole).then((response) => {
      if (response.valid) {
        this.doSignup(req.session.whole).then((response) => {
          req.session.otp = false;
          req.session.userLoggedIn = true;
          res.redirect("/login");
        });
      } else {
        res.redirect("/otp");
      }
    });
  } catch (error) {
    next(error);
  }
};
//inspect login details
module.exports.doLogin = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let loginStatus = false;
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        email: userData.email,
        isBlocked: false,
      });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({
              status: false,
            });
          }
        });
      } else {
        console.log("login failed");
        resolve({
          status: false,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

//get into cart page
module.exports.cart = async (req, res, next) => {
  try {
    let products = await cartController.getCartProducts(req.session.user._id);
    let total = await cartController.getTotalPrice(req.session.user._id);
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    if (cartCount > 0) {
      res.render("user/cart", {
        products,
        user: req.session.user._id,
        cartCount,
        total,
      });
    } else {
      res.render("user/empty-cart", { user: req.session.user._id });
    }
  } catch (error) {
    next(error);
  }
};

//add to cart
module.exports.addCart = (req, res, next) => {
  try {
    cartController.addToCart(req.params.id, req.session.user._id).then(() => {
      if (response.status) {
        res.json({ status: true });
      } else if (response.exist) {
        res.json({ exist: true });
      } else {
        res.json();
      }
    });
  } catch (error) {
    next(error);
  }
};

//add to wishlist
module.exports.addWishlist = (req, res, next) => {
  try {
    wishlistController
      .addToWishlist(req.params.id, req.session.user._id)
      .then(() => {
        res.json({ status: true });
      });
  } catch (error) {
    next(error);
  }
};
//Checking user have a address or not with user id
module.exports.addressChecker = (userId) => {
  return new Promise(async (resolve, reject) => {
    let status = {};
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    if (user.address) {
      status.address = true;
    }
    resolve(status);
  });
};

//Get user address with user Id
(module.exports.getUserAddress = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    let address = user.address;
    resolve(address);
  });
}),
  //add new address
  (module.exports.newAddress = (details) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(details.userId) });
      details._id = ObjectId();
      if (user.address) {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.userId) },
            {
              $push: {
                address: details,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } else {
        addr = [details];
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.userId) },
            {
              $set: {
                address: addr,
              },
            }
          )
          .then((user) => {
            console.log(user);
            resolve(user);
          });
      }
    });
  });
//Getting addresses for editing address with address id and user id
module.exports.getSingleAddress = (Id, uId) => {
  return new Promise(async (resolve, reject) => {
    let address = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: {
            _id: ObjectId(uId),
          },
        },
        {
          $unwind: "$address",
        },
        {
          $match: {
            "address._id": ObjectId(Id),
          },
        },
        {
          $project: {
            address: 1,
            _id: 0,
          },
        },
      ])
      .toArray();
    resolve(address);
  });
};
//edit address
//edit address
module.exports.setAddress = (newData) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(newData.userId), "address._id": ObjectId(newData._id) },
        {
          $set: {
            "address.$.fname": newData.fname,
            "address.$.lname": newData.lname,
            "address.$.address": newData.address,
            "address.$.town": newData.town,
            "address.$.state": newData.state,
            "address.$.zip": newData.zip,
            "address.$.email": newData.email,
            "address.$.number": newData.number,
          },
        }
      )
      .then((response) => {
        console.log(response);
        resolve(response);
      });
  });
};
//get edit address
module.exports.editAddress = async (req, res, next) => {
  try {
    let aId = req.params.id;
    let uId = req.session.user._id;
    let address = await this.getSingleAddress(aId, uId);
    let cartCount = null;
    if (req.session.user) {
      let Id = req.session.user._id;
      cartCount = await cartController.getCartCount(Id);
    }
    let user = req.session.user;
    res.render("user/edit-address", { user, cartCount, address });
  } catch (error) {
    next(error);
  }
};
//get user profile
module.exports.myProfile = async (req, res, next) => {
  try {
    let user = await this.getUserdetails(req.session.user._id);
    let cartCount = null;
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }

    //get Address
    var address = null;
    let status = await this.addressChecker(req.session.user._id);
    if (status.address) {
      let addr = await this.getUserAddress(req.session.user._id);
      let len = addr.length;
      address = addr;
    }
    res.render("user/my-profile", { user, address, cartCount });
  } catch (error) {
    next(error);
  }
};

//get my orders
module.exports.myOrders = async (req, res, next) => {
  try {
    let user = await this.getUserdetails(req.session.user._id);
    let cartCount = null;
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    let orders = await orderController.getOrderDetails(req.session.user._id);
    res.render("user/my-orders", { user, cartCount, orders });
  } catch (error) {
    next(error);
  }
};
//get my wishlist
module.exports.myWishlist = async (req,res,next) => {
  try {
    let cartCount = null;
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    let products = await wishlistController.getWishlistProducts(req.session.user._id);
    if (products.length != 0) {
      res.render("user/my-wishlist", {
        products,
        cartCount,
        user: req.session.user._id,
      });
    } else {
      res.render("user/empty-wishlist", { user: req.session.user._id });
    }
  } catch (error) {
    next(error);
  }
};
//filter products
module.exports.filterProduct = (req, res, next) => {
  try {
    const detail = req.body;
    const price = parseInt(detail.price);
    const filter = [];
    for (const i of detail.categoryName) {
      filter.push({ category: i });
    }
    products = productController
      .filterProducts(filter, price)
      .then((response) => {
        filteredProducts = response;
        if (req.body.sort == "Sort") {
          res.json({ status: true });
        }
        if (req.body.sort == "lh") {
          filteredProducts.sort((a, b) => a.price - b.price);
          res.json({ status: true });
        }
        if (req.body.sort == "hl") {
          filteredProducts.sort((a, b) => b.price - a.price);
          res.json({ status: true });
        }
      });
  } catch (error) {
    next(error);
  }
};
//post edit address
module.exports.postEditAddress = (req, res) => {
  console.log(req.body);
  this.setAddress(req.body).then((response) => {
    res.redirect("/profile");
  });
};
//Deleting address
module.exports.delAddress = (Id, uId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(uId) });
    if (user) {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(uId) },
          {
            $pull: {
              address: { _id: ObjectId(Id) },
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    }
  });
};
module.exports.deleteAddress = (req, res) => {
  let Id = req.params.id;
  let uId = req.session.user._id;
  this.delAddress(Id, uId).then((response) => {
    res.redirect("/profile");
  });
};
module.exports.getallUsers = () => {
  return new Promise(async (resolve, reject) => {
    const users = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    resolve(users);
  });
};
//get total users count
module.exports.countOfUsers = () => {
  return new Promise(async (resolve, reject) => {
    const usersCount = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .count();
    resolve(usersCount);
  });
};
//
module.exports.getUserDetailsNo = (No) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ number: mobilenumber });
    if (user) {
      console.log(user, "user inside of getUserDetail");
      resolve(user);
    } else {
      console.log("else");
      resolve(false);
    }
  });
};
//Getting user details with User ID
module.exports.getUserdetails = (Id) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(Id) });
    if (user) {
      resolve(user);
    } else {
      console.log("else");
      resolve(false);
    }
  });
};

//add address
module.exports.addAddress = async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    let Id = req.session.user._id;
    cartCount = await cartController.getCartCount(Id);
  }
  let user = req.session.user;
  res.render("user/add-address", { user, cartCount });
};
module.exports.addAddress1 = (req, res) => {
  console.log(req.body);

  this.newAddress(req.body).then((response) => {
    res.redirect("/checkout");
  });
};
//add new address
module.exports.Address = async (req, res) => {
  let cartCount = null;
  let user = req.session.user;
  if (user) {
    let Id = req.session.user._id;
    cartCount = await cartController.getCartCount(Id);
  }
  res.render("user/add-new-address", { user, cartCount });
};

module.exports.addNewAddressProfile = (req, res) => {
  this.newAddress(req.body).then((response) => {
    res.redirect("/profile");
  });
};

//update profile
module.exports.updateProfile = (id, newData) => {
  return new Promise(async (resolve, reject) => {
    let user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(id) });
    console.log(user);
    let newf = newData.fname;
    let newL = newData.lname;

    let newE = newData.email;
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            fname: newf,
            lname: newL,
            email: newE,
          },
        }
      )
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};
//update profile
module.exports.editProfile = (req, res, next) => {
  let id = req.session.user._id;

  this.updateProfile(id, req.body).then((response) => {
    res.redirect("/profile");
  });
};

module.exports.blockUser = (user) => {
  let userId = ObjectId(user);
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        {
          _id: userId,
        },
        {
          $set: {
            isBlocked: true,
          },
        }
      );
  }).then((resolve) => {});
};
module.exports.unBlockUser = (user) => {
  let userId = ObjectId(user);
  console.log(userId);
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        {
          _id: userId,
        },
        {
          $set: {
            isBlocked: false,
          },
        }
      );
  }).then(() => {});
};

//product section
//get product page
module.exports.viewProductPage = async (req, res, next) => {
  try {
    let user = req.session.user;
    let cartCount = null;
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    categoryController.viewCategory().then((dataInfo) => {
      productController.getAllProduct().then((products) => {
        if (filteredProducts) {
          products = filteredProducts;
        }
        res.render("user/view-products", {
          products,
          user,
          cartCount,
          dataInfo,
        });
        filteredProducts = null;
      });
    });
  } catch (error) {
    next(error);
  }
};
//view single product
//get single product
module.exports.viewSingleProduct = async (req, res, next) => {
  try {
    let user = req.session.user;
    let proId = req.params.id;
    let cartCount = null;
    let relatedProducts = await productController.getRelatedProducts();
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    productController.getSingleProduct(proId).then((products) => {
      res.render("user/single-product", {
        products,
        user,
        cartCount,
        relatedProducts,
      });
    });
  } catch (error) {
    next(error);
  }
};

//change product quantity
module.exports.changeProQty = (req, res, next) => {
  try {
    cartController.changeProductQuantity(req.body).then(async (response) => {
      response.total = await cartController.getTotalPrice(req.body.user);
      res.json(response);
    });
  } catch (error) {
    next(error);
  }
};

//get total amount
module.exports.getTotal = async (req, res, next) => {
  let products = await cartController.getCartProducts(req.session.user._id);
  let total = await cartController.getTotalPrice(req.session.user._id);
  //cart count
  let cartCount = null;
  if (req.session.user) {
    let Id = req.session.user._id;
    cartCount = await cartController.getCartCount(Id);
  }
  //get Address
  var address = null;

  let status = await this.addressChecker(req.session.user._id);
  if (status.address) {
    let addr = await this.getUserAddress(req.session.user._id);
    let len = addr.length;
    address = addr.slice(len - 2, len);
  }
  if (cartCount > 0) {
    res.render("user/checkout", {
      total,
      cart: true,
      cartCount,
      products,
      address,
      user: req.session.user,
    });
    // res.render("user/checkout", { total, , products })
  } else {
    req.session.noCartPro = true;
    res.redirect("/cart");
  }
};

//place order
module.exports.postCheckout = async (req, res) => {
  try {
    console.log(req.session);
    let products = await cartController.getCartProductsList(req.body.userId);
    if (req.session.couponTotal) {
      var totalPrice = req.session.couponTotal;
      console.log("in coupon" + totalPrice);
    } else {
      totalPrice = await cartController.getTotalPrice(req.session.user._id);
      console.log("no coupon" + totalPrice);
    }
    orderController
      .placeOrder(req.body, products, totalPrice)
      .then((orderId) => {
        if (req.body["payment-method"] === "Cash-on-delivery") {
          res.json({ codSuccess: true, orderId });
          req.session.couponTotal = null;
        } else {
          req.session.orderPayId = orderId;
          orderController
            .generateRazorpay(orderId, totalPrice)
            .then((response) => {
              res.json(response);
            });
        }
      });
  } catch (error) {
    next(error);
  }
};
//order success page
module.exports.confirmation = async (req, res, next) => {
  try {
    console.log(true);
    let user = req.session.user;
    console.log(user);
    console.log(req.session);
    let orderId = req.params.id;
    console.log("order" + orderId);
    let order = await orderController.getSingleOrderDetails(orderId);
    console.log(order);
    let products = await orderController.getOrderedProducts(orderId);
    console.log(products);
    res.render("user/confirmation", { user, order, orderId, products });
  } catch (error) {
    next(error);
  }
};

module.exports.invoice = async (req, res, next) => {
  try {
    let orderId = req.params.oId;
    let order = await orderController.getSingleOrderDetails(orderId);
    console.log(order);
    let products = await orderController.getOrderedProducts(orderId);
    console.log(products);
    let user = req.session.user;
    let cartCount = null;
    if (req.session.user) {
      let Id = req.session.user._id;
      cartCount = await cartController.getCartCount(Id);
    }
    res.render("user/invoice", { order, products, user, cartCount });
  } catch (error) {
    next(error);
  }
};
//order list
module.exports.orderList = async (req, res,next) => {
  try {
    let orders = await orderController.getOrderDetails(req.session.user._id);
    console.log(orders);
    let len = orders.length;
    if (len > 0) {
      res.render("user/orders-list", { user: req.session.user, orders });
    } else {
      res.render("user/empty-orders", { user: req.session.user });
    }
  } catch (error) {
    next(error);
  }
};

//remove cart product
module.exports.removeCartProduct = (req, res) => {
  cartController.deleteCartProduct(req.body).then(async (response) => {
    res.json(response);
  });
};

//verify-payment
module.exports.verifyPayment = (req,res,next) => {
  try {
    orderController
      .verifyPayment(req.body)
      .then(async () => {
        if (req.session.couponTotal) {
          var total = req.session.couponTotal;
        } else {
          total = await cartController.getTotalPrice(req.session.userId);
        }
        orderController
          .changePaymentStatus(req.body["order[receipt]"])
          .then(() => {
            console.log("payment success");
            req.session.couponTotal = null;
            res.json({ status: true, orderId: req.session.orderPayId });
          })
          .catch((err) => {
            console.log(err);
            res.json({ status: false, errMsg: "" });
          });
      })
      .catch((err) => {
        res.json("something went wrong" + err);
      });
  } catch (error) {
    next(error);
  }
};
//get into wishlist page
module.exports.wishlist = async (req,res,next) => {
  try {
    let cartCount = null;
    if (req.session.user) {
      cartCount = await cartController.getCartCount(req.session.user._id);
    }
    let products = await wishlistController.getWishlistProducts(req.session.user._id);
    if (products.length != 0) {
      res.render("user/wishlist", {
        products,
        cartCount,
        user: req.session.user._id,
      });
    } else {
      res.render("user/empty-wishlist", { user: req.session.user._id });
    }
  } catch (error) {
    next(error);
  }
};

//remove wishlist product
module.exports.removeWishlistProduct = (req, res) => {
  wishlistController.deleteWishlistProduct(req.body).then(async (response) => {
    res.json(response);
  });
};

//get brand products
module.exports.getHomeBrand = async (req, res, next) => {
  try {
    let name = req.params.brand;
    let user = req.session.user;
    let brand = await productController.getBrands();
    let homePro = await productController.getHomeProducts();
    // let homeCategory = await userHelper.getHomeCategories()
    let product = await productController.getProductsByBrand(name);
    // let allBrands = await adminHelpers.getAllBrands()
    console.log(product);
    let cartCount = null;
    if (req.session.user) {
      let Id = req.session.user._id;
      cartCount = await cartController.getCartCount(Id);
    }
    res.render("user/brand-products", {
      brand,
      user,
      cartCount,
      homePro,
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.searchProduct = (req, res, next) => {
  let key = req.body.key;
  this.searchProducts(key).then((response) => {
    (filteredProducts = response), res.redirect("/view-products");
  });
};
(module.exports.searchProducts = (key) => {
  return new Promise(async (resolve, reject) => {
    let products = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find({
        $or: [
          {
            name: { $regex: key, $options: "i" },
          },
          {
            category: { $regex: key, $options: "i" },
          },
        ],
      })
      .toArray();
    resolve(products);
  });
}),
  //get new users
  (module.exports.getNewUsers = () => {
    return new Promise(async (resolve, reject) => {
      let newUsers = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .sort({ $natural: -1 })
        .limit(5)
        .toArray();
      resolve(newUsers);
    });
  });
////Coupon-------------
module.exports.postApplyCoupon = (req, res, next) => {
  try {
    let id = req.session.user._id;
    offerController.couponValidate(req.body, id).then((response) => {
      req.session.couponTotal = response.total;
      if (response.success) {
        res.json({ couponSuccess: true, total: response.total });
      } else if (response.couponUsed) {
        res.json({ couponUsed: true });
      } else if (response.couponExpired) {
        res.json({ couponExpired: true });
      } else {
        res.json({ invalidCoupon: true });
      }
    });
  } catch (error) {
    next(error);
  }
};

//buy now section
module.exports.buyNow = async (req, res, next) => {
  try {
    let pId = req.params.id;
    req.session.proId = pId;
    let user = req.session.user;
    let uId = req.session.user._id;
    let productDetails = await productController.getBuyNowProductDetails(pId);
    let total = await productController.getBuyNowTotal(pId);
    req.session.pId = pId;
    //cart count
    let cartCount = null;
    if (req.session.user) {
      let Id = req.session.user._id;
      cartCount = await cartController.getCartCount(Id);
    }
    //get Address
    var address = null;
    let status = await this.addressChecker(req.session.user._id);
    if (status.address) {
      let addr = await this.getUserAddress(req.session.user._id);
      let len = addr.length;
      address = addr.slice(len - 2, len);
    }
    res.render("user/buy-now", {
      user,
      productDetails,
      total,
      cartCount,
      address,
      pId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.postBuyNow = async (req, res, next) => {
  try {
    if (req.session.userLoggedIn) {
      req.session.buyNowData = req.body;
      let newId = new ObjectId();
      if (req.session.couponTotal) {
        var total = req.session.couponTotal;
      } else {
        total = await productController.getBuyNowTotal(req.body.ProId);
      }
      if (req.body["Payment"] == "COD") {
        console.log("in cod");
        let id = req.session.user._id;
        let product = await productController.getBuyNowProduct(req.body.ProId);
        if (req.session.couponTotal) {
          var total = req.session.couponTotal;
        } else {
          total = await userHelper.getBuyNowTotal(req.body.ProId);
        }
        orderController.placeOrder(req.body, product, total).then((resp) => {
          req.session.orderId = resp.insertedId.toString();
          let orderId = req.session.orderId;
          productController.stockManagment(req.session.orderId).then(() => {
            req.session.ordered = true;
            req.session.buyNow = true;
            req.session.couponTotal = null;
            res.json({ codSuccess: true });
          });
        });
      } else if (req.body["Payment"] == "Razorpay") {
        console.log("in online payment");
        orderController
          .generateRazorpay(orderId, totalPrice)
          .then((response) => {
            res.json(response);
          });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};
module.exports.verifyBuyNowPayment = (req, res, next) => {
  try {
    let id = req.session.user._id;
    orderController
      .verifyPayment(req.body)
      .then(async (response) => {
        let id = req.session.user._id;
        let data = req.session.buyNowData;
        let ProId = data.ProId;
        let product = await productController.getBuyNowProduct(ProId);
        if (req.session.couponTotal) {
          var total = req.session.couponTotal;
        } else {
          total = await productController.getBuyNowTotal(ProId);
        }
        orderController.placeOrder(data, product, total).then((resp) => {
          req.session.orderId = resp.insertedId.toString();
          let orderId = req.session.orderId;
          console.log(req.session.orderId, "order id");
          productController.stockManagment(req.session.orderId).then(() => {
            req.session.couponTotal = null;
            req.session.ordered = true;
            console.log("cart cleared");
            req.session.buyNowData = null;
            res.json({ status: true });
            req.session.buyNow = true;
          });
        });
      })
      .catch((err) => {
        console.log("failed");
        res.json({ status: false });
      });
  } catch (error) {
    next(error);
  }
};

//contact
module.exports.contact = async(req,res)=>{
  let user= req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartController.getCartCount(req.session.user._id);
  }
  res.render('user/contact',{user,cartCount})
}
//user logout section
module.exports.logout = (req, res) => {
  req.session.userLoggedIn = null;
  req.session.user = null;
  res.redirect("/");
};
