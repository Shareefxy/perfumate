const { response } = require("express");
const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const { asyncWrapper } = require("../middleware/asyncWrapper");

const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};
//get homepage
router.get("/", verifyAdminLogin, adminController.home);

//login
router.get("/login", adminController.getLogin);
router.post("/login", adminController.postLogin);

//category management
router.get("/category", verifyAdminLogin, adminController.categoryPage);
router.post("/add-category", adminController.postCategory);
router.post("/edit/:id", adminController.postEdit);
router.get("/delete/:id", adminController.postDelete);

//product management
router.get("/product", verifyAdminLogin, adminController.viewProduct);
router.get("/add-product", adminController.insertProduct);
router.get("/edit-product/:id", adminController.getEditPro);
router.post("/edit-product/:id", verifyAdminLogin, adminController.editProduct);
router.post("/add-product", adminController.postProduct);
router.get("/delete-product/:id", adminController.deleteProduct);

//banner management
router.get("/banners", verifyAdminLogin, adminController.banner);
router.post("/add-banner", adminController.postBanner);
router.get("/edit-banner/:id", verifyAdminLogin, adminController.getEditBanner);
router.post(
  "/edit-banner/:id",
  verifyAdminLogin,
  adminController.postEditBanner
);
router.get("/delete-banner/:id", verifyAdminLogin, adminController.getDelete);
//order management
//get order page
router.get("/orders", verifyAdminLogin, adminController.getOrders);

//Order Status changing----
router.get("/shipped/:id", verifyAdminLogin, adminController.shipped);
router.get("/delivered/:id", verifyAdminLogin, adminController.delivered);
router.get("/cancelled/:id", verifyAdminLogin, adminController.cancelled);

router.get(
  "/view-order-products/:id",
  verifyAdminLogin,
  adminController.viewOrderProduct
);
//user management
router.get("/accounts", verifyAdminLogin, adminController.viewUsers);
//block user
router.get("/block-user/:id", adminController.blockUser);
//unblock user
router.get("/unblock-user/:id", adminController.unblockUser);
//Offer Management Section....
//Category offers
router.get(
  "/category-offers",
  verifyAdminLogin,
  adminController.getCategoryOffers
);
router.post(
  "/category-offers",
  verifyAdminLogin,
  adminController.postCategoryOffers
);
router.get(
  "/delete-catOffer/:id",
  verifyAdminLogin,
  adminController.getDeleteCatOffers
);

//coupon section
router.get("/coupons", verifyAdminLogin, adminController.getCoupons);
router.post("/add-coupon", verifyAdminLogin, adminController.postCoupons);
router.get(
  "/delete-coupon/:id",
  verifyAdminLogin,
  adminController.deleteCoupon
);
//sales reports
router.get("/report", verifyAdminLogin, adminController.getReports);
//logout admin
router.get("/logout", adminController.logout);

module.exports = router;
