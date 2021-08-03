var nodemailer = require('nodemailer');
// var ejs = require('ejs');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'deventio.mail@gmail.com', // your domain email address
        pass: '0SzkkIt5WJeS1w7a$r0c' // your password
    },
    tls: {
        rejectUnauthorized: false
    },
});
module.exports = {
    friendlyName: 'Send mail',
    description: '',
    inputs: {
        from: {
            type: 'string',
            required: true
        },
        to: {
            type: 'string',
            required: true
        },
        subject: {
            type: 'string',
            required: true
        },
        text: {
            type: 'string',
            required: true
        },
        token: {
            type: 'string',
            required: false
        }
    },
    exits: {},

    fn: async function(inputs, exits) {
        // var mailOptions = {
        //     from: 'D-event <info@d-event.io>',
        //     to: inputs.to,
        //     subject: 'New report',
        //     text: 'you have a report about this project 62 "test redirect"',
        // };
        var mailOptions = {
            from: inputs.from,
            to: inputs.to,
            subject: inputs.subject,
            html: inputs.text
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return exits.error(error);
            } else {
                return exits.success();
            }
        });
    }
};