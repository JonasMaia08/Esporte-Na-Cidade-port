import express, { Request, Response } from "express";
import multer, { File as MulterFile } from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configuração do Multer com armazenamento em memória
const upload = multer({ storage: multer.memoryStorage() });

// Pasta de destino para salvar as imagens
const uploadDir = path.join(__dirname, "../../public/uploads");

// Certifique-se de que a pasta "uploads" existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rota POST para upload de imagens
router.post(
  "/upload",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  async (
    req: Request & { files?: { [fieldname: string]: MulterFile[] } },
    res: Response
  ) => {
    try {
      if (!req.files) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const files = req.files as {
        [fieldname: string]: MulterFile[];
      };

      const urls: { profile?: string; document?: string } = {};

      // Processar a imagem "profile"
      if (files.profile && files.profile[0]) {
        const profileFile = files.profile[0];
        const profileFilename = `profile-${Date.now()}.jpeg`;
        const profilePath = path.join(uploadDir, profileFilename);

        await sharp(profileFile.buffer)
          .resize(400) // Redimensionar para 400px de largura
          .jpeg({ quality: 80 }) // Converter para JPEG com qualidade 80
          .toFile(profilePath);

        urls.profile = `${req.protocol}://${req.get("host")}/uploads/${profileFilename}`;
      }

      // Processar a imagem "document"
      if (files.document && files.document[0]) {
        const documentFile = files.document[0];
        const documentFilename = `document-${Date.now()}.jpeg`;
        const documentPath = path.join(uploadDir, documentFilename);

        await sharp(documentFile.buffer)
          .resize(1200) // Redimensionar para 1200px de largura
          .jpeg({ quality: 90 }) // Converter para JPEG com qualidade 90
          .toFile(documentPath);

        urls.document = `${req.protocol}://${req.get("host")}/uploads/${documentFilename}`;
      }

      // Retornar as URLs públicas das imagens
      res.status(200).json(urls);
    } catch (error) {
      console.error("Erro ao processar upload:", error);
      res.status(500).json({ error: "Erro ao processar upload." });
    }
  }
);

export default router;