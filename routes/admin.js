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
router
  .route("/login")
  .get(adminController.getLogin)
  .post(adminController.postLogin);

//category management
router.get("/category", verifyAdminLogin, adminController.categoryPage);
router.post("/add-category", adminController.postCategory);
router.post("/edit/:id", adminController.postEdit);
router.get("/delete/:id", adminController.postDelete);

//product management
router.get("/product", verifyAdminLogin, adminController.viewProduct);
router
  .route("/add-product")
  .get(adminController.insertProduct)
  .post(adminController.postProduct);
router
  .route("/edit-product/:id")
  .get(adminController.getEditPro)
  .post(verifyAdminLogin, adminController.editProduct);
router.get("/delete-product/:id", adminController.deleteProduct);

//banner management
router.get("/banners", verifyAdminLogin, adminController.banner);
router.post("/add-banner", adminController.postBanner);
router
  .route("/edit-banner/:id")
  .get(verifyAdminLogin, adminController.getEditBanner)
  .post(verifyAdminLogin, adminController.postEditBanner);
router.get("/delete-banner/:id", verifyAdminLogin, adminController.getDelete);

//order management
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
router
  .route("/category-offers")
  .get(verifyAdminLogin, adminController.getCategoryOffers)
  .post(verifyAdminLogin, adminController.postCategoryOffers);

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
