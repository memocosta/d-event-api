/**
 * PosController
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
                    var id = req.param('id');
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['project_id'] = id;
                    filterOBJ['include'] = [{
                            model: Ticket,
                            as: 'tickets',
                        },
                        {
                            model: Item,
                            as: 'items',
                        },
                    ];
                    var PointsOfSales = await Pos.findAll(filterOBJ);
                    return ResponseService.SuccessResponse(res, 'success for getting points of sales', PointsOfSales);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    getById: async function(req, res) {
        try {
            var id = req.param('id');
            let filterOBJ = { where: {} };
            filterOBJ['where']['id'] = id;
            filterOBJ['include'] = [{
                    model: Ticket,
                    as: 'tickets',
                },
                {
                    model: Item,
                    as: 'items',
                },
            ];
            var PointsOfSales = await Pos.findOne(filterOBJ);
            return ResponseService.SuccessResponse(res, 'success for getting points of sales', PointsOfSales);
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
                    var id = req.param('id');
                    var selectedProject = await Project.findOne({ where: { id: id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }

                    var tickets = req.body.tickets;
                    var items = req.body.items;
                    if (items.length == 0 && tickets.length == 0) {
                        return ResponseService.ErrorResponse(res, 'No Tickets or Items are selected');
                    }
                    let PosParam = {
                        project_id: id,
                        name: req.body.name,
                        exchange: req.body.exchange,
                        pin_code: req.body.pin_code
                    }
                    var CreatedPos = await Pos.create(PosParam);
                    for (let i = 0; i < tickets.length; i++) {
                        var selectedTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                        if (selectedTicket.user_id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'some tickets belongs to someone else ');
                        }
                        if (selectedTicket.project_id != id) {
                            return ResponseService.ErrorResponse(res, 'some tickets belongs to project else ');
                        }
                        await PosTickets.create({
                            TicketId: tickets[i].id,
                            pos_id: CreatedPos.id
                        });
                    }
                    for (let i = 0; i < items.length; i++) {
                        var selectedItem = await Item.findOne({ where: { id: items[i].id } });
                        if (selectedItem.user_id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'some items belongs to someone else ');
                        }
                        if (selectedItem.project_id != id) {
                            return ResponseService.ErrorResponse(res, 'some items belongs to project else ');
                        }
                        await PosItems.create({
                            ItemId: items[i].id,
                            pos_id: CreatedPos.id
                        });
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['id'] = CreatedPos.id;
                    filterOBJ['include'] = [{
                            model: Ticket,
                            as: 'tickets',
                        },
                        {
                            model: Item,
                            as: 'items',
                        },
                    ]
                    var CreatedPos = await Pos.findOne(filterOBJ);
                    return ResponseService.SuccessResponse(res, 'the pos has been created successfully ', CreatedPos);
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
                    var id = req.param('id');
                    var updatedPos = await Pos.findOne({ where: { id: id } });
                    var selectedProject = await Project.findOne({ where: { id: updatedPos.project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    var tickets = req.body.tickets;
                    var items = req.body.items;
                    if (items.length == 0 && tickets.length == 0) {
                        return ResponseService.ErrorResponse(res, 'No Tickets or Items are selected');
                    }
                    let PosParam = {
                        name: req.body.name,
                        exchange: req.body.exchange,
                        pin_code: req.body.pin_code
                    }
                    await updatedPos.update(PosParam);
                    await PosTickets.destroy({ where: { pos_id: id } });
                    await PosItems.destroy({ where: { pos_id: id } });
                    for (let i = 0; i < tickets.length; i++) {
                        var selectedTicket = await Ticket.findOne({ where: { id: tickets[i].id } });
                        if (selectedTicket.user_id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'some tickets belongs to someone else ');
                        }
                        if (selectedTicket.project_id != updatedPos.project_id) {
                            return ResponseService.ErrorResponse(res, 'some tickets belongs to project else ');
                        }
                        await PosTickets.create({
                            TicketId: tickets[i].id,
                            pos_id: updatedPos.id
                        });
                    }
                    for (let i = 0; i < items.length; i++) {
                        var selectedItem = await Item.findOne({ where: { id: items[i].id } });
                        if (selectedItem.user_id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'some items belongs to someone else ');
                        }
                        if (selectedItem.project_id != updatedPos.project_id) {
                            return ResponseService.ErrorResponse(res, 'some items belongs to project else ');
                        }
                        await PosItems.create({
                            ItemId: items[i].id,
                            pos_id: updatedPos.id
                        });
                    }
                    let filterOBJ = { where: {} };
                    filterOBJ['where']['id'] = updatedPos.id;
                    filterOBJ['include'] = [{
                            model: Ticket,
                            as: 'tickets',
                        },
                        {
                            model: Item,
                            as: 'items',
                        },
                    ]
                    var updatedPos = await Pos.findOne(filterOBJ);
                    return ResponseService.SuccessResponse(res, 'the pos has been updated successfully ', updatedPos);
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
                    var id = req.param('id');
                    var deletedPos = await Pos.findOne({ where: { id: id } });
                    var selectedProject = await Project.findOne({ where: { id: deletedPos.project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    }
                    await deletedPos.destroy();
                    await PosTickets.destroy({ where: { pos_id: id } });
                    await PosItems.destroy({ where: { pos_id: id } });
                    return ResponseService.SuccessResponse(res, 'the pos has been deleted successfully ', deletedPos);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    check: async function(req, res) {
        try {
            let qr = req.body.qr;
            let selectedPOS = await PosQR.findOne({ where: { qr: qr } });
            if (selectedPOS) {
                return ResponseService.SuccessResponse(res, selectedPOS);
            } else {
                return ResponseService.ErrorResponse(res, 'some thing happen in this code');
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
};