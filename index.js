/**
 * Created by M-Rayees on 11/8/2016.
 */

var request = require('request');
request.debug = true;
require('request-debug')(request);

function ShipRocket(key) {
    this.key = "&key=" + key;
    this.version = "&version=2";
    this.endPoints = {
        base: "http://reduxpress.kartrocket.co/",
        common: "index.php?route=feed/web_api/",
        category: "category",
        categories: "categories",
        addProduct: "addproduct",
        product: "product",
        products: "products",
        order: 'orders',
        addOrder: "addorder",
        updateOrder: "updateorders"
    };
    this.getOrderFields = function () {
        return {
            import_order_id: "",
            firstname: "",
            lastname: "",
            email: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            postcode: "",
            state: "",
            country_code: "",
            mobile: "",
            payment_method: "",
            payment_code: "",
            shipping_method: "",
            shipping_code: "",
            order_status_id: "",
            products: [],
            totals: {},
            weight: "",
            weight_unit: "",
            comment: "",
            total: ""
        };
    };
    this.getProductFields = function () {
        return {
            name: "",
            sku: "",
            quantity: "",
            price: "",
            total: ""
        };
    };
    this.getTotalFields = function () {
        return {
            handling: "",
            low_order_fee: "",
            sub_total: "",
            discount: "",
            total: ""
        };
    };

    this.getBase = function () {
        return this.endPoints.base + this.endPoints.common;
    };
    this.categoryUrl = function () {
        return this.getBase() + this.endPoints.category + this.key;
    };

    this.categoriesUrl = function () {
        return this.getBase() + this.endPoints.category + this.key;
    };

    this.orderUrl = function () {
        return this.getBase() + this.endPoints.order + this.key;
    };

    this.productUrl = function () {
        return this.getBase() + this.endPoints.product + this.key;
    };

    this.productsUrl = function () {
        return this.getBase() + this.endPoints.products + this.key;
    };

    this.addOrderUrl = function () {
        return this.getBase() + this.endPoints.addOrder + this.version + this.key;
    };

    this.updateOrderUrl = function () {
        return this.getBase() + this.endPoints.updateOrder + this.key;
    };


}


ShipRocket.prototype = {
    _caller: function (url, method, callback, data) {
        return new Promise(function (resolve, reject) {
            request({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data,
                json: true
            }, function (error, result, body) {
                if (error) {
                    if (typeof callback === "function")
                        callback(error);
                    reject(error);
                }
                if (result.statusCode === 200 || result.statusCode === 201) {
                    if (typeof callback === "function")
                        callback(null, result, body);
                    resolve([result, body])
                }
            });
        });
    },
    getCategory: function (id, callback) {
        if (!id)
            throw new Error("Category Id Required");
        var url = this.categoryUrl() + '&id=' + id;
        return this._caller(url, "GET", callback);
    },
    getCategories: function (parent, level, callback) {
        var url = this.categoriesUrl();
        if (parent)
            url += '&parent=' + parent;
        if (level)
            url += '&level=' + parent;
        return this._caller(url, "GET", callback);
    },
    getProduct: function (id, sku, callback) {
        var url = this.categoryUrl();
        if (id)
            url += '&id=' + id;
        if (sku)
            url += '&sku=' + sku;
        return this._caller(url, "GET", callback);

    },
    getProducts: function (category, page, callback) {
        var url = this.categoryUrl();
        if (category)
            url += '&category=' + category;
        if (page)
            url += '&page=' + page;
        return this._caller(url, "GET", callback);

    },
    getOrders: function (page, callback) {
        var url = this.orderUrl();
        if (page)
            url += '&page=' + page;
        return this._caller(url, "GET", callback);
    },
    getOrderById: function (id, callback) {
        var url = this.orderUrl();
        if (!id)
            throw new Error("Order Id Required");
        url += '&order_id=' + id;
        return this._caller(url, "GET", callback);
    },
    getOrdersByDate: function (from, to, call) {
        var url = this.orderUrl();
        if (!(from && to))
            throw new Error("Date(s) are missing");

        url += '&date_from=' + from + '*date_to' + to;
        return this._caller(url, "GET", callback);
    },
    generateOrder: function (data) {
        var url = this.addOrderUrl();
        return this._caller(url, "POST", null, data);
    },

    updateOrder: function (id, status, company, awbNumber, callback) {
        var url = this.updateOrderUrl();
        var err = [];
        var data = {
            "id": id,
            "status": status,
            "company": company
        };
        for (var prop in data) {
            if (!data[prop]) {
                var msg = prop + "Is Missing";
                err.push(msg);
            }
        }

        if (err.length)
            throw new Error("Error");

        if (awbNumber)
            url += "&awb_number=" + awbNumber;

        url += "&order_id=" + id + "&order_status_id" + status + "&courier_company=" + company;
        return this._caller(url, "GET", callback);
    }
};

module.exports = ShipRocket;
