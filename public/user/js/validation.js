// $(document).ready(function () {
//     $('#user-signup').validate({
//         rules: {
//             name: {
//                 required: true,
//                 minlength: 4,
//                 maxlength: 20
//             },
//             mobilenumber: {
//                 required: true,
//                 number: true,
//                 minlength: 10,
//                 maxlength: 10,
//             },
//             email: {
//                 required: true,
//                 email: true
//             },
//             password: {
//                 minlength: 5,
//                 maxlength:20,
//                 required: true,
//             },
//             repassword: {
//                 minlength: 5,
//                 maxlength:20
//             }
//         },
//         messages: {
//             name: {
//                 required: "Enter your firstname",
//                 minlength: "Enter at least 4 characters",
//                 maxlength: "Enter maximum 20 caharacters"

//             },
//             mobilenumber: {
//                 required: "Enter your mobile number",
//                 number: "Enter a valid number",
//                 minlength: "Enter 10 numbers"
//             },
//             email: {
//                 required: "Enter your Email",
//                 email: "Enter a valid Email"
//             },
//             password: {
//                 required: "Enter a password",
//                 minlength: "Password must be in 5-20 characters"
//             },
//             repassword: {
//                 minlength: 5,
//                 maxlength:20
//             }
//         }
//     })
// })

// $(document).ready(function () {
//     $('#setPassword').validate({
//         rules: {
//             password1: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20

//             },
//             password2: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20,

//             }
//         }
//     })
// })

// $(document).ready(function () {
//     $('#otp').validate({
//         rules: {
//             otp:{
//                 required:true,
//                 minlength:6,
//                 maxlength:6
//             }
//         }
//     })
// })

// $(document).ready(function () {
//     $('#loginOtp').validate({
//         rules: {
//             mobileNo:{
//                 required:true,
//                 minlength:10,
//                 maxlength:10
//             }
//         }
//     })
// })

// jQuery(function ($) {

//     $(".sidebar-dropdown > a").click(function () {
//         $(".sidebar-submenu").slideUp(200);
//         if (
//             $(this)
//                 .parent()
//                 .hasClass("active")
//         ) {
//             $(".sidebar-dropdown").removeClass("active");
//             $(this)
//                 .parent()
//                 .removeClass("active");
//         } else {
//             $(".sidebar-dropdown").removeClass("active");
//             $(this)
//                 .next(".sidebar-submenu")
//                 .slideDown(200);
//             $(this)
//                 .parent()
//                 .addClass("active");
//         }
//     });

//     $("#close-sidebar").click(function () {
//         $(".page-wrapper").removeClass("toggled");
//     });
//     $("#show-sidebar").click(function () {
//         $(".page-wrapper").addClass("toggled");
//     });
// });

// $(document).ready(function () {
//     $('#address-form').validate({
//         rules: {
//             FirstName: {
//                 required: true,
//                 minlength: 4,
//                 maxlength: 20

//             },
//             LastName: {
//                 required: true,
//                 minlength: 1,
//                 maxlength: 15

//             },
//             House: {
//                 required: true,
//                 minlength: 10,
//                 maxlength: 50
//             },
//             Street: {
//                 required: true,
//                 minlength: 5
//             },
//             Town: {
//                 required: true,
//                 minlength: 5
//             },
//             PIN: {
//                 required: true,
//                 number: true,
//                 minlength: 6,
//                 maxlength: 6
//             },
//             Mobile: {
//                 required: true,
//                 number: true,
//                 minlength: 10,
//                 maxlength: 10,
//             },
//             Email: {
//                 required: true,
//                 email: true
//             }
//         },
//     })
// })

// $(document).ready(function () {
//     $('#change-password').validate({
//         rules: {
//             password1: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20

//             },
//             password2: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20,
//             },
//             current: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20
//             }
//         }
//     })
// })
// $(document).ready(function () {
//     $('#edit-profile').validate({
//         rules: {
//             firstname: {
//                 required: true,
//                 minlength: 5,
//                 maxlength: 20

//             },
//             lastname: {
//                 required: true,
//                 minlength: 1,
//                 maxlength: 20,
//             },
//             mobile: {
//                 required: true,
//                 number: true,
//                 minlength: 10,
//                 maxlength: 10
//             },
//             email: {
//                 email: true,
//                 required: true
//             },
//         },
//         submitHandler: function submitFormProfile(form) {
//             console.log(form)
//             swal({
//                 title: "Are you sure?",
//                 text: "This form will be submitted",
//                 icon: "warning",
//                 buttons: true,
//                 dangerMode: true,
//             }).then((isOkay) => {
//                 if (isOkay) {
//                     form.submit();
//                 }
//             });
//             return false;
//         }
//     })
// })

// //User Login

// $(document).ready(function () {
//     $('#userLogin').validate({
//         rules: {
//             mobileNo: {
//                 required: true,
//                 number: true,
//                 minlength: 10,
//                 maxlength: 10,
//             },
//             password: {
//                 minlength: 5,
//                 required: true,
//                 maxlength: 20
//             },
//             otp: {

//                 required: true,
//                 number: true
//             }



//         },
//         messages: {
//             mobileNo: {
//                 required: "Enter a mobile number",
//                 number: "Enter a valid mobile number",
//                 minlength: "Enter 10 numbers",
//                 maxlength: "Enter without country code"
//             },
//             password: {

//                 required: "Enter a password",
//                 minlength: "Password must be in 4-20 characters",
//                 maxlength: "Password must be in 4-20 characters"
//             },
//             otp: {
//                 required: "Enter a OTP",
//                 number: "Enter a valid OTP"

//             }
//         }
//     })

// })