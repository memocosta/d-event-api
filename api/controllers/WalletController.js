/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var bcrypt = require('bcrypt');
module.exports = {
    index: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let history = await Wallet.findAll({ where: { user_id: decode.id, confirm_receive: 1 } });
                    let balance = await Wallet.sum('amount', {
                        where: {
                            user_id: decode.id,
                            confirm_receive: 1
                        }
                    });
                    let dataset = {
                        my_wallet: balance,
                        wallet_history: history
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting my wallet', dataset);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    chart: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let dataset = [];
                    var date = new Date(),
                        y = date.getFullYear();
                    for (let i = 5; i >= 0; i -= 1) {
                        let month = date.getMonth() - i;
                        let firstDay_im = new Date(y, month, 2);
                        let lastDay_im;

                        if (month == 11) {
                            lastDay_im = new Date(y + 1, 0, 2);
                        } else {
                            lastDay_im = new Date(y, month + 1, 2);
                        }

                        let balance = await Wallet.sum('amount', {
                            where: {
                                user_id: decode.id,
                                confirm_receive: 1,
                                createdAt: {
                                    [Sequelize.Op.between]: [firstDay_im, lastDay_im]
                                },
                            }
                        });
                        dataset.push(balance);
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting my wallet', dataset);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    add: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let body = req.body;
                    if (!body.amount) {
                        return ResponseService.ErrorResponse(res, 'amount is required');
                    }
                    body.user_id = decode.id;
                    body.status = 'You added ' + body.amount + ' euros to your wallet';
                    body.message = 'Cachin';
                    let createdWallet = await Wallet.create(body);
                    // let saferpay = await sails.helpers.saferwallet(createdWallet.id, decode.id);
                    let viva = await sails.helpers.viva(createdWallet.id, decode.id);
                    await Wallet.update({ viva_id: viva.OrderCode + '-viva' }, { where: { id: createdWallet.id } });
                    createdWallet.viva_id = viva.OrderCode;
                    return ResponseService.SuccessResponse(res, 'the amount has been added to your wallet successfully ', createdWallet);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    send: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    if (!req.body.amount) {
                        return ResponseService.ErrorResponse(res, 'amount is required');
                    }
                    if (!req.body.password) {
                        return ResponseService.ErrorResponse(res, 'password is required');
                    }

                    let user = await User.findOne({
                        where: { id: decode.id },
                        attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'password']
                    });
                    let passordSame = await bcrypt.compare(req.body.password, user.password);
                    if (!passordSame) {
                        return ResponseService.ErrorResponse(res, 'these credentials are not matched or you need to set your new password');
                    }

                    if (req.body.partner_id == decode.id) {
                        return ResponseService.ErrorResponse(res, "you can't send token to yourself");
                    }

                    let my_wallet = await Wallet.sum('amount', {
                        where: {
                            user_id: decode.id,
                            confirm_receive: 1
                        }
                    });
                    let deserved = Math.round(req.body.amount * 100) / 100.0 + 0.02;
                    if (my_wallet <= deserved) {
                        return ResponseService.ErrorResponse(res, 'you have not the required balance to make this transfer');
                    }

                    let sender = user;
                    let partner = await User.findOne({ where: { id: req.body.partner_id } });

                    let history = [];
                    let body = {
                        amount: -1 * deserved,
                        system_amount: 0.02,
                        partner_id: req.body.partner_id,
                        user_id: decode.id,
                        status: 'You sent ' + req.body.amount + ' euros to "' + partner.name + '"',
                        message: req.body.message,
                    }
                    let createdWallet = await Wallet.create(body);
                    history.push(createdWallet);

                    let body2 = {
                        amount: req.body.amount,
                        partner_id: decode.id,
                        user_id: req.body.partner_id,
                        status: 'You received ' + req.body.amount + ' euros from "' + sender.name + '"'
                    }
                    let createdWallet2 = await Wallet.create(body2);
                    history.push(createdWallet2);

                    let obj = {
                        user_id: decode.id,
                        partner_id: partner.id,
                        title: 'sending token',
                        body: 'you sent ' + req.body.amount + ' euros to ' + partner.name,
                        type: 'send'
                    }
                    await Notifications.create(obj);

                    let notificationOBJ = {
                        token: sender.device_token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);

                    obj = {
                        user_id: partner.id,
                        partner_id: decode.id,
                        title: 'New token for you',
                        body: 'you have new ' + req.body.amount + ' euros  from  ' + sender.name,
                        type: 'receive'
                    }
                    await Notifications.create(obj);

                    notificationOBJ = {
                        token: partner.device_token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);

                    return ResponseService.SuccessResponse(res, 'the amount has been sent to your partner successfully ');
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    receive: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    if (!req.body.amount) {
                        return ResponseService.ErrorResponse(res, 'amount is required');
                    }

                    if (!req.body.partner_id) {
                        let reqObj = {
                            amount: req.body.amount,
                            user_id: decode.id,
                            message: req.body.message,
                            qr: req.body.qr,
                        }
                        let createdReceive = await Receive.create(reqObj);
                        return ResponseService.SuccessResponse(res, 'The payment request has been created successfully', createdReceive);
                    }

                    if (req.body.partner_id == decode.id) {
                        return ResponseService.ErrorResponse(res, "you can't receive token from yourself");
                    }

                    let partner_wallet = await Wallet.sum('amount', {
                        where: {
                            user_id: req.body.partner_id,
                            confirm_receive: 1
                        }
                    });
                    let deserved = Math.round(req.body.amount * 100) / 100.0 + 0.02;
                    if (partner_wallet <= deserved) {
                        return ResponseService.ErrorResponse(res, 'your partner has not the required balance to make this transfer');
                    }

                    let history = [];
                    let receiver = await User.findOne({ where: { id: decode.id } });
                    let partner = await User.findOne({ where: { id: req.body.partner_id } });

                    let body = {
                        amount: req.body.amount,
                        partner_id: req.body.partner_id,
                        user_id: decode.id,
                        status: 'You received ' + req.body.amount + ' euros from "' + partner.name + '"',
                        message: req.body.message,
                        qr: req.body.qr,
                        confirm_receive: 0
                    }
                    let createdWallet = await Wallet.create(body);

                    history.push(createdWallet);

                    let body2 = {
                        amount: -1 * deserved,
                        partner_id: decode.id,
                        user_id: req.body.partner_id,
                        status: 'You sent ' + req.body.amount + ' euros to "' + receiver.name + '"',
                        qr: req.body.qr,
                        confirm_receive: 0
                    }
                    let createdWallet2 = await Wallet.create(body2);

                    history.push(createdWallet2);

                    return ResponseService.SuccessResponse(res, 'The payment request has been sent to your partner successfully');
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    scan: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let qr = req.body.qr;
                    if (qr.includes("pos")) {
                        let selectedPos = await PosQR.findOne({ where: { qr: qr } });
                        if (!selectedPos) {
                            return ResponseService.ErrorResponse(res, 'Invalid QR code');
                        }
                        try {
                            let id = selectedPos.pos_id;
                            let tickets = selectedPos.obj.tickets;
                            let items = selectedPos.obj.items;
                            let filterOBJ = { where: {} };
                            filterOBJ['where']['id'] = id;
                            let pos = await Pos.findOne(filterOBJ);
                            let tickets_quantity = 0;
                            let items_quantity = 0;
                            let itemsCount = 0;
                            let price = 0;
                            let deserved = 0;
                            if (pos) {
                                let selectedProject = await Project.findOne({ where: { id: pos.project_id } });
                                if (!selectedProject.user_id) {
                                    return ResponseService.ErrorResponse(res, 'this POS belongs to someone else ');
                                }
                                let country = (selectedProject.address && selectedProject.address.country) ? selectedProject.address.country : 'Belgium';
                                let OrderParam = {
                                    status: 'pos',
                                    country: country,
                                    type: (pos.exchange == "euro") ? 'Client Wallet' : 'Client tickets',
                                    project_id: pos.project_id,
                                    owner_id: decode.id,
                                    pos_id: id
                                }
                                let CreatedOrder = await Order.create(OrderParam);
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
                                            let minus = 0;
                                            if (oneTicket.price > 5) {
                                                minus += 0.98;
                                            }
                                            if (oneTicket.vat_rate > 0) {
                                                minus += (oneTicket.vat_rate / 100) * oneTicket.price;
                                            }
                                            deserved += oneTicket.price - minus;
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
                                        itemsCount = Number(itemsCount) + (oneItem.price * items[i].quantity);
                                        if (items[i].quantity > oneItem.current_quantity) {
                                            let destroyedOrder = await Order.findOne({ where: { id: CreatedOrder.id } });
                                            destroyedOrder.destroy();
                                            return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneItem.name);
                                        }
                                        items_quantity += items[i].quantity;
                                        for (let j = 0; j < items[i].quantity; j++) {
                                            price += oneItem.price;
                                            let minus = 0;
                                            if (oneItem.vat_rate > 0) {
                                                minus += (oneItem.vat_rate / 100) * oneItem.price;
                                            }
                                            deserved += oneItem.price - minus;
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

                                if (pos.exchange == "euro") {
                                    let my_wallet = await Wallet.sum('amount', {
                                        where: {
                                            user_id: decode.id,
                                            confirm_receive: 1
                                        }
                                    });
                                    if (my_wallet < price) {
                                        selectedOrder.destroy();
                                        return ResponseService.ErrorResponse(res, 'you have not the required balance to make this transfer');
                                    }


                                    let walletObj = {
                                        amount: -1 * price,
                                        system_amount: (price - deserved),
                                        order_id: selectedOrder.id,
                                        user_id: decode.id,
                                        status: 'Paid for pos order',
                                        message: 'paid for pos order ' + selectedOrder.id
                                    }
                                    await Wallet.create(walletObj);

                                    deserved -= 0.02;
                                    walletObj = {
                                        amount: deserved,
                                        order_id: selectedOrder.id,
                                        user_id: selectedProject.user_id,
                                        partner_id: decode.id,
                                        status: 'Revenued from POS',
                                        message: 'revenued from POS order ' + selectedOrder.id
                                    }
                                    await Wallet.create(walletObj);
                                } else {
                                    let ticFilterOBJ = {
                                        where: {
                                            user_id: decode.id,
                                            ticket_id: pos.exchange,
                                            is_refunded: 0,
                                            is_accessed: 0
                                        }
                                    }
                                    let selectedTickets = await OrderTickets.findAll(ticFilterOBJ);
                                    if (itemsCount <= selectedTickets.length) {
                                        for (let i = 0; i < itemsCount; i++) {
                                            let updateorderTicket = await OrderTickets.findOne({ where: { id: selectedTickets[i].id } });
                                            await updateorderTicket.update({ is_accessed: 1 });
                                        }
                                    } else {
                                        selectedOrder.destroy();
                                        return ResponseService.ErrorResponse(res, 'You have not enough tickets to make this order');
                                    }
                                }

                                await selectedPos.destroy();

                                return ResponseService.SuccessResponse(res, 'success for create new order', selectedOrder);
                            } else {
                                return ResponseService.ErrorResponse(res, 'the pos is empty');
                            }
                        } catch (er) {
                            console.log(er);
                            return ResponseService.ErrorResponse(res, 'some thing happen in this POS QR payment', er);
                        }
                    }

                    let selectedReceive = await Receive.findOne({ where: { qr: qr } });
                    if (selectedReceive) {
                        if (selectedReceive.user_id != decode.id) {
                            let my_wallet = await Wallet.sum('amount', {
                                where: {
                                    user_id: decode.id,
                                    confirm_receive: 1
                                }
                            });
                            let deserved = Math.round(selectedReceive.amount * 100) / 100.0 + 0.02;
                            if (my_wallet <= deserved) {
                                return ResponseService.ErrorResponse(res, 'you have not the required balance to make this transfer');
                            }

                            let sender = await User.findOne({ where: { id: decode.id } });
                            let partner = await User.findOne({ where: { id: selectedReceive.user_id } });

                            let history = [];
                            let body = {
                                amount: -1 * deserved,
                                system_amount: 0.02,
                                partner_id: partner.id,
                                user_id: decode.id,
                                status: 'You sent ' + selectedReceive.amount + ' euros to "' + partner.name + '"',
                                message: selectedReceive.message,
                            }
                            let createdWallet = await Wallet.create(body);
                            history.push(createdWallet);

                            let body2 = {
                                amount: selectedReceive.amount,
                                partner_id: decode.id,
                                user_id: partner.id,
                                status: 'You received ' + selectedReceive.amount + ' euros from "' + sender.name + '"'
                            }
                            let createdWallet2 = await Wallet.create(body2);
                            history.push(createdWallet2);

                            let obj = {
                                user_id: decode.id,
                                partner_id: partner.id,
                                title: 'sending token',
                                body: 'you sent ' + selectedReceive.amount + ' euros to ' + partner.name,
                                type: 'send'
                            }
                            await Notifications.create(obj);

                            let notificationOBJ = {
                                token: sender.device_token,
                                body: obj.body,
                                title: obj.title,
                                type: obj.type
                            };
                            await sails.helpers.firebase.with(notificationOBJ);

                            obj = {
                                user_id: partner.id,
                                partner_id: decode.id,
                                title: 'New token for you',
                                body: 'you have new ' + selectedReceive.amount + ' euros  from  ' + sender.name,
                                type: 'receive'
                            }
                            await Notifications.create(obj);

                            notificationOBJ = {
                                token: partner.device_token,
                                body: obj.body,
                                title: obj.title,
                                type: obj.type
                            };
                            await sails.helpers.firebase.with(notificationOBJ);

                            await selectedReceive.destroy();

                            return ResponseService.SuccessResponse(res, 'the amount has been sent to your partner successfully ');
                        }
                    }

                    let selectedQR = await Wallet.findOne({ where: { qr: qr, user_id: decode.id } });
                    if (selectedQR.amount > 0) {
                        return ResponseService.ErrorResponse(res, 'you have not permission to do that');
                    }

                    let updatedWallet = await Wallet.update({ confirm_receive: 1 }, { where: { qr: qr } });
                    let amount = (selectedQR.amount - 0.02) * -1;

                    let blockchainAdminOBJ = {
                        'idpro': 5,
                        'amount': 0.02
                    }
                    await sails.helpers.blockchain('cashinpro', blockchainAdminOBJ);

                    let sender = await User.findOne({ where: { id: decode.id } });
                    let partner = await User.findOne({ where: { id: selectedQR.partner_id } });

                    let obj = {
                        user_id: decode.id,
                        partner_id: partner.id,
                        title: 'sending token',
                        body: 'you sent ' + amount + ' euros to ' + partner.name,
                        type: 'send'
                    }
                    await Notifications.create(obj);

                    let notificationOBJ = {
                        token: sender.device_token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);

                    obj = {
                        user_id: partner.id,
                        partner_id: decode.id,
                        title: 'New token for you',
                        body: 'you have new ' + amount + ' euros from ' + sender.name,
                        type: 'receive'
                    }
                    await Notifications.create(obj);

                    notificationOBJ = {
                        token: partner.device_token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);

                    return ResponseService.SuccessResponse(res, 'the Wallet has been updated successfully ', updatedWallet);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    withdraw: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let amount = req.body.amount;
                    let balance = await Wallet.sum('amount', {
                        where: {
                            user_id: decode.id,
                            confirm_receive: 1
                        }
                    });
                    if (balance <= amount) {
                        return ResponseService.ErrorResponse(res, 'you can not withdraw this amount');
                    }
                    let body = {
                        amount: -1 * amount,
                        user_id: decode.id,
                        status: 'Withdrawn ' + amount + ' euros from my wallet',
                        message: 'Withdrawn ' + amount,
                    }
                    let createdWallet = await Wallet.create(body);

                    let user = await User.findOne({ where: { id: decode.id } });
                    let admin_precent = 0.0275 * amount;
                    let vat = 0.21 * admin_precent;
                    let deserved = amount - (admin_precent + vat);
                    await sails.helpers.sendMail(user.name + ' <' + user.email + '>', 'withdraw@d-event.io', 'Withdraw money', 'you have a request for wiithdrawing ' + amount + ' euro form user wallet that have id "' + user.id + '", email "' + user.email + '" and name "' + user.name + '" the deserved amount is "' + deserved + '"');

                    return ResponseService.SuccessResponse(res, 'the Wallet has been updated successfully ', createdWallet);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    assert: async function(req, res) {
        try {
            let id = req.param('id');
            let selectedWallet = await Wallet.findOne({ where: { id: id } });
            let saferpay = await sails.helpers.saferwallet(id, selectedWallet.user_id, "assert");
            if (saferpay.Transaction) {
                await Wallet.update({ transaction_id: saferpay.Transaction.Id }, { where: { id: id } });
                return ResponseService.SuccessResponse(res, 'the wallet has been updated for transaction success ', selectedWallet);
            } else {
                await selectedWallet.destroy();
                return ResponseService.SuccessResponse(res, 'the wallet has been deleted because transaction failure ', selectedWallet);
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    }
};