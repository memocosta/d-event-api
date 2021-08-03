/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


    //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': {
        view: 'pages/homepage'
    },

    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/

    //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
    //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
    //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

    // GENERAL PART
    'get /project-types': 'GeneralController.projectTypes',
    'get /project-categories': 'GeneralController.projectCategories',
    'get /countries': 'GeneralController.getCountries',
    'get /report-company/:company': 'GeneralController.report_company',
    'get /report-ticket/:ticket': 'GeneralController.report_ticket',
    'get /send-email': 'GeneralController.send_email',
    'post /contact-support': 'GeneralController.contact_support',
    'post /upload-img': 'GeneralController.uploadImg',
    'get /viva/:type': 'GeneralController.viva',
    // AUTHENTICATION PART
    'get /me': 'AuthController.verifyToken',
    'get /logout': 'AuthController.logout',
    'post /signup/user': 'AuthController.register',
    'post /signup/consumer': 'AuthController.registerConsumer',
    'post /facebook/signup/consumer': 'AuthController.registerFB',
    'post /facebook/login/user': 'AuthController.loginFB',
    'post /login/user': 'AuthController.login',
    'post /forget/user': 'AuthController.forget',
    'post /reset/user': 'AuthController.reset',
    'post /edit/user': 'AuthController.edit',
    'post /favorite-categories': 'AuthController.favorite_categories',
    'post /find/user': 'AuthController.find_user',
    'post /delete/user': 'AuthController.delete_my_account',
    'post /cancel/delete/user': 'AuthController.cancel_delete_my_account',
    // PROJECT PART
    'get /projects': 'ProjectController.index',
    'get /projects/:page': 'ProjectController.index',
    'get /my-projects': 'ProjectController.myProjects',
    'get /project/:id': 'ProjectController.getById',
    'post /project/create': 'ProjectController.create',
    'post /project/edit/:id': 'ProjectController.edit',
    'get /project/delete/:id': 'ProjectController.delete',
    'post /projects/search': 'ProjectController.search',
    'post /projects/search/:page': 'ProjectController.search',
    // FAVORITE PART
    'get /favorites': 'FavoriteController.index',
    'post /favorite/create': 'FavoriteController.create',
    // TICKET PART
    'get /project/:id/tickets': 'TicketController.index',
    'get /project/:id/tickets/pro': 'TicketController.indexPro',
    'get /ticket/:id': 'TicketController.getById',
    'get /my-tickets/:type': 'TicketController.myTickets',
    'post /ticket/transfer': 'TicketController.transfer',
    'post /ticket/refund': 'TicketController.refund',
    'post /ticket/confirm-refund': 'TicketController.confirm_refund',
    'post /ticket/check': 'TicketController.check',
    'post /ticket/access': 'TicketController.access',
    'post /project/:id/ticket/create': 'TicketController.create',
    'post /ticket/edit/:id': 'TicketController.edit',
    'get /ticket/delete/:id': 'TicketController.delete',
    'get /ticket/hide/:id': 'TicketController.hide',
    // ITEM PART
    'get /project/:id/items': 'ItemController.index',
    'get /ticket/:id/items': 'ItemController.indexOfTicket',
    'get /my-items': 'ItemController.myItems',
    'get /item/:id': 'ItemController.getById',
    'post /project/:id/item/create': 'ItemController.create',
    'post /item/edit/:id': 'ItemController.edit',
    'get /item/delete/:id': 'ItemController.delete',
    // CART PART
    'post /cart/add-tickets': 'CartController.addTickets',
    'post /cart/add-items': 'CartController.addItems',
    'post /cart/add-one-ticket': 'CartController.addTickets',
    'post /cart/add-one-item': 'CartController.addItems',
    'post /cart/remove-one-ticket': 'CartController.addTickets',
    'post /cart/remove-one-item': 'CartController.addItems',
    'get /cart/me': 'CartController.index',
    'get /cart/remove-ticket/:id': 'CartController.removeTicket',
    'get /cart/remove-item/:id': 'CartController.removeItem',
    // POS PART
    'get /project/:id/pos': 'PosController.index',
    'get /pos/:id': 'PosController.getById',
    'post /project/:id/Pos/create': 'PosController.create',
    'post /pos/edit/:id': 'PosController.edit',
    'get /pos/delete/:id': 'PosController.delete',
    'post /pos/:id/makeOrder': 'OrderController.createPos',
    'post /pos/:id/createPosManagerOrder': 'OrderController.createPosManager',
    'post /pos/qr': 'OrderController.createPosQR',
    'post /pos/checkQR': 'PosController.check',
    // ORDER PART
    'get /project/:id/orders': 'OrderController.index',
    'get /project/:id/orders/:page': 'OrderController.index',
    'get /project/:id/orders/refund': 'OrderController.myRefund',
    'get /project/:id/revenu-overview': 'OrderController.overview',
    'get /project/:id/sales-per-ticket/week': 'OrderController.ticketSalesPerWeek',
    'get /project/:id/sales-per-ticket/month': 'OrderController.ticketSalesPerMonth',
    'get /project/:id/sales-per-ticket/year': 'OrderController.ticketSalesPerYear',
    'get /project/:id/sales-per-item': 'OrderController.itemSales',
    'get /project/:id/sales-per-gender': 'OrderController.genderSales',
    'get /project/:id/sales-per-country': 'OrderController.countrySales',
    'get /project/:id/sales-per-pos/:pos': 'OrderController.posSales',
    'get /project/:id/billing-center/:year': 'OrderController.billingCenter',
    'get /my-orders': 'OrderController.myOrders',
    'get /my-orders/:page': 'OrderController.myOrders',
    'get /order/:id': 'OrderController.getById',
    'get /order/create': 'OrderController.create',
    'get /order/createByWallet': 'OrderController.createByWallet',
    'get /order/delete/:id': 'OrderController.delete',
    'get /order/deleteManager/:id': 'OrderController.deleteManager',
    'get /order/assert/:id': 'OrderController.assert',
    'get /order/assertManager/:id': 'OrderController.assertManager',
    // WALLET PART
    'get /wallet': 'WalletController.index',
    'get /wallet/chart': 'WalletController.chart',
    'get /wallet/assert/:id/:type': 'WalletController.assert',
    'post /wallet': 'WalletController.add',
    'post /wallet/send': 'WalletController.send',
    'post /wallet/receive': 'WalletController.receive',
    'post /wallet/qr/scan': 'WalletController.scan',
    'post /wallet/withdraw': 'WalletController.withdraw',
    // NOTIFICATIONS PART
    'get /notifications': 'NotificationController.index',
    'get /notifications/read': 'NotificationController.readNotifcations',
    'get /notifications/payment/read': 'NotificationController.readPaymentNotifcations',
    'post /notification/send': 'NotificationController.create',
    'get /notification/delete/:id': 'NotificationController.delete',
    'get /notification/read/:id': 'NotificationController.read',



    //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


    //  ╔╦╗╦╔═╗╔═╗
    //  ║║║║╚═╗║
    //  ╩ ╩╩╚═╝╚═╝


};