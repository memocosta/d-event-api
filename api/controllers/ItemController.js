/**
 * ItemController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
    index: async function(req, res) {
        try {
            let project_id = req.param('id');
            if ((!project_id || project_id < 1)) {
                return ResponseService.ErrorResponse(res, 'please determine the project id');
            }
            let selectedItems = await Item.findAll({
                attributes: {
                    include: [
                        [Sequelize.fn("COUNT", Sequelize.col("orderItems.item_id")), "ordersCount"]
                    ]
                },
                where: { project_id: project_id },
                include: [{
                    model: OrderItems,
                    as: 'orderItems',
                    attributes: ['_id', 'order_id']
                }],
                group: ['Item.id']
            });
            return ResponseService.SuccessResponse(res, 'success for getting all items', selectedItems);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    indexOfTicket: async function(req, res) {
        try {
            let ticket_id = req.param('id');
            if ((!ticket_id || ticket_id < 1)) {
                return ResponseService.ErrorResponse(res, 'please determine the ticket id');
            }
            let selectedItems = await Item.findAll({
                where: { ticket_id: ticket_id }
            });
            return ResponseService.SuccessResponse(res, 'success for getting all items', selectedItems);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    myItems: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let selectedItems = await Item.findAll({
                        where: { consumer_id: decode.id }
                    });
                    return ResponseService.SuccessResponse(res, 'success for getting my items', selectedItems);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    getById: async function(req, res) {
        try {
            let id = req.param('id');
            let selectedItem = await Item.findOne({ where: { id: id } });
            return ResponseService.SuccessResponse(res, 'success for getting all data about item', selectedItem);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    create: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let itemObj = req.body;
                    if (itemObj.quantity <= 0) {
                        return ResponseService.ErrorResponse(res, 'it is not acceptable to be quantity equal or less than zero');
                    }
                    if (itemObj.price <= 0) {
                        return ResponseService.ErrorResponse(res, 'it is not acceptable to be price equal or less than zero');
                    }
                    itemObj.current_quantity = itemObj.quantity;
                    itemObj.project_id = req.param('id');
                    if ((!itemObj.project_id || itemObj.project_id < 1)) {
                        return ResponseService.ErrorResponse(res, 'please determine the project id');
                    }
                    itemObj.user_id = decode.id;
                    let selectedProject = await Project.findOne({ where: { id: itemObj.project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    if (itemObj.ticket_id && itemObj.ticket_id != 0) {
                        let selectedTicket = await Ticket.findOne({ where: { id: itemObj.ticket_id } });
                        if (selectedTicket.project_id != itemObj.project_id) {
                            return ResponseService.ErrorResponse(res, 'this ticket belongs to another project ');
                        }
                    }
                    let createdItem = await Item.create(itemObj);
                    return ResponseService.SuccessResponse(res, 'the items has been created successfully ', createdItem);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    delete: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let selectedItem = await Item.findOne({ where: { id: id } });
                    if (selectedItem.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this item belongs to someone else ');
                    } else {
                        await selectedItem.destroy();
                        return ResponseService.SuccessResponse(res, 'the item has been deleted successfully ', selectedItem);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    edit: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let itemObj = req.body;
                    let updatedItem = await Item.findOne({ where: { id: id } });
                    if (updatedItem.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this item belongs to someone else ');
                    }
                    if (itemObj.project_id) {
                        return ResponseService.ErrorResponse(res, 'you can not edit project id');
                    }
                    if (itemObj.user_id) {
                        return ResponseService.ErrorResponse(res, 'you can not edit user id');
                    }
                    if (itemObj.quantity) {
                        let qu = await CartItems.sum('quantity', { where: { ItemId: id } });
                        itemObj.current_quantity = itemObj.quantity - qu;
                    }
                    await updatedItem.update(itemObj);
                    return ResponseService.SuccessResponse(res, 'the item has been updated successfully ', updatedItem);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};