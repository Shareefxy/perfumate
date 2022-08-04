var db = require("../config/connection");
var collection = require("../config/collection");
const categoryController = require("../controller/categoryController");
const userController = require("../controller/userController");
const productController = require("../controller/productController");
const orderController = require("../controller/orderController");
const bannerController = require("../controller/bannerController");
const offerController = require("../controller/offerController");
const bcrypt = require("bcrypt");
const { response } = require("express");
const async = require("hbs/lib/async");
const ObjectId = require("mongodb").ObjectId;
var fs = require("fs");

//get home page
module.exports.home = async (req, res, next) => {
  try {
    let allOutput = await Promise.all([
      orderController.getTotalIncome(),
      userController.countOfUsers(),
      productController.countOfProducts(),
      orderController.getTotalOrders(),
      orderController.getAllMethods(),
      productController.getNewProducts(),
      userController.getNewUsers(),
      orderController.getNewOrders(),
      orderController.getAllStatus(),
    ]);
    console.log(allOutput[0]);
    res.render("admin/index", {
      totalIncome: allOutput[0],
      usersCount: allOutput[1],
      productCount: allOutput[2],
      orderCount: allOutput[3],
      paymentMethods: allOutput[4],
      getNewProducts: allOutput[5],
      newUsers: allOutput[6],
      newOrders: allOutput[7],
      getAllStatus: allOutput[8],
      layout: "adminLayout",
    });
  } catch (error) {
    next(error);
  }
};

//get login page
module.exports.getLogin = (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin");
    } else
      res.render("admin/Login", {
        adminErr: req.session.adminErr,
        layout: "adminLayout",
        admin: true,
      });
    req.session.adminErr = false;
  } catch (error) {
    next(error);
  }
};

//get to admin home
module.exports.postLogin = (req, res, next) => {
  try {
    this.adminLogin(req.body).then(async (response) => {
      if (response.status) {
        req.session.admin = true;
        res.redirect("/admin");
        let todayDate = new Date().toISOString().slice(0, 10);
        let startCatOffer = await categoryController.startCategoryOffer(
          todayDate
        );
        let startCoupon = await offerController.startCouponOffers(todayDate);
      } else {
        req.session.adminErr = true;
        res.redirect("/admin/login");
      }
    });
  } catch (error) {
    next(error);
  }
};

//inspect login details
module.exports.adminLogin = (adminData) => {
  return new Promise(async (resolve, reject, next) => {
    try {
      let response = {};
      let loginStatus = true;
      let adminAuth = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({
          email: adminData.email,
        });
      if (adminAuth) {
        bcrypt
          .compare(adminData.password, adminAuth.password)
          .then((status) => {
            if (status) {
              response.status = true;
              resolve(response);
              console.log("admin success");
            } else {
              resolve({
                status: false,
              });
              console.log("admin failed");
            }
          });
      } else {
        resolve({
          status: false,
        });
        console.log("admin failed again");
      }
    } catch (error) {
      next(error);
    }
  });
};

//category management
//get category page
module.exports.categoryPage = async function (req, res, next) {
  try {
    categoryController.viewCategory().then(function (data) {
      console.log(data);
      res.render("admin/category", {
        layout: "adminLayout",
        datas: data,
        categoryExist: req.session.categoryExist,
      });
    });
    req.session.categoryExist = false;
  } catch (error) {
    next(error);
  }
};

//add category
module.exports.postCategory = (req, res, next) => {
  try {
    categoryController
      .addCategory(req.body)
      .then((data) => {
        res.redirect("/admin/category");
      })
      .catch((err) => {
        req.session.categoryExist = true;
        res.redirect("/admin/add-category");
      });
  } catch (error) {
    next(error);
  }
};

//edit category
module.exports.postEdit = (req, res, next) => {
  try {
    categoryController
      .editCategory(req.params.id, req.body)
      .then((response) => {
        if (response) {
          res.redirect("/admin/category");
        }
      });
  } catch (error) {
    next(error);
  }
};

//delete category
module.exports.postDelete = (req, res, next) => {
  try {
    let proId = req.params.id;
    categoryController.deleteCategory(proId);
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

//product management
//get product page
module.exports.viewProduct = (req, res, next) => {
  try {
    productController.getAllProduct().then((products) => {
      res.render("admin/product", {
        products,
        layout: "adminLayout",
      });
    });
  } catch (error) {
    next(error);
  }
};
module.exports.insertProduct = (req, res, next) => {
  try {
    categoryController.viewCategory().then((category) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        category,
      });
    });
  } catch (error) {
    next(error);
  }
};

//post product
module.exports.postProduct = (req, res, next) => {
  try {
    productController.addProduct(req.body, (id) => {
      if (req.files) {
        if (req.files.Image) {
          let image = req.files.Image;
          for (let i = 0; i < image.length; i++) {
            image[i].mv("./public/product/" + id + i + ".jpg", function (err) {
              if (err) {
                res.send(err);
              }
            });
          }
          res.redirect("/admin/product");
        }
      } else res.redirect("/admin/product");
    });
  } catch (error) {
    next(error);
  }
};

//edit product
module.exports.getEditPro = async (req, res, next) => {
  try {
    let product = await productController.getProductDetails(req.params.id);
    let Category = await categoryController.viewCategory();
    res.render("admin/edit-product", {
      layout: "adminLayout",
      product,
      Category,
    });
  } catch (error) {
    next(error);
  }
};
module.exports.editProduct = (req, res, next) => {
  try {
    productController
      .updateProduct(req.params.id, req.body)
      .then((response) => {
        res.redirect("/admin/product");

        if (req.files && req.files.image) {
          let id = req.params.id;
          let image = req.files.Image;
          image.mv("./public/product/" + id + ".jpg");
        }
      });
  } catch (error) {
    next(error);
  }
};

//delete product
module.exports.deleteProduct = (req, res, next) => {
  try {
    const proId = req.params.id;
    productController.delProduct(proId);
    res.redirect("/admin/product");
  } catch (error) {
    next(error);
  }
};

//order management
//get all orders
module.exports.getOrders = async (req, res, next) => {
  try {
    let ordersList = await orderController.getAllOrders();
    res.render("admin/orders", {
      layout: "adminLayout",
      ordersList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.shipped = (req, res, next) => {
  try {
    (status = "Shipped"),
      orderController.changeOrderStatus(req.params.id, status).then(() => {
        res.redirect("/admin/orders");
      });
  } catch (error) {
    next(error);
  }
};
module.exports.delivered = (req, res, next) => {
  try {
    status = "delivered";
    orderController.changeOrderStatus(req.params.id, status).then(() => {
      res.redirect("/admin/orders");
    });
  } catch (error) {
    next(error);
  }
};
module.exports.cancelled = (req, res, next) => {
  try {
    status = "Cancelled";
    orderController.changeOrderStatus(req.params.id, status).then(() => {
      res.redirect("/admin/orders");
    });
  } catch (error) {
    next(error);
  }
};

//view order products
module.exports.viewOrderProduct = async (req, res, next) => {
  try {
    let products = await orderController.getOrderProducts(req.params.id);
    res.render("admin/view-order-products", {
      products,
      layout: "adminLayout",
    });
  } catch (error) {
    next(error);
  }
};
//user management
//get all users
module.exports.viewUsers = function (req, res, next) {
  try {
    userController.getallUsers().then((users) => {
      res.render("admin/accounts", {
        userData: users,
        layout: "adminLayout",
      });
    });
  } catch (error) {
    next(error);
  }
};

//block users
module.exports.blockUser = (req, res, next) => {
  try {
    userController.blockUser(req.params.id);
    req.session.userLoggedIn = false;
    res.redirect("/admin/accounts");
  } catch (error) {
    next(error);
  }
};

//unblock users
module.exports.unblockUser = (req, res, next) => {
  try {
    userController.unBlockUser(req.params.id);
    res.redirect("/admin/accounts");
  } catch (error) {
    next(error);
  }
};

//banner management
module.exports.banner = async (req, res, next) => {
  try {
    let banners = await bannerController.getBanners();
    let categories = await categoryController.viewCategory();
    res.render("admin/banners", {
      layout: "adminLayout",
      categories,
      banners,
    });
  } catch (error) {
    next(error);
  }
};
//add banner
module.exports.postBanner = (req, res, next) => {
  try {
    bannerController
      .addBanner(req.body)
      .then((id) => {
        console.log(req.body);
        let image = req.files.Image3;
        image.mv("./public/banner/" + id + ".jpg", (err, done) => {
          if (!err) {
            res.redirect("/admin/banners");
          } else {
            res.redirect("/admin/banners");
          }
        });
      })
      .catch((err) => {
        if (err.code == 11000) {
          req.session.brandExist = true;
          res.redirect("/admin/add-brands");
        }
      });
  } catch (error) {
    next(error);
  }
};

module.exports.getEditBanner = (req, res, next) => {
  try {
    let id = req.params.id;
    bannerController.getBannerDetails(id).then((banner) => {
      res.render("admin/edit-banner", {
        banner,
        layout: "adminLayout",
      });
    });
  } catch (error) {
    next(error);
  }
};

module.exports.postEditBanner = async (req, res, next) => {
  try {
    let id = req.params.id;
    bannerController.updateBanner(id, req.body).then((response) => {
      res.redirect("/admin/banners");
      if (req.files.Image3) {
        let image = req.files.Image3;
        image.mv("public/banner/" + id + ".jpg");
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getDelete = (req, res, next) => {
  try {
    let id = req.params.id;
    bannerController.deleteBanner(id).then((response) => {
      // fs.unlinkSync("public/banner/" + id + ".jpg");
      res.redirect("/admin/banners");
    });
  } catch (error) {
    next(error);
  }
};

// category offers
module.exports.getCategoryOffers = async (req, res, next) => {
  try {
    let category = await categoryController.viewCategory();
    let catOffers = await categoryController.getAllCatOffers();
    res.render("admin/category-offers", {
      category,
      catOffers,
      catOfferExist: req.session.catOfferExist,
      layout: "adminLayout",
    });
    req.session.catOfferExist = false;
  } catch (error) {
    next(error);
  }
};
// post category offers
module.exports.postCategoryOffers = (req, res, next) => {
  try {
    categoryController
      .addCategoryOffer(req.body)
      .then((response) => {
        if (response.exist) {
          req.session.catOfferExist = true;
          res.redirect("/admin/category-offers");
        } else {
          res.redirect("/admin/category-offers");
        }
      })
      .catch((err) => {
        if (err.code == 11000) {
          req.session.catOfferExist = true;
          res.redirect("/admin/category-offers");
        }
      });
  } catch (error) {
    next(error);
  }
};

//delete category offer
module.exports.getDeleteCatOffers = (req, res, next) => {
  try {
    let id = req.params.id;
    categoryController.deleteCatOffer(id).then((response) => {
      res.redirect("/admin/category-offers");
    });
  } catch (error) {
    next(error);
  }
};

//get coupons page
module.exports.getCoupons = async (req, res, next) => {
  try {
    let coupons = await offerController.getAllCoupons();
    res.render("admin/coupons", {
      coupons,
      couponExist: req.session.couponExist,
      layout: "adminLayout",
    });
    req.session.couponExist = false;
  } catch (error) {
    next(error);
  }
};
//post coupons page
module.exports.postCoupons = async (req, res, next) => {
  try {
    offerController
      .addCoupon(req.body)
      .then(() => {
        res.redirect("/admin/coupons");
      })
      .catch((err) => {
        if (err.code == 11000) {
          req.session.couponExist = true;
          res.redirect("/admin/coupons");
        }
      });
  } catch (error) {
    next(error);
  }
};
//delete coupons
module.exports.deleteCoupon = (req, res, next) => {
  try {
    let id = req.params.id;
    offerController.deleteCoupons(id).then(() => {
      res.redirect("/admin/coupons");
    });
  } catch (error) {
    next(error);
  }
};

//get reports
module.exports.getReports = async (req, res, next) => {
  try {
    let profit = await productHelper.getTotalProfit();
    orderController.monthlyReport().then((data) => {
      res.render("admin/report", {
        admin: true,
        report: true,
        data,
      });
    });
  } catch (error) {
    next(error);
  }
};
//admin logout
module.exports.logout = (req, res, next) => {
  req.session.admin = null;
  res.redirect("/admin/login");
};
