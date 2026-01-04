import env from "../environment/env";
import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, text) => {
    try {
        console.log("\n\n\n\n");
        console.log("===================");
        console.log(env.APP_EMAIL);
        console.log(env.APP_EMAIL_PASSWORD);
        console.log("\n\n\n\n");
        

        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,   
            auth: {
                user: env.APP_EMAIL,
                pass: env.APP_EMAIL_PASSWORD,
            },
        });        

        await transporter.sendMail({
            from: env.APP_EMAIL,
            to: email,
            subject: subject,
            html: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

export const PASSWORD_RESET_BODY_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Redefinição de Senha - Esporte na Cidade</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="20" cellspacing="0" style="background-color: #ffffff; border-radius: 9px; border: 1px solid black; box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 1);">
          <tr>
            <td align="center" style="background-color: #EB8317; color: #ffffff; border-top-left-radius: 9px; border-top-right-radius: 9px;">
              <h1 style="margin: 0; padding: 20px;">Esporte na Cidade</h1>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 16px;">Olá {{user_name}},</p>
              <p style="font-size: 16px;">Recebemos uma solicitação para redefinir a senha associada à sua conta.</p>
              <p style="font-size: 16px;">Clique no botão abaixo para criar uma nova senha:</p>
              <p style="text-align: center;">
                <a href="{{reset_link}}" style="display: inline-block; background-color: #EB8317; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; border: 1px solid black;">Redefinir Senha</a>
              </p>
              <p style="font-size: 14px; color: #555;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.</p>
              <p style="font-size: 14px; color: #555;">Este link expirará em 1 hora por motivos de segurança.</p>
              <br>
              <p style="font-size: 16px;">Obrigado,<br>Equipe Esporte na Cidade</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 12px; color: #999;">
              <p>© 2025 Esporte na Cidade. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`