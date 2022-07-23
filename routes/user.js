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

router.get("/login", userController.getLogin);

router.get("/signup", userController.getSignup);

router.post("/signup", userController.postSignup);

router.post("/login", userController.postLogin);

//forgot password -number submission
router.get("/forgot-password", userController.forgotPassword);

router.post("/forgot-password", userController.postForgotPassword);

router.post("/otp-check", userController.otpCheck);

// router.get("/set-password",userController.getSetPassword)

router.post("/set-password", userController.setPassword);

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
//buy now management

router.get("/product/:id([0-9a-fA-F]{24})", userController.viewSingleProduct);

router.get("/buyNow/:id", verifyUserLogin, userController.buyNow);
router.post("/buyNow", userController.postBuyNow);
router.post("/verify-buyNowPayment", userController.verifyBuyNowPayment);
router.post("/products/filter", userController.filterProduct);

router.post("/change-product-quantity", userController.changeProQty);

router.get("/checkout", verifyUserLogin, userController.getTotal);

router.post("/checkout", verifyUserLogin, userController.postCheckout);

router.get("/confirmation/:id", verifyUserLogin, userController.confirmation);

//invoice
router.get("/invoice/:oId", verifyUserLogin, userController.invoice);
router.get("/orders", verifyUserLogin, userController.orderList);

router.post("/verify-payment", userController.verifyPayment);


router.get("/profile", verifyUserLogin, userController.myProfile);

router.get("/my-orders", verifyUserLogin, userController.myOrders);

router.post("/edit-profile", verifyUserLogin, userController.editProfile);

router.get("/new-address", verifyUserLogin, userController.Address);

router.post("/new-address", userController.addNewAddressProfile);

router.get("/add-new-address", verifyUserLogin, userController.addAddress);

router.post("/add-new-address", userController.addAddress1);

router.get("/edit-address/:id", verifyUserLogin, userController.editAddress);

router.post("/edit-address/:id", userController.postEditAddress);

router.get(
  "/delete-address/:id",
  verifyUserLogin,
  userController.deleteAddress
);

router.post("/couponApply", userController.postApplyCoupon);
router.post("/search-product", userController.searchProduct);
router.get("/contact",userController.contact)
router.get("/logout", userController.logout);

module.exports = router;
