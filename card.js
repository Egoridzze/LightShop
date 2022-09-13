let cart = {};
document.querySelectorAll('.add-to-cart').forEach(function(element) {
    element.onclick = addToCart;
});
if (localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    ajaxGetGoodsInfo()
}

function addToCart() {
    let goodsId = this.dataset.goods_id;
    if (cart[goodsId]) { /*id товара*/
        cart[goodsId]++;
    } else {
        cart[goodsId] = 1;
    }
    console.log(cart);
    ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() { /*frtch запрос чтоб запость товары в карзину называется какого то хрена ajax*/
    updateLocalStorageCart()
    fetch('/get-goods-info', {
            method: 'POST',
            body: JSON.stringify({ key: Object.keys(cart) }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.text(); /*response.text помогает после положительного ответа полить body*/
        })
        .then(function(body) {
            console.log(body); /*описания товаров попадающих в карзину*/
            showCart(JSON.parse(body));
        })
}

function showCart(data) { /*карта которая видна в бокавой панели*/
    let out = '<table class="table table-striped table-cart"><tbody>';
    let total = 0;
    for (let key in cart) {
        out += `<tr><td colspan="4"><a href="/goods?id=${key}">${data[key]['name']}</a></tr>`;
        out += `<tr><td><i class="far fa-minus-square cart-minus" data-goods_id="${key}"></i></td>`; /*минус в меню для удаления товара*/
        out += `<td>${cart[key]}</td>`; /*id товара*/
        out += `<td><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`; /*плюс в меню для добавления товара*/
        out += `<td>${data[key]['cost']*cart[key] }  </td>`;
        out += '</tr>';
        total += cart[key] * data[key]['cost']; /*конечная сумма в карзине*/
    }
    out += `<tr><td colspan="3">Total: </td><td>${(total)} </td></tr>`;
    out += `</tbody></table>`;
    document.querySelector('#cart-nav').innerHTML = out;
    document.querySelectorAll('.cart-minus').forEach(function(element) {
        element.onclick = cartMinus;
    }); /*навешивание обработчика на кнопку минуса с ипоследубщей передачей финкции cartMinus*/
    document.querySelectorAll('.cart-plus').forEach(function(element) {
        element.onclick = cartPlus;
    }); /*навешивание обработчика на кнопку плюса с ипоследубщей передачей финкции cartPlus*/
}

function cartPlus() {
    let goodsId = this.dataset.goods_id;
    cart[goodsId]++;
    ajaxGetGoodsInfo();
}

function cartMinus() {
    let goodsId = this.dataset.goods_id;
    if (cart[goodsId] - 1 > 0) {
        cart[goodsId]--;
    } else {
        delete(cart[goodsId]);
    }
    ajaxGetGoodsInfo();
}

function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
}