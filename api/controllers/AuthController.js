/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var bcrypt = require('bcrypt');
module.exports = {
    register: async function(req, res) {
        try {
            let userObj = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                VAT: req.body.VAT
            }
            if (userObj.name && userObj.email && userObj.password && userObj.VAT) {
                let user = await User.findOne({ where: { email: userObj.email } });
                if (user) {
                    return ResponseService.ErrorResponse(res, 'this email is already registered', {});
                }
                let final_user = await sails.helpers.createUser(userObj);
                final_user['token'] = JwtService.issue({
                    id: final_user['id']
                });

                let blockchainOBJ = {
                    'id': final_user.id,
                    'companyname': final_user.name,
                    'companymail': final_user.email,
                    'companyaddress': 'Test',
                    'businessarea': 'Test',
                    'companyVAT': final_user.VAT
                }
                await sails.helpers.blockchain('createpro', blockchainOBJ);
                return ResponseService.SuccessResponse(res, 'success signup as user', final_user);
            } else {
                return ResponseService.ErrorResponse(res, 'please provide all user data');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'somthing wrong happen', e);
        }
    },
    registerConsumer: async function(req, res) {
        try {
            let userObj = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                device_token: req.body.device_token,
                gender: req.body.gender,
                VAT: 0
            }
            if (userObj.name && userObj.email && userObj.password) {
                let user = await User.findOne({ where: { email: userObj.email } });
                if (user) {
                    return ResponseService.ErrorResponse(res, 'this email is already registered', {});
                }
                let final_user = await sails.helpers.createUser(userObj);
                final_user['token'] = JwtService.issue({
                    id: final_user['id']
                });

                let blockchainOBJ = {
                    'id': final_user.id,
                    'name': final_user.name,
                    'mail': final_user.email
                }
                await sails.helpers.blockchain('createclient', blockchainOBJ);
                return ResponseService.SuccessResponse(res, 'success signup as consumer', final_user);
            } else {
                return ResponseService.ErrorResponse(res, 'please provide all consumer data');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'somthing wrong happen', e);
        }
    },
    registerFB: async function(req, res) {
        try {
            let userObj = {
                name: req.body.name,
                email: req.body.email,
                password: "123456",
                fb_id: req.body.fb_id,
                device_token: req.body.device_token,
                VAT: 0
            }
            if (userObj.name && userObj.email && userObj.fb_id) {
                let user = await User.findOne({ where: { email: userObj.email } });
                if (user) {
                    return ResponseService.ErrorResponse(res, 'this email is already registered', {});
                }
                let final_user = await sails.helpers.createUser(userObj);
                final_user['token'] = JwtService.issue({
                    id: final_user['id']
                });
                let blockchainOBJ = {
                    'id': final_user.id,
                    'name': final_user.name,
                    'mail': final_user.email
                }
                await sails.helpers.blockchain('createclient', blockchainOBJ);
                return ResponseService.SuccessResponse(res, 'success signup as consumer', final_user);
            } else {
                return ResponseService.ErrorResponse(res, 'please provide all consumer data');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'somthing wrong happen', e);
        }
    },
    login: async function(req, res) {
        try {
            let email = req.body.email;
            let password = req.body.password;
            if (email && password) {
                let user = await User.findOne({
                    where: { email: email },
                    attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'password', 'device_token']
                });
                if (user) {
                    let passordSame = await bcrypt.compare(password, user.password);
                    if (passordSame) {
                        var final_user = user.toJSON();
                        final_user['token'] = JwtService.issue({
                            id: final_user['id']
                        });
                        if (req.body.device_token) {
                            let userObj = { device_token: req.body.device_token };
                            let SelectedUser = await User.findOne({ where: { id: final_user['id'] } });
                            await SelectedUser.update(userObj);
                        }
                        return ResponseService.SuccessResponse(res, 'success in login user ', final_user);
                    } else {
                        return ResponseService.ErrorResponse(res, 'please provide the correct email and password');
                    }
                } else {
                    return ResponseService.ErrorResponse(res, 'please provide the correct email and password')
                }
            } else {
                return ResponseService.ErrorResponse(res, 'please provide the correct email and password');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'some thing wrong happen', e);
        }
    },
    loginFB: async function(req, res) {
        try {
            let fb_id = req.body.fb_id;
            if (fb_id) {
                let user = await User.findOne({
                    where: { fb_id: fb_id },
                    attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'password', 'device_token']
                });
                if (user) {
                    var final_user = user.toJSON();
                    final_user['token'] = JwtService.issue({
                        id: final_user['id']
                    });
                    if (req.body.device_token) {
                        let userObj = { device_token: req.body.device_token };
                        let SelectedUser = await User.findOne({ where: { id: final_user['id'] } });
                        await SelectedUser.update(userObj);
                    }
                    return ResponseService.SuccessResponse(res, 'success in login user ', final_user);
                } else {
                    return ResponseService.ErrorResponse(res, 'please provide the correct facebook ID')
                }
            } else {
                return ResponseService.ErrorResponse(res, 'please provide the correct facebook ID');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'some thing wrong happen', e);
        }
    },
    verifyToken: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let AuthUser = await User.findOne({ where: { id: decode.id } });
                    return ResponseService.SuccessResponse(res, 'success in varify token as ', AuthUser);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    logout: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let AuthUser = await User.findOne({ where: { id: decode.id } });
                    await AuthUser.update({ device_token: 'xxx' });
                    return ResponseService.SuccessResponse(res, 'success in varify token as ', AuthUser);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    forget: async function(req, res) {
        try {
            let email = req.body.email;
            let selectedUser = await User.findOne({ where: { email: email } });
            if (selectedUser) {
                let min = 1000000000;
                let max = 9999999999;
                let randomX = "d" + Math.floor(Math.random() * (max - min + 1)) + min;
                await selectedUser.update({ passwordRestToken: randomX });
                let html = `<!DOCTYPE html
                PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
                                            <b>D-event</b><br />
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="padding: 40px; color:#000;text-align:center;">
                            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 40px; color:#000;text-align:center;"><b>You are receiving this email because we received a password reset request for your account.</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
            
                        <div class="social" style="text-align:center">
            
                            <a target="_blank"
                                style="background-color: #01447f;border: none;color: white;padding: 10px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;border-radius: 20px;"
                                href="http://bydotpy.com/d-event/auth/reset/` + randomX + `">Reset Password</a>
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
                            <p> Powered by D-event <br>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            
            </html>
            `;
                await sails.helpers.sendMail('D-event <info@d-event.io>', email, 'Reset password', html);
                return ResponseService.SuccessResponse(res, 'success for sending your email', selectedUser);
            } else {
                return ResponseService.ErrorResponse(res, 'This email is not found');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'somthing wrong happen', e);
        }
    },
    reset: async function(req, res) {
        try {
            let token = req.body.token;
            let password = req.body.password;
            let selectedUser = await User.findOne({ where: { passwordRestToken: token } });
            if (selectedUser) {
                let hash = await bcrypt.hash(password, 10);
                await selectedUser.update({ password: hash, passwordRestToken: null });
                return ResponseService.SuccessResponse(res, 'success for reseting your password', selectedUser);
            } else {
                return ResponseService.ErrorResponse(res, 'This token is not found');
            }
        } catch (e) {
            console.log(e);
            return ResponseService.ErrorResponse(res, 'somthing wrong happen', e);
        }
    },
    edit: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let userObj = {
                        name: req.body.name,
                        email: req.body.email,
                        VAT: req.body.VAT,
                        gender: req.body.gender,
                        Image_id: req.body.Image_id,
                        address: req.body.address,
                        phone: req.body.phone,
                        businessArea: req.body.businessArea,
                        bankAccount: req.body.bankAccount,
                        description: req.body.description,
                        registration_number: req.body.registration_number,
                        withdrawal: req.body.withdrawal
                    }
                    if (userObj.email) {
                        let user = await User.findOne({ where: { email: userObj.email } });
                        if (user && user.id != decode.id) {
                            return ResponseService.ErrorResponse(res, 'this email is already registered', {});
                        }
                    }
                    let SelectedUser = await User.findOne({ where: { id: decode.id } });
                    await SelectedUser.update(userObj);
                    return ResponseService.SuccessResponse(res, 'the user has been edited successfully', SelectedUser);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    favorite_categories: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let userObj = {
                        favorite_categories: req.body.favorite_categories
                    }
                    let SelectedUser = await User.findOne({ where: { id: decode.id } });
                    await SelectedUser.update(userObj);
                    return ResponseService.SuccessResponse(res, 'the user has been edited successfully', SelectedUser);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    find_user: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let email = req.body.email;
                    let selectedUser = await User.findOne({ where: { email: email } });
                    if (selectedUser && selectedUser.id == decode.id) {
                        return ResponseService.ErrorResponse(res, 'You can not search for your email');
                    }
                    let findUser = {
                        id: selectedUser.id,
                        name: selectedUser.name,
                        phone: selectedUser.phone,
                        email: selectedUser.email,
                        image: selectedUser.image
                    }
                    return ResponseService.SuccessResponse(res, 'success in get this user', findUser);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    delete_my_account: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let password = req.body.password
                    let userObj = {
                        isDeleted: true
                    }
                    let SelectedUser = await User.findOne({
                        where: { id: decode.id },
                        attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'password']
                    });
                    let passordSame = await bcrypt.compare(password, SelectedUser.password);
                    if (passordSame) {
                        await SelectedUser.update(userObj);
                        return ResponseService.SuccessResponse(res, 'the user has been deleted successfully', SelectedUser);
                    } else {
                        return ResponseService.ErrorResponse(res, 'please provide the correct password');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    cancel_delete_my_account: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let password = req.body.password
                    let userObj = {
                        isDeleted: false
                    }
                    let SelectedUser = await User.findOne({
                        where: { id: decode.id },
                        attributes: ['id', 'name', 'phone', 'email', 'address', 'VAT', 'businessArea', 'bankAccount', 'favorite_categories', 'isDeleted', 'gender', 'withdrawal', 'description', 'registration_number', 'password']
                    });
                    let passordSame = await bcrypt.compare(password, SelectedUser.password);
                    if (passordSame) {
                        await SelectedUser.update(userObj);
                        return ResponseService.SuccessResponse(res, 'the user has been deleted successfully', SelectedUser);
                    } else {
                        return ResponseService.ErrorResponse(res, 'please provide the correct password');
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};