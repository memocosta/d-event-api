/**
 * GeneralController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var randomstring = require('randomstring');
module.exports = {
    projectTypes: async function(req, res) {
        try {
            const types = [
                { key: "0", text: "Appearance or Signing", value: "Appearance or Signing" },
                { key: "1", text: "Attraction", value: "attraction" },
                { key: "2", text: "Camp, Trip, or Retreat", value: "Camp, Trip, or Retreat" },
                { key: "3", text: "Class, Training, or Workshop", value: "Class, Training, or Workshop" },
                { key: "4", text: "Concert or Performance", value: "Concert or Performance" },
                { key: "5", text: "Conference", value: "Conference" },
                { key: "6", text: "Convention", value: "Convention" },
                { key: "7", text: "Dinner or Gala", value: "Dinner or Gala" },
                { key: "8", text: "Festival or Fair", value: "Festival or Fair" },
                { key: "9", text: "Game or Competition", value: "Game or Competition" },
                { key: "10", text: "Meeting or Networking Event", value: "Meeting or Networking Event" },
                { key: "11", text: "Attraction Party or Social Gathering", value: "Party or Social Gathering" },
                { key: "12", text: "Race or Endurance Event", value: "Race or Endurance Event" },
                { key: "13", text: "Rally", value: "Rally" },
                { key: "14", text: "Screening", value: "Screening" },
                { key: "15", text: "Seminar or Talk", value: "Seminar or Talk" },
                { key: "16", text: "Tour", value: "Tour" },
                { key: "17", text: "Tournament", value: "Tournament" },
                { key: "18", text: "Tradeshow, Consumer Show, or Expo", value: "Tradeshow, Consumer Show, or Expo" },
                { key: "19", text: "Other", value: "Other" },
            ];

            return ResponseService.SuccessResponse(res, 'success for getting my project types', types);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    projectCategories: async function(req, res) {
        try {
            const categories = [
                { key: "0", text: "Auto, Boat & Air", value: "Auto, Boat & Air" },
                { key: "1", text: "Business & Professional", value: "Business & Professional" },
                { key: "2", text: "Charity & Causes", value: "Charity & Causes" },
                { key: "3", text: "Community & Culture", value: "Community & Culture" },
                { key: "4", text: "Family & Education", value: "Family & Education" },
                { key: "5", text: "Fashion & Beauty", value: "Fashion & Beauty" },
                { key: "6", text: "Film, Media & Entertainment", value: "Film, Media & Entertainment" },
                { key: "7", text: "Travel & Outdoor", value: "Travel & Outdoor" },
                { key: "8", text: "Food & Drink", value: "Food & Drink" },
                { key: "9", text: "Government & Politics", value: "Government & Politics" },
                { key: "10", text: "Health & Wellness", value: "Health & Wellness" },
                { key: "11", text: "Hobbies & Special Interest", value: "Hobbies & Special Interest" },
                { key: "12", text: "Home & Lifestyle", value: "Home & Lifestyle" },
                { key: "13", text: "Music", value: "Music" },
                { key: "14", text: "Performing & Visual Arts", value: "Performing & Visual Arts" },
                { key: "15", text: "Religion & Spirituality", value: "Religion & Spirituality" },
                { key: "16", text: "School Activities", value: "School Activities" },
                { key: "17", text: "Science & Technology", value: "Science & Technology" },
                { key: "18", text: "Other Seasonal & Holiday", value: "Other Seasonal & Holiday" },
                { key: "19", text: "Sports & Fitness", value: "Sports & Fitness" },
                { key: "20", text: "Other", value: "Other" },
            ];
            if (req.headers.authorization) {
                let favCategories = [];
                JwtService.verify(req.headers.authorization, async(err, decode) => {
                    if (err) {
                        return ResponseService.ErrorResponse(res, 'unauthenticated user');
                    } else {
                        try {
                            let AuthUser = await User.findOne({ where: { id: decode.id } });
                            if (AuthUser.favorite_categories) {
                                for (let i = 0; i < categories.length; i++) {
                                    let isFavorite = false;
                                    if (AuthUser.favorite_categories.includes(categories[i].value)) {
                                        isFavorite = true;
                                    }
                                    let cat = {
                                        key: categories[i].key,
                                        text: categories[i].text,
                                        value: categories[i].value,
                                        isFavorite: isFavorite,
                                    };
                                    favCategories.push(cat);
                                }
                            } else {
                                for (let i = 0; i < categories.length; i++) {
                                    let cat = {
                                        key: categories[i].key,
                                        text: categories[i].text,
                                        value: categories[i].value,
                                        isFavorite: false,
                                    };
                                    favCategories.push(cat);
                                }
                            }
                            return ResponseService.SuccessResponse(res, 'success for getting my project categories', favCategories);
                        } catch (er) {
                            console.log(er);
                            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                        }
                    }
                });
            } else {
                return ResponseService.SuccessResponse(res, 'success for getting my project categories', categories);
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    getCountries: async function(req, res) {
        try {
            const countries = [
                { key: "at", text: "Austria", flag: "at", value: "Austria" },
                { key: "be", text: "Belgium", flag: "be", value: "Belgium" },
                { key: "bg", text: "Bulgaria", flag: "bg", value: "Bulgaria" },
                { key: "hr", text: "Croatia", flag: "hr", value: "Croatia" },
                { key: "cz", text: "Czech Republic", flag: "cz", value: "Czech Republic" },
                { key: "dk", text: "Denmark", flag: "dk", value: "Denmark" },
                { key: "ee", text: "Estonia", flag: "ee", value: "Estonia" },
                { key: "fi", text: "Finland", flag: "fi", value: "Finland" },
                { key: "fr", text: "France", flag: "fr", value: "France" },
                { key: "de", text: "Germany", flag: "de", value: "Germany" },
                { key: "gr", text: "Greece", flag: "gr", value: "Greece" },
                { key: "hu", text: "Hungary", flag: "hu", value: "Hungary" },
                { key: "ie", text: "Ireland", flag: "ie", value: "Ireland" },
                { key: "it", text: "Italy", flag: "it", value: "Italy" },
                { key: "lv", text: "Latvia", flag: "lv", value: "Latvia" },
                { key: "lt", text: "Lithuania", flag: "lt", value: "Lithuania" },
                { key: "lu", text: "Luxembourg", flag: "lu", value: "Luxembourg" },
                { key: "mt", text: "Malta", flag: "mt", value: "Malta" },
                { key: "nl", text: "Netherlands", flag: "nl", value: "Netherlands" },
                { key: "pl", text: "Poland", flag: "pl", value: "Poland" },
                { key: "pt", text: "Portugal", flag: "pt", value: "Portugal" },
                { key: "ro", text: "Romania", flag: "ro", value: "Romania" },
                { key: "sk", text: "Slovakia", flag: "sk", value: "Slovakia" },
                { key: "si", text: "Slovenia", flag: "si", value: "Slovenia" },
                { key: "es", text: "Spain", flag: "es", value: "Spain" },
                { key: "se", text: "Sweden", flag: "se", value: "Sweden" },
                { key: "gb", text: "United Kingdom", flag: "gb", value: "United Kingdom" },
            ];
            return ResponseService.SuccessResponse(res, 'success for getting  countries', countries);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    contact_support: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let email = req.body.email;
                    let message = req.body.message;
                    let user = await User.findOne({ where: { id: decode.id } });
                    await sails.helpers.sendMail(user.name + ' <' + email + '>', 'support@d-event.io', 'New Contact Support', message);
                    return ResponseService.SuccessResponse(res, 'success for sending your email to Administration ', req.body);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    report_company: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let company_id = req.param('company');
                    let company = await User.findOne({ where: { id: company_id } });
                    let user = await User.findOne({ where: { id: decode.id } });
                    await sails.helpers.sendMail(user.name + ' <' + user.email + '>', 'report@d-event.io', 'New Company Report', 'you have a report about this company that have id "' + company_id + '" and name "' + company.name + '"');
                    return ResponseService.SuccessResponse(res, 'success for sending your feedback about this provider to Administration ', company);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    report_ticket: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let ticket_id = req.param('ticket');
                    let ticket = await Ticket.findOne({ where: { id: ticket_id } });
                    let user = await User.findOne({ where: { id: decode.id } });
                    await sails.helpers.sendMail(user.name + ' <' + user.email + '>', 'report@d-event.io', 'New Ticket Report', 'you have a report about this ticket that have id "' + ticket_id + '" and name "' + ticket.name + '"');
                    return ResponseService.SuccessResponse(res, 'success for sending your feedback about this ticket to Administration ', ticket);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    uploadImg: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let base = req.body.base;
                    let For = req.body.for;
                    let name = new Date().getTime();
                    let image = await sails.helpers.uploadImage(base, name, 'd-events - ' + For, 'd-events - ' + For, For, 220, 220);
                    return ResponseService.SuccessResponse(res, 'success for getting image', image);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    viva: async function(req, res) {
        try {
            let type = req.param('type');
            let viva_id = req.param('s') + '-viva';
            let selectedWallet = await Wallet.findOne({ where: { viva_id: viva_id } });
            if (type == "success") {
                let transaction_id = req.param('t');
                await Wallet.update({ transaction_id: transaction_id }, { where: { viva_id: viva_id } });
                return ResponseService.SuccessResponse(res, 'the wallet has been updated for transaction success ', selectedWallet);
            } else {
                if (selectedWallet.order_id) {
                    let selectedOrder = await Order.findOne({ where: { id: selectedWallet.order_id } });
                    await selectedOrder.destroy();
                }
                await selectedWallet.destroy();
                return ResponseService.SuccessResponse(res, 'the wallet has been deleted because transaction failure ', selectedWallet);
            }
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    send_email: async function(req, res) {
        var userToken = randomstring.generate(6);
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
                                                <td style="padding: 40px; color:#000;text-align:center;"><b>You just received a new ticket "` + userToken + `" from "` + userToken + `"</b>
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
        var c = await sails.helpers.sendMail('D-event <info@d-event.io>', 'm7moodali88@gmail.com', 'New report', html);
        return ResponseService.SuccessResponse(res, 'success for sending your email', userToken);
    }
};