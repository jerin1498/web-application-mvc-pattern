const nodemailer = require('nodemailer');
const sendinBlue = require('nodemailer-sendinblue-transport');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = `${process.env.EMAIL_FROM}`    
    }

    newTransport() {

        if (process.env.NODE_ENV === 'production') { //for mailtrap api use any one
            return nodemailer.createTransport({  // FOR MAIL TRAP  for
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })}
        // if (process.env.NODE_ENV === 'production') {  for sendinblue api
        //     return nodemailer.createTransport(sendinBlue({
        //         apiKey: '0dkG4X1fypJ3v8hr',
        //         apiUrl: 'https://api.sendinblue.com/v2.0'
        //     }));
        // }
        return nodemailer.createTransport({  // FOR MAIL TRAP  for
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    // send actual mail
    async send(template, subject) {
        //1 render html based on pug template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );

        //2 define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        // create transport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!')
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'your password reset token (valid for only 10 min)'
        );
    }
}





// const sendEmail = async options => {   simple way to send email
//     // 1 creating transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });
//     // 2 define the email options
//     const mailOptions = {
//         from: 'Jerin-dev <jerindev@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     };
//     // 3 actually send the mail
//     await transporter.sendMail(mailOptions);
// };


// module.exports = sendEmail;