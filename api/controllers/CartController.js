/**
 * CartController
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
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    if (myCart) {
                        return ResponseService.SuccessResponse(res, 'success for getting my cart', myCart);
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
    addTickets: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var tickets = req.body.tickets;
                    var myCart = await Cart.findOne({ where: { owner_id: decode.id } });
                    if (myCart) {
                        for (let i = 0; i < tickets.length; i++) {
                            if (tickets[i].quantity > 10) {
                                return ResponseService.ErrorResponse(res, "you can't buy more than 10 tickets");
                            }
                            var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                            if (tickets[i].quantity > oneTicket.current_quantity) {
                                return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                            }
                            let SelectedCartTicket = await CartTickets.findOne({
                                where: {
                                    cart_id: myCart.id,
                                    TicketId: tickets[i].id
                                }
                            });
                            if (SelectedCartTicket) {
                                SelectedCartTicket.quantity += tickets[i].quantity
                                if (SelectedCartTicket.quantity > 10) {
                                    return ResponseService.ErrorResponse(res, 'you can not have more than 10 tickets of ' + oneTicket.name);
                                }
                                if (SelectedCartTicket.quantity == 0) {
                                    await SelectedCartTicket.destroy();
                                } else {
                                    await SelectedCartTicket.save();
                                }
                            } else {
                                if (tickets[i].quantity > 10) {
                                    return ResponseService.ErrorResponse(res, 'you can not have more than 10 tickets of ' + oneTicket.name);
                                }
                                await CartTickets.create({
                                    quantity: tickets[i].quantity,
                                    TicketId: tickets[i].id,
                                    cart_id: myCart.id,
                                });
                            }
                        }
                    } else {
                        let CartParam = { owner_id: decode.id }
                        let CreatedCart = await Cart.create(CartParam);
                        for (let i = 0; i < tickets.length; i++) {
                            var oneTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                            if (tickets[i].quantity > 10) {
                                return ResponseService.ErrorResponse(res, 'you can not have more than 10 tickets of ' + oneTicket.name);
                            }
                            if (tickets[i].quantity > oneTicket.current_quantity) {
                                return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneTicket.name);
                            }
                            await CartTickets.create({
                                quantity: tickets[i].quantity,
                                TicketId: tickets[i].id,
                                cart_id: CreatedCart.id
                            });
                        }
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    if (myCart) {
                        return ResponseService.SuccessResponse(res, 'success for getting my cart', myCart);
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
    addItems: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var items = req.body.items;
                    var myCart = await Cart.findOne({ where: { owner_id: decode.id } });
                    if (myCart) {
                        for (let i = 0; i < items.length; i++) {
                            var oneItem = await Item.findOne({ where: { id: items[i].id } });
                            if (items[i].quantity > oneItem.current_quantity) {
                                return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneItem.name);
                            }
                            let SelectedCartItem = await CartItems.findOne({
                                where: {
                                    cart_id: myCart.id,
                                    ItemId: items[i].id
                                }
                            });
                            if (SelectedCartItem) {
                                SelectedCartItem.quantity += items[i].quantity
                                if (SelectedCartItem.quantity > 10) {
                                    return ResponseService.ErrorResponse(res, 'you can not have more than 10 items of ' + oneItem.name);
                                }
                                if (SelectedCartItem.quantity == 0) {
                                    await SelectedCartItem.destroy();
                                } else {
                                    await SelectedCartItem.save();
                                }
                            } else {
                                if (items[i].quantity > 10) {
                                    return ResponseService.ErrorResponse(res, 'you can not have more than 10 items of ' + oneItem.name);
                                }
                                await CartItems.create({
                                    quantity: items[i].quantity,
                                    ItemId: items[i].id,
                                    cart_id: myCart.id,
                                });
                            }
                        }
                    } else {
                        let CartParam = { owner_id: decode.id }
                        let CreatedCart = await Cart.create(CartParam);
                        for (let i = 0; i < items.length; i++) {
                            var oneItem = await Item.findOne({ where: { id: items[i].id } });
                            if (items[i].quantity > oneItem.current_quantity) {
                                return ResponseService.ErrorResponse(res, 'no more available quantity of ' + oneItem.name);
                            }
                            if (items[i].quantity > 10) {
                                return ResponseService.ErrorResponse(res, 'you can not have more than 10 items of ' + oneItem.name);
                            }
                            await CartItems.create({
                                quantity: items[i].quantity,
                                ItemId: items[i].id,
                                cart_id: CreatedCart.id
                            });
                        }
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    if (myCart) {
                        return ResponseService.SuccessResponse(res, 'success for getting my cart', myCart);
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
    removeTicket: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var myCart = await Cart.findOne({ where: { owner_id: decode.id } });
                    var id = req.param('id');
                    let SelectedCartTicket = await CartTickets.findOne({
                        where: {
                            cart_id: myCart.id,
                            TicketId: id
                        }
                    });
                    if (SelectedCartTicket) {
                        SelectedCartTicket.destroy();
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    if (myCart) {
                        return ResponseService.SuccessResponse(res, 'success for getting my cart', myCart);
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
    removeItem: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var myCart = await Cart.findOne({ where: { owner_id: decode.id } });
                    var id = req.param('id');
                    let SelectedCartItem = await CartItems.findOne({
                        where: {
                            cart_id: myCart.id,
                            ItemId: id
                        }
                    });
                    if (SelectedCartItem) {
                        SelectedCartItem.destroy();
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['owner_id'] = decode.id;
                    var myCart = await Cart.findOne(filterOBJ);
                    if (myCart) {
                        return ResponseService.SuccessResponse(res, 'success for getting my cart', myCart);
                    } else {
                        return ResponseService.ErrorResponse(res, 'your cart is empty');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};