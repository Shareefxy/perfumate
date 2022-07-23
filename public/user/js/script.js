function addToCart(proId) {
  console.log(proId);
  $.ajax({
    url: "/adCart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
      })
      Toast.fire({
        icon: 'success',
        title: 'item added to the cart'
    })
      }else if (response.exist) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'Item has already added!'
        })
    } else {
        location.replace('/login')
    }

}
})
}
  

function deleteCartPro(cartId,proId){
  alert(proId)
  $.ajax({
    
      url:'/remove-cart',
      data:{
          cart: cartId,
          product: proId,
      },
      method:"post",
      success:(response)=>{
          if(response.removeProducts){
              alert('item-removed')
              location.reload()
          }else{
            document.getElementById(proId).innerHTML=response.removeProducts
          }
      }
  })
}

function addToWishList(proId){
  
  $.ajax({
    url:"/adWishlist/"+proId,
    method: "get",
    success :(response)=>{
      if(response.status){
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 100,
          timerProgressBar: true,
          didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
      })
      Toast.fire({
          icon: 'success',
          title: 'item added to the wishlist'
      })
      }else {
        
        location.replace('/login')
        Toast.fire({
          icon:'danger',
          title:'item removed from wishlist',
        })
       
    }

    }
  })
}

function deleteWish(wishId, proId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "are you you sure to remove the item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/delete-wishlist-product',
                    data: {
                        wishlist: wishId,
                        product: proId
                    },
                    method: 'post',
                    success: (response) => {
                        if (response.removeProduct) {
                        } else {
                            Swal.fire()
                            .then((resp) => {
                                if (resp) {
                                    location.reload()
                                }
                            })
                        }
                    }
                })
            }
        })
    }
    //Delete address

    function deleteAddress(event) {
        event.preventDefault();
        var link = event.currentTarget.href;
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this address ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Deleted!',
                    'Address deleted.',
                    'success'
                )
                window.location = link;
            }
            else {
                return false;
            }
        })
    }

