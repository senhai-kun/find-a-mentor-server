const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports.sendMail = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASS,
        },
        port: 465,
        secure: true,
        host: 'smtp.gmail.com'
    });

    try {
        let data = await transporter.sendMail({
            from: `Find A Mentor <findamentor123@gmail.com>`,
            to: to,
            subject: subject,
            text: text,
            html: `
          <div
            class="container"
            style="max-width: 90%; margin: auto; padding-top: 20px"
          >
            <h2>Find A Mentor: PASSWORD RESET</h2>
        
            <p style="margin-bottom: 30px;">You recently requested to reset your account password.</p>
            <h1> <a href="${text}" target="_blank">Reset Password</a>  </h1>
            
          </div>
          `,
        });

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            error,
            msg: "Error sending email...: " + error,
        };
    }
};

module.exports.sendMentorEmail = async ({ cc, from, to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASS,
        },
    });

    try {
        let data = await transporter.sendMail({
            from: from,
            to: to,
            cc: cc,
            bcc: "findamentor123@gmail.com",
            subject: subject,
            text: text,
            html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Static Template</title>
  </head>
  <body>
    <table style="margin: 0 auto; border-spacing: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 15px; width: 600px; color: #404040">  

      <tbody style="background: #f6f6f6; border-radius: 20px">
        <tr style="width: 100%;>
          <td style="padding-top: 20px; padding-bottom: 5px; width: 100%;">
            <div style="text-align: center; margin-top: 10px;" >
                <span >
                    <img width="50px" height="50px" alt="logo" src="https://res.cloudinary.com/find-a-mentor/image/upload/v1666233700/final_x8lpbb.png" />
                    <h2 style="margin-left: 10px; " >Find A Mentor</h2>
                </span>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 35px; padding-top: 10px; padding-bottom: 20px;">
            <div
              style=" background: #fff; border-radius: 3px; border: 2px solid #cacaca; padding: 5px;">
<p style="white-space: pre-wrap; margin: 0; line-height: 25px; padding-left: 10px; padding-right: 10px;">
${text}
</p>
              <div style="width: 100%; border-top: 1px solid #dedede" ></div>
              
              <span style="padding: 20px 30px; display: block;">
              
                
                <br />
                <span style="display: inline-block; margin-top: 20px; line-height: 22px;">
                    This email is sent via <a href="https://find-mentor.vercel.app" target="_blank">Find A Mentor</a>
                </span>
              </span>
            </div>
         </td>
        </tr>
        <!-- <tr>
          <td colspan="2" style="padding: 0 35px 20px; font-size: 12px; color: #53546d; line-height: 17px;" align="center">
          The material in this email may be confidential, privileged and/or protected by copyright.<br />Use of this email should be limited accordingly. If this email has been sent to you in error, please contact us immediately.
          </td>
        </tr> -->
      </tbody>
    </table>
  </body>
</html>
            `,
        });

        return {
            success: true,
            data,
            msg: `Email successfully sent to ${to.map((i) => i).join(", ")}`,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            error,
            msg: "Error sending email...: " + error,
        };
    }
};
