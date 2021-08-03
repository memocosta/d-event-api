/**
 * TicketController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');
module.exports = {
    index: async function(req, res) {
        try {
            let project_id = req.param('id');
            if ((!project_id || project_id < 1)) {
                return ResponseService.ErrorResponse(res, 'please determine the project id');
            }
            let selectedTickets = await Ticket.findAll({
                where: {
                    project_id: project_id,
                    channel: 'everywhere'
                }
            });
            return ResponseService.SuccessResponse(res, 'success for getting all tickets', selectedTickets);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    indexPro: async function(req, res) {
        try {
            let project_id = req.param('id');
            if ((!project_id || project_id < 1)) {
                return ResponseService.ErrorResponse(res, 'please determine the project id');
            }
            let selectedTickets = await Ticket.findAll({
                where: { project_id: project_id }
            });
            return ResponseService.SuccessResponse(res, 'success for getting all tickets', selectedTickets);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    myTickets: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let type = req.param('type');
                    let filterOBJ = { where: {} };
                    switch (type) {
                        case 'entry':
                            filterOBJ['where']['type'] = 'entry';
                            break;
                        case 'service':
                            filterOBJ['where']['type'] = 'service';
                            break;
                        default:
                            filterOBJ['where']['type'] = {
                                [Sequelize.Op.not]: ['entry', 'service']
                            };
                            break;
                    }
                    filterOBJ['include'] = [{
                        model: OrderTickets,
                        as: 'orderTickets',
                        where: { user_id: decode.id, is_hidden: 0, is_refunded: 0, is_accessed: 0 }
                    }];
                    let selectedTickets = await Ticket.findAll(filterOBJ);
                    for (let i = 0; i < selectedTickets.length; i++) {
                        if (selectedTickets[i].project.ongoing) {
                            if (moment().isAfter(selectedTickets[i].to)) {
                                selectedTickets[i].isOutdated = true;
                            }
                        } else {
                            if (moment().isAfter(selectedTickets[i].project.to)) {
                                selectedTickets[i].isOutdated = true;
                            } else {
                                if (moment().isAfter(selectedTickets[i].to)) {
                                    selectedTickets[i].isOutdated = true;
                                }
                            }
                        }
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting my tickets', selectedTickets);
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
            let selectedTicket = await Ticket.findOne({ where: { id: id } });
            return ResponseService.SuccessResponse(res, 'success for getting all data about ticket', selectedTicket);
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
                    let ticketObj = req.body;
                    if (ticketObj.quantity <= 0) {
                        return ResponseService.ErrorResponse(res, 'it is not acceptable to be quantity equal or less than zero');
                    }
                    ticketObj.current_quantity = ticketObj.quantity;
                    ticketObj.project_id = req.param('id');
                    if ((!ticketObj.project_id || ticketObj.project_id < 1)) {
                        return ResponseService.ErrorResponse(res, 'please determine the project id');
                    }
                    ticketObj.user_id = decode.id;
                    let selectedProject = await Project.findOne({ where: { id: ticketObj.project_id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    } else {
                        let createdTicket = await Ticket.create(ticketObj);
                        return ResponseService.SuccessResponse(res, 'the tickets has been created successfully ', createdTicket);
                    }
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
                    let selectedTicket = await Ticket.findOne({ where: { id: id } });
                    if (selectedTicket.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this ticket belongs to someone else ');
                    } else {
                        await selectedTicket.destroy();
                        return ResponseService.SuccessResponse(res, 'the ticket has been deleted successfully ', selectedTicket);
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
                    let ticketObj = req.body;
                    let updatedTicket = await Ticket.findOne({ where: { id: id } });
                    if (updatedTicket.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this ticket belongs to someone else ');
                    }
                    if (ticketObj.project_id) {
                        return ResponseService.ErrorResponse(res, 'you can not edit project id');
                    }
                    if (ticketObj.user_id) {
                        return ResponseService.ErrorResponse(res, 'you can not edit user id');
                    }
                    if (ticketObj.quantity) {
                        let qu = await CartTickets.sum('quantity', { where: { TicketId: id } });
                        ticketObj.current_quantity = ticketObj.quantity - qu;
                    }

                    let start = new Date(ticketObj.from);
                    let end = new Date(ticketObj.to);
                    let NOW = new Date();
                    if (!ticketObj.validity && end <= start) {
                        return ResponseService.ErrorResponse(res, 'the end time must be bigger than the start time of event');
                    }
                    if (!ticketObj.validity && start < NOW) {
                        return ResponseService.ErrorResponse(res, 'the start time of event must be bigger than the time of now');
                    }

                    await updatedTicket.update(ticketObj);
                    return ResponseService.SuccessResponse(res, 'the ticket has been updated successfully ', updatedTicket);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    transfer: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let _id = req.body._id;
                    let ticketObj = { user_id: req.body.user_id };
                    let updatedTicket = await OrderTickets.findOne({ where: { _id: _id } });
                    if (updatedTicket.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this ticket belongs to someone else ');
                    }
                    if (!req.body.message) {
                        return ResponseService.ErrorResponse(res, 'the message field is required');
                    }
                    await updatedTicket.update(ticketObj);

                    let sender = await User.findOne({ where: { id: decode.id } });
                    let user = await User.findOne({ where: { id: req.body.user_id } });
                    let oneTicket = await Ticket.findOne({ where: { id: updatedTicket.ticket_id } });
                    let token = user.device_token;

                    let obj = {
                        user_id: req.body.user_id,
                        partner_id: decode.id,
                        ticket_id: updatedTicket.ticket_id,
                        title: sender.name + ' sent you a new ticket ' + oneTicket.name,
                        body: 'you have a new ticket "' + _id + '" from ' + sender.name,
                        type: 'other'
                    }
                    await Notifications.create(obj);

                    let notificationOBJ = {
                        token: token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);

                    let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                    <html xmlns="http://www.w3.org/1999/xhtml">
                    
                    <head>
                        <meta name="viewport" content="width=device-width" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <link href="https://fonts.googleapis.com/css?family=Markazi+Text:500&display=swap" rel="stylesheet">
                        <title>D-event</title>
                    </head>
                    
                    <body style="margin:0px; background: #F8F8F8; text-align:right">
                        <div width="100%"
                            style="background: #F8F8F8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                            <div
                                style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px;background: url('http://localhost:3000/images/devent-logo-text-300x123.png'); background-size: 100% 100%; ">
                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px">
                                    <tbody>
                                        <tr>
                                            <td style="vertical-align: top; padding-bottom:30px;" align="center">
                                                <a href="javascript:void(0)" target="_blank">
                                                    <b>Hello</b><br />
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div style="padding: 40px; color:#000;text-align:center;">
                                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 40px; color:#000;text-align:center;"><b>You just received a new ticket "` + oneTicket.name + `" from "` + sender.name + `"</b>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                    
                                <div class="social" style="text-align:center">
                                    <a target="_blank"
                                        style="background-color: #01447f;border: none;color: white;padding: 10px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;border-radius: 20px;"
                                        href="https://d-event.io/">LINK TO APP</a>
                                </div>

                                <div style="padding: 40px; color:#000;text-align:center;">
                                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 40px; color:#000;text-align:center;"><b>Enjoy!</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <style>
                                    * {
                                        font-family: 'Markazi Text', serif;
                                        font-size: 18px
                                    }
                    
                                    .social {
                                        margin: 10px auto;
                                        width: 50%;
                                        text-align: center;
                                    }
                    
                                    .social p {
                                        color: #000;
                                        padding-right: 10px;
                                    }
                    
                                    .social img {
                                        width: 40px;
                                        height: 40px;
                                        border-radius: 50%;
                                    }
                                </style>
                                <div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px">
                                    <p>D-EVENT</p>
                                    <p><b>Support : </b> info@d-event.io</p>
                                    <p><b>Website : </b> d-event.io</p>
                                    <p>Decentralized event platform</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    
                    </html>
                    `;

                    await sails.helpers.sendMail(sender.name + ' <' + sender.email + '>', user.email, 'New ticket for you', html);

                    return ResponseService.SuccessResponse(res, 'the ticket has been transfered successfully ', updatedTicket);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    hide: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let whereOBJ = {
                        ticket_id: req.param('id'),
                        user_id: decode.id
                    }
                    let updatedOrderTickets = await OrderTickets.update({ is_hidden: 1 }, { where: whereOBJ });

                    return ResponseService.SuccessResponse(res, 'the ticket has been hidden successfully ', updatedOrderTickets);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    refund: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let _id = req.body._id;
                    let updatedTicket = await OrderTickets.findOne({ where: { _id: _id } });
                    let oneTicket = await Ticket.findOne({ where: { id: updatedTicket.ticket_id } });
                    if (updatedTicket.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this ticket belongs to someone else ');
                    }
                    if (!oneTicket.refundable) {
                        return ResponseService.ErrorResponse(res, 'this ticket is not refundable ');
                    }
                    await updatedTicket.update({ is_refunded: 1 });

                    let user = await User.findOne({ where: { id: decode.id } });

                    await sails.helpers.sendMail(user.name + ' <' + user.email + '>', 'report@d-event.io', 'New Ticket refunded', 'you have a refund request about this ticket that have id "' + _id + '" and name "' + oneTicket.name + '"');

                    return ResponseService.SuccessResponse(res, 'the request of refund sent to administration ', updatedTicket);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    confirm_refund: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let _id = req.body._id;
                    let updatedTicket = await OrderTickets.findOne({ where: { _id: _id } });
                    let oneTicket = await Ticket.findOne({ where: { id: updatedTicket.ticket_id } });
                    if (oneTicket.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this ticket belongs to someone else ');
                    }
                    let new_current_quantity = Number(oneTicket.current_quantity) + 1
                    await updatedTicket.update({ is_refunded: 2, current_quantity: new_current_quantity });

                    let sender = await User.findOne({ where: { id: decode.id } });
                    let partner = await User.findOne({ where: { id: updatedTicket.user_id } });

                    let history = [];
                    let body = {
                        amount: -1 * oneTicket.price,
                        partner_id: partner.id,
                        user_id: decode.id,
                        status: 'You refunded ' + oneTicket.price + ' euros to "' + partner.name + '" for ticket "' + oneTicket.name + '"',
                    }
                    let createdWallet = await Wallet.create(body);
                    history.push(createdWallet);

                    let body2 = {
                        amount: oneTicket.price,
                        partner_id: decode.id,
                        user_id: partner.id,
                        status: 'You received ' + oneTicket.price + ' euros from "' + sender.name + '" for refunding ticket "' + oneTicket.name + '"'
                    }
                    let createdWallet2 = await Wallet.create(body2);
                    history.push(createdWallet2);

                    obj = {
                        user_id: partner.id,
                        partner_id: decode.id,
                        title: 'Accept Refund',
                        body: 'You received ' + oneTicket.price + ' euros from "' + sender.name + '" for refunding ticket "' + oneTicket.name + '"',
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

                    return ResponseService.SuccessResponse(res, 'the request of refund sent to administration ', updatedTicket);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    check: async function(req, res) {
        try {
            let _id = req.body._id;
            let orderTicket = await OrderTickets.findOne({ where: { _id: _id } });
            return ResponseService.SuccessResponse(res, orderTicket);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    access: async function(req, res) {
        try {
            let _id = req.body._id;
            let orderTicket = await OrderTickets.findOne({ where: { _id: _id } });
            await orderTicket.update({ is_accessed: 1 });
            return ResponseService.SuccessResponse(res, orderTicket);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    }
};