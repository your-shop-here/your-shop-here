const server = require('*/server');

server.get('Show', (req, res, next) => {
    // Render the Page Designer page and pass the data
    res.page('wishlist');
    return next();
});

server.use('Add', (req, res, next) => {
    const ProductListMgr = require('dw/customer/ProductListMgr');
    const ProductList = require('dw/customer/ProductList');
    const ProductMgr = require('dw/catalog/ProductMgr');
    const Transaction = require('dw/system/Transaction');

    const productId = request.httpParameterMap.pid.stringValue;
    let wishlist = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST).toArray().pop();
    let product;
    if (productId) {
        product = ProductMgr.getProduct(productId);
        Transaction.wrap(() => {
            if (!wishlist) {
                wishlist = ProductListMgr.createProductList(customer, ProductList.TYPE_WISH_LIST);
            }
            if (product) {
                wishlist.createProductItem(product);
            }
            session.privacy.wishlistCount = wishlist.productItems.length;
        });
    }
    if (req.httpParameterMap.hx.stringValue === 'wishlist-modal') {
        res.renderPartial('wishlist/addtowishlist', { object: { wishlist, product } });
    } else {
        res.redirect('Wishlist-Show');
    }
    return next();
});

server.use('Remove', (req, res, next) => {
    const ProductListMgr = require('dw/customer/ProductListMgr');
    const ProductList = require('dw/customer/ProductList');
    const Transaction = require('dw/system/Transaction');

    const productId = request.httpParameterMap.pid.stringValue;
    const wishlist = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST).toArray().pop();
    Transaction.wrap(() => {
        if (wishlist) {
            const productItem = wishlist.getProductItems().toArray().find((item) => item.getProductID() === productId);
            if (productItem) {
                wishlist.removeItem(productItem);
            }
            session.privacy.wishlistCount = wishlist.productItems.length;
        }
    });
    res.redirect('Wishlist-Show');
    return next();
});

module.exports = server.exports();
