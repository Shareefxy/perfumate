var express = require("express");
var router = express.Router();
var userController = require("../controller/userController");
const { asyncWrapper } = require("../middleware/asyncWrapper");

const verifyUserLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.blockErr = true;
    req.session.user = null;
    req.session.userLoggedIn = false;
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", userController.index);

router
  .route("/login")
  .get(userController.getLogin)
  .post(userController.postLogin);

router
  .route("/signup")
  .get(userController.getSignup)
  .post(userController.postSignup);

router
  .route("/forgot-password")
  .get(userController.forgotPassword)
  .post(userController.postForgotPassword);

router.post("/otp-check", userController.otpCheck);

router.get("/cart", verifyUserLogin, userController.cart);

router.get("/adCart/:id", verifyUserLogin, userController.addCart);

router.post("/remove-cart", userController.removeCartProduct);

router.get("/wishlist", verifyUserLogin, userController.wishlist);

router.get("/adWishlist/:id", verifyUserLogin, userController.addWishlist);

router.post(
  "/delete-wishlist-product",
  verifyUserLogin,
  userController.removeWishlistProduct
);

router.post("/otp", userController.postOtp);

router.get("/view-products", userController.viewProductPage);

router.get("/product/:id([0-9a-fA-F]{24})", userController.viewSingleProduct);

router.get("/buyNow/:id", verifyUserLogin, userController.buyNow);

router.post("/buyNow", userController.postBuyNow);

router.post("/verify-buyNowPayment", userController.verifyBuyNowPayment);

router.post("/products/filter", userController.filterProduct);

router.post("/change-product-quantity", userController.changeProQty);

router
  .route("/checkout")
  .get(verifyUserLogin, userController.getTotal)
  .post(verifyUserLogin, userController.postCheckout);

router.get("/confirmation/:id", verifyUserLogin, userController.confirmation);

//invoice
router.get("/invoice/:oId", verifyUserLogin, userController.invoice);

router.get("/orders", verifyUserLogin, userController.orderList);

router.post("/verify-payment", userController.verifyPayment);

router.get("/profile", verifyUserLogin, userController.myProfile);

router.get("/my-orders", verifyUserLogin, userController.myOrders);

router.get("/my-wishlist", verifyUserLogin, userController.myWishlist);

router.post("/edit-profile", verifyUserLogin, userController.editProfile);

router
  .route("/new-address")
  .get(verifyUserLogin, userController.Address)
  .post(userController.addNewAddressProfile);

router
  .get("/add-new-address")
  .get(verifyUserLogin, userController.addAddress)
  .post(userController.addAddress1);

router
  .get("/edit-address/:id")
  .get(verifyUserLogin, userController.editAddress)
  .post(userController.postEditAddress);

router.get(
  "/delete-address/:id",
  verifyUserLogin,
  userController.deleteAddress
);

router.post("/couponApply", userController.postApplyCoupon);

router.post("/search-product", userController.searchProduct);

router.get("/contact", userController.contact);

router.get("/logout", userController.logout);

module.exports = router;
