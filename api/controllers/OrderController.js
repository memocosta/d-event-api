/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    index: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    if ((!project_id || project_id < 1)) {
                        return ResponseService.ErrorResponse(res, 'please determine the project id');
                    }
                    let selectedProject = await Project.findOne({ where: { id: project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }

                    let page = req.param('page');
                    let filterOBJ = { where: { project_id: project_id } };
                    if ((page && page != 'false' && page > 0)) {
                        filterOBJ['offset'] = (page - 1) * 10;
                        filterOBJ['limit'] = 10;
                    }
                    filterOBJ['include'] = [{
                        model: Pos,
                        as: 'pos',
                    }];
                    let selectedOrders = await Order.findAll(filterOBJ);
                    let orders = [];
                    for (let i = 0; i < selectedOrders.length; i++) {
                        let order = selectedOrders[i].toJSON();
                        let filterx = { where: {} };
                        filterx['include'] = [{
                            model: OrderTickets,
                            as: 'orderTickets',
                            where: { order_id: order.id }
                        }];
                        let selectedTickets = await Ticket.findAll(filterx);

                        let filtery = { where: {} };
                        filtery['include'] = [{
                            model: OrderItems,
                            as: 'orderItems',
                            where: { order_id: order.id }
                        }];
                        let selectedItems = await Item.findAll(filtery);

                        order.tickets = selectedTickets;
                        order.items = selectedItems;
                        orders.push(order);
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting all orders', orders);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    myOrders: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let page = req.param('page');
                    let filterOBJ = { where: { owner_id: decode.id } };
                    if ((page && page != 'false' && page > 0)) {
                        filterOBJ['offset'] = (page - 1) * 10;
                        filterOBJ['limit'] = 10;
                    }
                    filterOBJ['include'] = [{
                        model: Pos,
                        as: 'pos',
                    }];
                    let selectedOrders = await Order.findAll(filterOBJ);
                    let orders = [];
                    for (let i = 0; i < selectedOrders.length; i++) {
                        let order = selectedOrders[i].toJSON();
                        let filterx = { where: {} };
                        filterx['include'] = [{
                            model: OrderTickets,
                            as: 'orderTickets',
                            where: { order_id: order.id }
                        }];
                        let selectedTickets = await Ticket.findAll(filterx);

                        let filtery = { where: {} };
                        filtery['include'] = [{
                            model: OrderItems,
                            as: 'orderItems',
                            where: { order_id: order.id }
                        }];
                        let selectedItems = await Item.findAll(filtery);

                        order.tickets = selectedTickets;
                        order.items = selectedItems;
                        orders.push(order);
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting all orders', orders);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    myRefund: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    if ((!project_id || project_id < 1)) {
                        return ResponseService.ErrorResponse(res, 'please determine the project id');
                    }
                    let selectedProject = await Project.findOne({ where: { id: project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }

                    let filterOBJ = {
                        where: {
                            is_refunded: {
                                [Sequelize.Op.in]: [1, 2]
                            }
                        }
                    };
                    filterOBJ['include'] = [{
                            model: Order,
                            as: 'order',
                            where: { project_id: project_id }
                        },
                        {
                            model: User,
                            as: 'user'
                        },
                    ];
                    let selectedOrders = await OrderTickets.findAll(filterOBJ);
                    return ResponseService.SuccessResponse(res, 'success for getting all orders', selectedOrders);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    getById: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let filterOBJ = { where: { id: id } };
                    filterOBJ['include'] = [{
                        model: Pos,
                        as: 'pos',
                    }];
                    let selectedOrder = await Order.findOne(filterOBJ);
                    let order = selectedOrder.toJSON();

                    let filterx = { where: {} };
                    filterx['include'] = [{
                        model: OrderTickets,
                        as: 'orderTickets',
                        where: { order_id: id }
                    }];
                    let selectedTickets = await Ticket.findAll(filterx);

                    let filtery = { where: {} };
                    filtery['include'] = [{
                        model: OrderItems,
                        as: 'orderItems',
                        where: { order_id: id }
                    }];
                    let selectedItems = await Item.findAll(filtery);

                    order.tickets = selectedTickets;
                    order.items = selectedItems;
                    return ResponseService.SuccessResponse(res, 'success for getting order', order);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    create: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    var tickets_quantity = 0;
                    var items_quantity = 0;
                    var price = 0;
                    var deserved = 0;
                    var project_id = 0;
                    if (myCart) {
                        var AuthUser = await User.findOne({ where: { id: decode.id } });
                        var country = (AuthUser.address && AuthUser.address.country) ? AuthUser.address.country : 'Belgium';
                        let OrderParam = {
                            owner_id: decode.id,
                            status: 'online',
                            type: 'VISA',
                            country: country
                        }
                        var CreatedOrder = await Order.create(OrderParam);
                        var tickets = myCart.tickets;
                        if (tickets.length > 0) {
                            project_id = tickets[0].project_id;
                            for (let i = 0; i < tickets.length; i++) {
                                var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                                if (tickets[i].CartTickets.quantity > oneTicket.current_quantity) {
                                    let destroyedOrder = await Order.findOne({ where: { id: CreatedOrder.id } });
                                    destroyedOrder.destroy();
                                    return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                                }
                                tickets_quantity += tickets[i].CartTickets.quantity;
                                for (let j = 0; j < tickets[i].CartTickets.quantity; j++) {
                                    price += tickets[i].price;
                                    let minus = 0;
                                    if (tickets[i].price > 5) {
                                        minus += 0.98;
                                    }
                                    if (tickets[i].vat_rate > 0) {
                                        minus += (tickets[i].vat_rate / 100) * tickets[i].price;
                                    }
                                    deserved += tickets[i].price - minus;
                                    await OrderTickets.create({
                                        ticket_id: tickets[i].id,
                                        user_id: decode.id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selTickets = await OrderTickets.findAndCountAll({ where: { ticket_id: tickets[i].id } });
                                oneTicket.current_quantity = oneTicket.quantity - selTickets.count;
                                oneTicket.save();
                            }
                        }
                        var items = myCart.items;
                        if (items.length > 0) {
                            project_id = items[0].project_id;
                            for (let i = 0; i < items.length; i++) {
                                var oneItem = await Item.findOne({ where: { id: items[i].id } });
                                items_quantity += items[i].CartItems.quantity;
                                for (let j = 0; j < items[i].CartItems.quantity; j++) {
                                    price += items[i].price;
                                    let minus = 0;
                                    if (items[i].vat_rate > 0) {
                                        minus += (items[i].vat_rate / 100) * items[i].price;
                                    }
                                    deserved += items[i].price - minus;
                                    await OrderItems.create({
                                        item_id: items[i].id,
                                        user_id: decode.id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selItems = await OrderItems.findAndCountAll({ where: { item_id: items[i].id } });
                                oneItem.current_quantity = oneItem.quantity - selItems.count;
                                oneItem.save();
                            }
                        }

                        let filterOBJ = { where: {} };
                        filterOBJ['where']['id'] = CreatedOrder.id;
                        filterOBJ['include'] = [{
                                model: OrderTickets,
                                as: 'tickets',
                            },
                            {
                                model: OrderItems,
                                as: 'items',
                            }
                        ];
                        var selectedOrder = await Order.findOne(filterOBJ);
                        await selectedOrder.update({
                            price: price,
                            tickets_quantity: tickets_quantity,
                            items_quantity: items_quantity,
                            project_id: project_id
                        });

                        if (project_id != 0) {
                            let selectedProject = await Project.findOne({ where: { id: project_id } });
                            deserved -= 0.02;
                            walletObj = {
                                amount: deserved,
                                order_id: selectedOrder.id,
                                user_id: selectedProject.user_id,
                                status: 'Revenued from order',
                                message: 'revenued from order ' + selectedOrder.id
                            }
                            let createdWallet = await Wallet.create(walletObj);
                            let viva = await sails.helpers.viva(createdWallet.id, decode.id);
                            await Wallet.update({ viva_id: viva.OrderCode + '-viva' }, { where: { order_id: selectedOrder.id } });
                            selectedOrder = selectedOrder.toJSON();
                            selectedOrder.viva_id = viva.OrderCode;
                        }
                        myCart.destroy();
                        // let saferpay = await sails.helpers.saferpay(selectedOrder.id, decode.id);
                        // await selectedOrder.update({
                        //     saferpay: saferpay
                        // });
                        return ResponseService.SuccessResponse(res, 'success for create new order', selectedOrder);
                    } else {
                        return ResponseService.ErrorResponse(res, 'your cart is empty');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    createByWallet: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    var tickets_quantity = 0;
                    var items_quantity = 0;
                    var price = 0;
                    var deserved = 0;
                    var project_id = 0;
                    if (myCart) {
                        var AuthUser = await User.findOne({ where: { id: decode.id } });
                        var country = (AuthUser.address && AuthUser.address.country) ? AuthUser.address.country : 'Belgium';
                        let OrderParam = {
                            owner_id: decode.id,
                            status: 'online',
                            type: 'Client Wallet',
                            country: country
                        }
                        var CreatedOrder = await Order.create(OrderParam);
                        var tickets = myCart.tickets;
                        if (tickets.length > 0) {
                            project_id = tickets[0].project_id;
                            for (let i = 0; i < tickets.length; i++) {
                                var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                                if (tickets[i].CartTickets.quantity > oneTicket.current_quantity) {
                                    let destroyedOrder = await Order.findOne({ where: { id: CreatedOrder.id } });
                                    destroyedOrder.destroy();
                                    return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                                }
                                tickets_quantity += tickets[i].CartTickets.quantity;
                                for (let j = 0; j < tickets[i].CartTickets.quantity; j++) {
                                    price += tickets[i].price;
                                    let minus = 0;
                                    if (tickets[i].price > 5) {
                                        minus += 0.98;
                                    }
                                    if (tickets[i].vat_rate > 0) {
                                        minus += (tickets[i].vat_rate / 100) * tickets[i].price;
                                    }
                                    deserved += tickets[i].price - minus;
                                    await OrderTickets.create({
                                        ticket_id: tickets[i].id,
                                        user_id: decode.id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selTickets = await OrderTickets.findAndCountAll({ where: { ticket_id: tickets[i].id } });
                                oneTicket.current_quantity = oneTicket.quantity - selTickets.count;
                                oneTicket.save();
                            }
                        }
                        var items = myCart.items;
                        if (items.length > 0) {
                            project_id = items[0].project_id;
                            for (let i = 0; i < items.length; i++) {
                                var oneItem = await Item.findOne({ where: { id: items[i].id } });
                                if (tickets[i].quantity > oneTicket.current_quantity) {
                                    return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                                }
                                items_quantity += items[i].CartItems.quantity;
                                for (let j = 0; j < items[i].CartItems.quantity; j++) {
                                    price += items[i].price;
                                    let minus = 0;
                                    if (items[i].vat_rate > 0) {
                                        minus += (items[i].vat_rate / 100) * items[i].price;
                                    }
                                    deserved += items[i].price - minus;
                                    await OrderItems.create({
                                        item_id: items[i].id,
                                        user_id: decode.id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selItems = await OrderItems.findAndCountAll({ where: { item_id: items[i].id } });
                                oneItem.current_quantity = oneItem.quantity - selItems.count;
                                oneItem.save();
                            }
                        }
                        let balance = await Wallet.sum('amount', {
                            where: {
                                user_id: decode.id,
                                confirm_receive: 1
                            }
                        });
                        let filterOBJ = { where: {} };
                        filterOBJ['where']['id'] = CreatedOrder.id;
                        filterOBJ['include'] = [{
                                model: OrderTickets,
                                as: 'tickets',
                            },
                            {
                                model: OrderItems,
                                as: 'items',
                            }
                        ];
                        var selectedOrder = await Order.findOne(filterOBJ);
                        if (balance <= price) {
                            selectedOrder.destroy();
                            return ResponseService.ErrorResponse(res, 'you have not the required balance to make this purchasing');
                        } else {
                            await selectedOrder.update({
                                price: price,
                                tickets_quantity: tickets_quantity,
                                items_quantity: items_quantity,
                                project_id: project_id
                            });

                            let walletObj = {
                                amount: -1 * price,
                                system_amount: (price - deserved),
                                order_id: selectedOrder.id,
                                user_id: decode.id,
                                status: 'Paid for order',
                                message: 'paid for order ' + selectedOrder.id
                            }
                            await Wallet.create(walletObj);

                            if (project_id != 0) {
                                let selectedProject = await Project.findOne({ where: { id: project_id } });
                                deserved -= 0.02;
                                walletObj = {
                                    amount: deserved,
                                    order_id: selectedOrder.id,
                                    user_id: selectedProject.user_id,
                                    status: 'Revenued from order',
                                    message: 'revenued from order ' + selectedOrder.id
                                }
                                await Wallet.create(walletObj);
                            }

                            myCart.destroy();
                            return ResponseService.SuccessResponse(res, 'success for create new order', selectedOrder);
                        }
                    } else {
                        return ResponseService.ErrorResponse(res, 'your cart is empty');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    createPos: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var id = req.param('id');
                    var tickets = req.body.tickets;
                    var items = req.body.items;
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['id'] = id;
                    var pos = await Pos.findOne(filterOBJ);
                    var tickets_quantity = 0;
                    var items_quantity = 0;
                    var price = 0;
                    var deserved = 0;
                    if (pos) {
                        var selectedProject = await Project.findOne({ where: { id: pos.project_id } });
                        if (selectedProject.user_id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'this POS belongs to someone else ');
                        }
                        var country = (selectedProject.address && selectedProject.address.country) ? selectedProject.address.country : 'Belgium';
                        let OrderParam = {
                            status: 'pos',
                            country: country,
                            project_id: pos.project_id,
                            owner_id: decode.id,
                            pos_id: id
                        }
                        var CreatedOrder = await Order.create(OrderParam);
                        if (tickets.length > 0) {
                            for (let i = 0; i < tickets.length; i++) {
                                var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                                tickets_quantity += tickets[i].quantity;
                                for (let j = 0; j < tickets[i].quantity; j++) {
                                    price += oneTicket.price;
                                    if (oneTicket.price <= 5) {
                                        deserved += oneTicket.price - 0.02
                                    } else {
                                        deserved += oneTicket.price - 1
                                    }
                                    await OrderTickets.create({
                                        ticket_id: tickets[i].id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selTickets = await OrderTickets.findAndCountAll({ where: { ticket_id: tickets[i].id } });
                                oneTicket.current_quantity = oneTicket.quantity - selTickets.count;
                                oneTicket.save();
                            }
                        }
                        if (items.length > 0) {
                            for (let i = 0; i < items.length; i++) {
                                var oneItem = await Item.findOne({ where: { id: items[i].id } });
                                items_quantity += items[i].quantity;
                                for (let j = 0; j < items[i].quantity; j++) {
                                    price += oneItem.price;
                                    deserved += oneItem.price - 0.02
                                    await OrderItems.create({
                                        item_id: items[i].id,
                                        order_id: CreatedOrder.id
                                    });
                                }
                                let selItems = await OrderItems.findAndCountAll({ where: { item_id: items[i].id } });
                                oneItem.current_quantity = oneItem.quantity - selItems.count;
                                oneItem.save();
                            }
                        }
                        let filterOBJ = { where: {} };
                        filterOBJ['where']['id'] = CreatedOrder.id;
                        filterOBJ['include'] = [{
                                model: OrderTickets,
                                as: 'tickets',
                            },
                            {
                                model: OrderItems,
                                as: 'items',
                            }
                        ];
                        var selectedOrder = await Order.findOne(filterOBJ);
                        await selectedOrder.update({
                            price: price,
                            tickets_quantity: tickets_quantity,
                            items_quantity: items_quantity
                        })

                        walletObj = {
                            amount: deserved,
                            order_id: selectedOrder.id,
                            user_id: selectedProject.user_id,
                            status: 'Revenued from POS',
                            message: 'revenued from POS order ' + selectedOrder.id
                        }
                        await Wallet.create(walletObj);

                        let saferpay = await sails.helpers.saferpay(selectedOrder.id, decode.id);
                        await selectedOrder.update({
                            saferpay: saferpay
                        });
                        return ResponseService.SuccessResponse(res, 'success for create new order', selectedOrder);
                    } else {
                        return ResponseService.ErrorResponse(res, 'your pos is empty');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    createPosManager: async function(req, res) {
        try {
            var id = req.param('id');
            var tickets = req.body.tickets;
            var items = req.body.items;
            let filterOBJ = { where: {} };
            filterOBJ['where']['id'] = id;
            var pos = await Pos.findOne(filterOBJ);
            var tickets_quantity = 0;
            var items_quantity = 0;
            var price = 0;
            if (pos) {
                var selectedProject = await Project.findOne({ where: { id: pos.project_id } });
                if (!selectedProject.user_id) {
                    return ResponseService.ErrorResponse(res, 'this POS belongs to someone else ');
                }
                var country = (selectedProject.address && selectedProject.address.country) ? selectedProject.address.country : 'Belgium';
                let OrderParam = {
                    status: 'pos',
                    country: country,
                    type: 'CASH',
                    project_id: pos.project_id,
                    owner_id: selectedProject.user_id,
                    pos_id: id
                }
                var CreatedOrder = await Order.create(OrderParam);
                if (tickets.length > 0) {
                    for (let i = 0; i < tickets.length; i++) {
                        var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                        if (tickets[i].quantity > oneTicket.current_quantity) {
                            let destroyedOrder = await Order.findOne({ where: { id: CreatedOrder.id } });
                            destroyedOrder.destroy();
                            return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                        }
                        tickets_quantity += tickets[i].quantity;
                        for (let j = 0; j < tickets[i].quantity; j++) {
                            price += oneTicket.price;
                            await OrderTickets.create({
                                ticket_id: tickets[i].id,
                                order_id: CreatedOrder.id
                            });
                        }
                        let selTickets = await OrderTickets.findAndCountAll({ where: { ticket_id: tickets[i].id } });
                        oneTicket.current_quantity = oneTicket.quantity - selTickets.count;
                        oneTicket.save();
                    }
                }
                if (items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                        var oneItem = await Item.findOne({ where: { id: items[i].id } });
                        if (items[i].quantity > oneItem.current_quantity) {
                            let destroyedOrder = await Order.findOne({ where: { id: CreatedOrder.id } });
                            destroyedOrder.destroy();
                            return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneItem.name);
                        }
                        items_quantity += items[i].quantity;
                        for (let j = 0; j < items[i].quantity; j++) {
                            price += oneItem.price;
                            await OrderItems.create({
                                item_id: items[i].id,
                                order_id: CreatedOrder.id
                            });
                        }
                        let selItems = await OrderItems.findAndCountAll({ where: { item_id: items[i].id } });
                        oneItem.current_quantity = oneItem.quantity - selItems.count;
                        oneItem.save();
                    }
                }
                let filterOBJ = { where: {} };
                filterOBJ['where']['id'] = CreatedOrder.id;
                filterOBJ['include'] = [{
                        model: OrderTickets,
                        as: 'tickets',
                    },
                    {
                        model: OrderItems,
                        as: 'items',
                    }
                ];
                var selectedOrder = await Order.findOne(filterOBJ);
                await selectedOrder.update({
                    price: price,
                    tickets_quantity: tickets_quantity,
                    items_quantity: items_quantity
                });
                return ResponseService.SuccessResponse(res, 'success for create new order', selectedOrder);
            } else {
                return ResponseService.ErrorResponse(res, 'your pos is empty');
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    createPosQR: async function(req, res) {
        try {
            let reqObj = {
                amount: req.body.amount,
                pos_id: req.body.pos_id,
                obj: req.body.obj,
                qr: req.body.qr,
            }
            let createdQR = await PosQR.create(reqObj);
            return ResponseService.SuccessResponse(res, 'The payment request has been created successfully', createdQR);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    delete: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let selectedOrder = await Order.findOne({ where: { id: id } });
                    if (selectedOrder.owner_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this order belongs to someone else ');
                    } else {
                        await selectedOrder.destroy();
                        return ResponseService.SuccessResponse(res, 'the order has been deleted successfully ', selectedOrder);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    deleteManager: async function(req, res) {
        try {
            let id = req.param('id');
            let selectedOrder = await Order.findOne({ where: { id: id } });
            if (!selectedOrder.owner_id) {
                return ResponseService.ErrorResponse(res, 'this order belongs to someone else ');
            } else {
                await selectedOrder.destroy();
                return ResponseService.SuccessResponse(res, 'the order has been deleted successfully ', selectedOrder);
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    overview: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let selectedProject = await Project.findOne({ where: { id: project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    let total = await Order.sum('price', { where: { project_id: project_id } });
                    let pos = await Order.sum('price', { where: { project_id: project_id, status: "pos" } });
                    let online = await Order.sum('price', { where: { project_id: project_id, status: "online" } });
                    var date = new Date(),
                        y = date.getFullYear(),
                        m = date.getMonth();
                    let firstDay, lastDay, firstDay_cm, lastDay_cm;

                    if (m == 0) {
                        firstDay = new Date(y - 1, 11, 2);
                        lastDay = new Date(y, m, 2);
                    } else {
                        firstDay = new Date(y, m - 1, 2);
                        lastDay = new Date(y, m, 2);
                    }

                    if (m == 11) {
                        firstDay_cm = new Date(y, m, 2);
                        lastDay_cm = new Date(y + 1, 0, 2);
                    } else {
                        firstDay_cm = new Date(y, m, 2);
                        lastDay_cm = new Date(y, m + 1, 2);
                    }

                    let total_lm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay, lastDay]
                            },
                        }
                    });
                    let pos_lm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            status: "pos",
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay, lastDay]
                            },
                        }
                    });
                    let online_lm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            status: "online",
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay, lastDay]
                            },
                        }
                    });

                    let total_cm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay_cm, lastDay_cm]
                            },
                        }
                    });
                    let pos_cm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            status: "pos",
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay_cm, lastDay_cm]
                            },
                        }
                    });
                    let online_cm = await Order.sum('price', {
                        where: {
                            project_id: project_id,
                            status: "online",
                            createdAt: {
                                [Sequelize.Op.between]: [firstDay_cm, lastDay_cm]
                            },
                        }
                    });

                    let total_precent, total_up, pos_precent, pos_up, online_precent, online_up;

                    if (total_cm > total_lm) {
                        total_precent = (total_lm / total_cm) * 100;
                        total_up = true;
                    } else {
                        total_precent = (total_cm / total_lm) * 100;
                        total_up = false;
                    }

                    if (pos_cm > pos_lm) {
                        pos_precent = (pos_lm / pos_cm) * 100;
                        pos_up = true;
                    } else {
                        pos_precent = (pos_cm / pos_lm) * 100;
                        pos_up = false;
                    }

                    if (online_cm > online_lm) {
                        online_precent = (online_lm / online_cm) * 100;
                        online_up = true;
                    } else {
                        online_precent = (online_cm / online_lm) * 100;
                        online_up = false;
                    }

                    let chartWidget1_data = [],
                        chartWidget2_data = [],
                        chartWidget3_data = [];

                    for (let i = 5; i >= 0; i -= 1) {
                        let month = date.getMonth() - i;
                        let firstDay_im = new Date(y, month, 2);
                        let lastDay_im;

                        if (month == 11) {
                            lastDay_im = new Date(y + 1, 0, 2);
                        } else {
                            lastDay_im = new Date(y, month + 1, 2);
                        }

                        let total_im = await Order.sum('price', {
                            where: {
                                project_id: project_id,
                                createdAt: {
                                    [Sequelize.Op.between]: [firstDay_im, lastDay_im]
                                },
                            }
                        });
                        chartWidget3_data.push(total_im);
                        let pos_im = await Order.sum('price', {
                            where: {
                                project_id: project_id,
                                status: "pos",
                                createdAt: {
                                    [Sequelize.Op.between]: [firstDay_im, lastDay_im]
                                },
                            }
                        });
                        chartWidget2_data.push(pos_im);
                        let online_im = await Order.sum('price', {
                            where: {
                                project_id: project_id,
                                status: "online",
                                createdAt: {
                                    [Sequelize.Op.between]: [firstDay_im, lastDay_im]
                                },
                            }
                        });
                        chartWidget1_data.push(online_im);
                    }

                    let overview = {
                        total: total,
                        onsite: pos,
                        online: online,
                        total_precent: total_precent,
                        onsite_precent: pos_precent,
                        online_precent: online_precent,
                        total_up: total_up,
                        onsite_up: pos_up,
                        online_up: online_up,
                        chartWidget1_data: chartWidget1_data,
                        chartWidget2_data: chartWidget2_data,
                        chartWidget3_data: chartWidget3_data
                    };
                    return ResponseService.SuccessResponse(res, 'success for getting revenu overview', overview);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    ticketSalesPerWeek: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let selProject = await Project.findOne({ where: { id: project_id } });
                    if (selProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    var date = new Date(),
                        y = date.getFullYear(),
                        m = date.getMonth()
                    let days = [],
                        datasets = [];

                    for (let i = 0; i < 8; i++) {
                        let d = new Date();
                        d.setDate(d.getDate() - i);
                        days.push(d)
                    }

                    let selectedTickets = await Ticket.findAll({
                        where: { project_id: project_id }
                    });

                    for (let i = 0; i < selectedTickets.length; i++) {
                        let price = 0;
                        let ticket_name = selectedTickets[i].name;
                        let number_of_sales = [];
                        for (let j = 0; j < 7; j++) {
                            let ticketsCount = await OrderTickets.count({
                                where: {
                                    ticket_id: selectedTickets[i].id,
                                    createdAt: {
                                        [Sequelize.Op.between]: [days[j + 1], days[j]]
                                    },
                                }
                            });
                            price += ticketsCount * selectedTickets[i].price;
                            number_of_sales.push(ticketsCount);
                        }
                        datasets.push({
                            ticket_name: ticket_name,
                            ticket_price: price,
                            number_of_sales: number_of_sales
                        });
                    }

                    return ResponseService.SuccessResponse(res, 'success for getting tickets sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    ticketSalesPerMonth: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let selProject = await Project.findOne({ where: { id: project_id } });
                    if (selProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    var date = new Date(),
                        y = date.getFullYear(),
                        m = date.getMonth()
                    let weeks = [],
                        datasets = [],
                        firstDate = new Date(y, m, 1),
                        lastDate = new Date(y, m + 1, 0),
                        numDays = lastDate.getDate();

                    let start = 1;
                    let end = 7 - firstDate.getDay();
                    if (start === 'monday') {
                        if (firstDate.getDay() === 0) {
                            end = 1;
                        } else {
                            end = 7 - firstDate.getDay() + 1;
                        }
                    }

                    while (start <= numDays) {
                        weeks.push({ start: new Date(y, m, start + 1), end: new Date(y, m, end + 1) });
                        start = end + 1;
                        end = end + 7;
                        end = start === 1 && end === 8 ? 1 : end;
                        if (end > numDays) {
                            end = numDays;
                        }
                    }

                    let selectedTickets = await Ticket.findAll({
                        where: { project_id: project_id }
                    });

                    for (let i = 0; i < selectedTickets.length; i++) {
                        let price = 0;
                        let ticket_name = selectedTickets[i].name;
                        let number_of_sales = [];
                        for (let j = 0; j < weeks.length; j++) {
                            let ticketsCount = await OrderTickets.count({
                                where: {
                                    ticket_id: selectedTickets[i].id,
                                    createdAt: {
                                        [Sequelize.Op.between]: [weeks[j].start, weeks[j].end]
                                    },
                                }
                            });
                            price += ticketsCount * selectedTickets[i].price;
                            number_of_sales.push(ticketsCount);
                        }
                        datasets.push({
                            ticket_name: ticket_name,
                            ticket_price: price,
                            number_of_sales: number_of_sales
                        });
                    }

                    return ResponseService.SuccessResponse(res, 'success for getting tickets sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    ticketSalesPerYear: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let selProject = await Project.findOne({ where: { id: project_id } });
                    if (selProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    var date = new Date(),
                        y = date.getFullYear();
                    let monthes = [],
                        datasets = [];

                    for (let m = 0; m < 12; m++) {
                        if (m == 11) {
                            monthes.push({ start: new Date(y, m, 2), end: new Date(y + 1, 0, 2) });
                        } else {
                            monthes.push({ start: new Date(y, m, 2), end: new Date(y, m + 1, 2) });
                        }
                    }

                    let selectedTickets = await Ticket.findAll({
                        where: { project_id: project_id }
                    });

                    for (let i = 0; i < selectedTickets.length; i++) {
                        let price = 0;
                        let ticket_name = selectedTickets[i].name;
                        let number_of_sales = [];
                        for (let j = 0; j < monthes.length; j++) {
                            let ticketsCount = await OrderTickets.count({
                                where: {
                                    ticket_id: selectedTickets[i].id,
                                    createdAt: {
                                        [Sequelize.Op.between]: [monthes[j].start, monthes[j].end]
                                    },
                                }
                            });
                            price += ticketsCount * selectedTickets[i].price;
                            number_of_sales.push(ticketsCount);
                        }
                        datasets.push({
                            ticket_name: ticket_name,
                            ticket_price: price,
                            number_of_sales: number_of_sales
                        });
                    }

                    return ResponseService.SuccessResponse(res, 'success for getting tickets sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    countrySales: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let filterOBJ = { where: { project_id: project_id } };
                    filterOBJ['group'] = ['country'];
                    filterOBJ['attributes'] = ['country'];
                    let orderCountries = await Order.findAll(filterOBJ);
                    let countries = [],
                        countries_count = [];
                    for (let i = 0; i < orderCountries.length; i++) {
                        let price = await Order.count({
                            where: {
                                project_id: project_id,
                                country: orderCountries[i].country
                            }
                        });
                        countries_count.push(price);
                        countries.push(orderCountries[i].country);
                    }

                    datasets = {
                        percentage: countries_count,
                        countries: countries
                    };

                    return ResponseService.SuccessResponse(res, 'success for getting countries sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    genderSales: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let filterOBJ = { where: { project_id: project_id } };
                    filterOBJ['include'] = [{
                        model: User,
                        as: 'owner',
                        where: { gender: 'male' }
                    }];
                    let orderMales = await Order.count(filterOBJ);
                    filterOBJ['include'] = [{
                        model: User,
                        as: 'owner',
                        where: { gender: 'female' }
                    }];
                    let orderFemales = await Order.count(filterOBJ);

                    datasets = {
                        percentage: [orderMales, orderFemales],
                        countries: ['Male', 'Female']
                    };

                    return ResponseService.SuccessResponse(res, 'success for getting gender sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    itemSales: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let selProject = await Project.findOne({ where: { id: project_id } });
                    if (selProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    let percentage = [],
                        item_names = [];
                    let selectedItems = await Item.findAll({
                        where: { project_id: project_id }
                    });
                    for (let i = 0; i < selectedItems.length; i++) {
                        item_names.push(selectedItems[i].name);
                        let itemsCount = await OrderItems.count({
                            where: {
                                item_id: selectedItems[i].id
                            }
                        });
                        percentage.push(itemsCount);
                    }
                    let datasets = {
                        item_names: item_names,
                        percentage: percentage
                    };
                    return ResponseService.SuccessResponse(res, 'success for getting items sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    posSales: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.param('id');
                    let pos_id = req.param('pos');
                    let selProject = await Project.findOne({ where: { id: project_id } });
                    if (selProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    var date = new Date(),
                        y = date.getFullYear(),
                        m = date.getMonth()
                    let days = [],
                        datasets = [];

                    for (let i = 0; i < 8; i++) {
                        let d = new Date();
                        d.setDate(d.getDate() - i);
                        days.push(d)
                    }

                    let selectedItems = await Item.findAll({
                        where: { project_id: project_id }
                    });

                    for (let i = 0; i < selectedItems.length; i++) {
                        let price = 0;
                        let item_name = selectedItems[i].name;
                        let number_of_sales = [];
                        for (let j = 0; j < 7; j++) {
                            let itemsCount = await OrderItems.count({
                                where: {
                                    item_id: selectedItems[i].id,
                                    createdAt: {
                                        [Sequelize.Op.between]: [days[j + 1], days[j]]
                                    },
                                },
                                include: {
                                    model: Order,
                                    as: 'order',
                                    where: { pos_id: pos_id }
                                }
                            });
                            price += itemsCount * selectedItems[i].price;
                            number_of_sales.push(itemsCount);
                        }
                        datasets.push({
                            item_name: item_name,
                            item_price: price,
                            number_of_sales: number_of_sales
                        });
                    }

                    return ResponseService.SuccessResponse(res, 'success for getting items sales per pos', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    billingCenter: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let year = req.param('year');
                    let datasets = {
                        labels: ["Total Revenue " + year, "Total Transaction fees " + year, "Total Service fees " + year],
                        percentage: [80, 15, 5],
                        details: [{
                                action: 'Withdraw',
                                date: '25/2/2021',
                                amount: '14000',
                                fee: 380,
                                vat: 80.85,
                                total_tax: 460.85
                            },
                            {
                                action: 'Transaction',
                                date: '25/2/2021',
                                amount: 100,
                                fee: 0.016,
                                vat: 0.003,
                                total_tax: 0.02
                            },
                            {
                                action: 'Refund',
                                date: '25/2/2021',
                                amount: 70,
                                fee: 0.002,
                                vat: 0.003,
                                total_tax: 0.005
                            }
                        ]
                    };
                    return ResponseService.SuccessResponse(res, 'success for getting items sales', datasets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    assert: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let selectedOrder = await Order.findOne({ where: { id: id } });
                    if (selectedOrder.owner_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this order belongs to someone else ');
                    } else {
                        let saferpay = await sails.helpers.saferpay(id, decode.id, "assert");
                        if (saferpay.Transaction) {
                            await Wallet.update({ transaction_id: saferpay.Transaction.Id }, { where: { order_id: id } });
                            return ResponseService.SuccessResponse(res, 'the wallet has been updated for transaction success ', selectedOrder);
                        } else {
                            await selectedOrder.destroy();
                            return ResponseService.SuccessResponse(res, 'the order has been deleted because transaction failure ', selectedOrder);
                        }
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    assertManager: async function(req, res) {
        try {
            let id = req.param('id');
            let selectedOrder = await Order.findOne({ where: { id: id } });
            if (!selectedOrder.owner_id) {
                return ResponseService.ErrorResponse(res, 'this order belongs to someone else ');

            } else {
                let saferpay = await sails.helpers.saferpay(id, selectedOrder.owner_id, "assert");
                if (saferpay.Transaction) {
                    await Wallet.update({ transaction_id: saferpay.Transaction.Id }, { where: { order_id: id } });
                    let selectedWallet = await Wallet.findOne({ where: { order_id: id } });
                    let blockchainAdminOBJ = {
                        'idpro': 5,
                        'amount': (selectedOrder.price - selectedWallet.amount)
                    }
                    await sails.helpers.blockchain('cashinpro', blockchainAdminOBJ);
                    return ResponseService.SuccessResponse(res, 'the wallet has been updated for transaction success ', selectedOrder);
                } else {
                    await selectedOrder.destroy();
                    return ResponseService.SuccessResponse(res, 'the order has been deleted because transaction failure ', selectedOrder);
                }
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    }
};