/**
 * NotificationController.js
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
    index: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let notifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: 'other'
                        } 
                    });
                    let paymentNotifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: 'payment'
                        } 
                    });
                    let sendPaymentNotifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: 'send'
                        } 
                    });
                    let receivePaymentNotifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: 'receive'
                        } 
                    });
                    let dataset = {
                        notifications: notifications,
                        paymentNotifications: paymentNotifications,
                        sendPaymentNotifications: sendPaymentNotifications,
                        receivePaymentNotifications: receivePaymentNotifications
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting my notifications', dataset);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    create: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let user = await User.findOne({ where: { id: decode.id } });
                    let token = user.device_token;

                    let obj = {
                        user_id: decode.id,
                        title: req.body.title,
                        body: req.body.body,
                        type: req.body.type
                    }
                    let createdNotification = await Notifications.create(obj); 

                    let notificationOBJ = {
                        token: token,
                        body: obj.body,
                        title: obj.title,
                        type: obj.type
                    };
                    await sails.helpers.firebase.with(notificationOBJ);
                    return ResponseService.SuccessResponse(res, 'success send notification', createdNotification);
                } catch (err) {
                    return ResponseService.ErrorResponse(res, 'something wrong happen', { action: 'unkown-err', error: err })
                }
            }
        });
    },
    readNotifcations: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    await Notifications.update({ read : true },{ where : { user_id : decode.id, type: 'other' }});
                    let notifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: 'other'
                        } 
                    });
                    return ResponseService.SuccessResponse(res, 'the notifications has been updated successfully ', notifications);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    readPaymentNotifcations: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    await Notifications.update({ read : true },{ where : { user_id : decode.id, type: { [Sequelize.Op.not]: 'other'} }});
                    let notifications = await Notifications.findAll({ 
                        where: { 
                            user_id: decode.id,
                            type: { [Sequelize.Op.not]: 'other'}
                        } 
                    });
                    return ResponseService.SuccessResponse(res, 'the notifications has been updated successfully ', notifications);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    read: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let selectedNotification = await Notifications.findOne({ where: { id: id } });
                    if (selectedNotification.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this notification belongs to someone else ');
                    } else {
                        let notiObj = {read : true};
                        await selectedNotification.update(notiObj);
                        return ResponseService.SuccessResponse(res, 'the notification has been deleted successfully ', selectedNotification);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    delete: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let selectedNotification = await Notifications.findOne({ where: { id: id } });
                    if (selectedNotification.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this notification belongs to someone else ');
                    } else {
                        await selectedNotification.destroy();
                        return ResponseService.SuccessResponse(res, 'the notification has been deleted successfully ', selectedNotification);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};
