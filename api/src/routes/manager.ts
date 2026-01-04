import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import { AppDataSource } from "../database/config";
import { Manager } from "../entities/manager.entity";
import { Roles } from "../enums/roles.enum";
import { Modality } from "../entities/modality.entity";

import { Token } from "../entities/token.entity";
import {
  PASSWORD_RESET_BODY_TEMPLATE,
  sendEmail,
} from "../services/email-service";
import { isPasswordValid } from "../utils/isPasswordValid";

const router = express.Router();
const managerRepository = AppDataSource.getRepository(Manager);
const modalityRepository = AppDataSource.getRepository(Modality);
const tokenRepository = AppDataSource.getRepository(Token);

// Função auxiliar para desenhar tabelas
function drawTable(
  doc: PDFDocument,
  table: { headers: string[]; rows: string[][] },
  columnWidths: number[],
  borderColor: string = "#cccccc" // Cor padrão cinza claro
) {
  const leftMargin = 50;
  const startX = leftMargin;
  const startY = doc.y;
  const lineHeight = 20;
  const padding = 6; // Espaçamento interno
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Desenha borda externa da tabela
  doc
    .rect(startX, startY, tableWidth, (table.rows.length + 1) * lineHeight)
    .stroke(borderColor);

  // Cabeçalho com fundo cinza
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#333333");

  let x = startX;
  table.headers.forEach((header, i) => {
    // Borda vertical entre colunas
    if (i > 0) {
      doc
        .moveTo(x, startY)
        .lineTo(x, startY + (table.rows.length + 1) * lineHeight)
        .stroke(borderColor);
    }

    doc.text(header, x + padding, startY + padding, {
      width: columnWidths[i] - padding * 2,
      align: "center",
      lineBreak: false,
    });
    x += columnWidths[i];
  });

  // Linhas de dados
  doc.font("Helvetica").fontSize(10).fillColor("#000000");

  table.rows.forEach((row, rowIndex) => {
    const y = startY + (rowIndex + 1) * lineHeight;

    // Linha horizontal entre linhas
    doc
      .moveTo(startX, y)
      .lineTo(startX + tableWidth, y)
      .stroke(borderColor);

    x = startX;
    row.forEach((cell, cellIndex) => {
      // Borda vertical entre colunas
      if (cellIndex > 0) {
        doc
          .moveTo(x, y)
          .lineTo(x, y + lineHeight)
          .stroke(borderColor);
      }

      doc.text(cell, x + padding, y + padding, {
        width: columnWidths[cellIndex] - padding * 2,
        align: "center",
        lineBreak: false,
      });
      x += columnWidths[cellIndex];
    });
  });

  // Atualiza posição do cursor
  doc.y = startY + (table.rows.length + 1) * lineHeight + 15;
  doc.x = leftMargin;
}

router
  .get("/relatorio-geral-download", async (req: Request, res: Response) => {
    console.log("Gerando relatório completo com detalhamento mensal");

    // 1. Consulta para os totais gerais (funciona em SQLite)
    const report = await modalityRepository
      .createQueryBuilder("modality")
      .leftJoinAndSelect("modality.teachers", "teacher")
      .leftJoin(
        "modality.enrollments",
        "enrollment",
        "enrollment.approved = :approved AND enrollment.active = :active",
        { approved: true, active: true }
      )
      .leftJoin("enrollment.athlete", "athlete")
      // Subquery for unique class dates
      .leftJoin(
        "(SELECT modalityId, strftime('%m', created_at) as month_num, strftime('%Y-%m-%d %H:%M:%S', created_at) as class_date FROM atendiment GROUP BY modalityId, strftime('%m', created_at), strftime('%Y-%m-%d %H:%M:%S', created_at))",
        "unique_classes",
        "unique_classes.modalityId = modality.id"
      )
      // Regular join for attendance counts
      .leftJoin("modality.atendiments", "atendiment")
      .select([
        "modality.id AS modality_id",
        "modality.name AS modality_name",
        "teacher.name AS teacher_name",
        "COUNT(DISTINCT athlete.id) AS total_alunos_ativos",
        // Unique class sessions
        "COUNT(DISTINCT unique_classes.class_date) AS total_atendimentos",
        // Corrected attendance counts
        "(SELECT COUNT(*) FROM atendiment a WHERE a.modalityId = modality.id AND a.present = 1) AS total_presencas",
        "(SELECT COUNT(*) FROM atendiment a WHERE a.modalityId = modality.id AND a.present = 0) AS total_faltas",
      ])
      .groupBy("modality.id, teacher.id, modality.name, teacher.name")
      .getRawMany();

    console.log("Gerando relatório de detalhamento");
    // 2. Consulta para detalhamento mensal (adaptada para SQLite)
    const monthlyDetails = await modalityRepository
      .createQueryBuilder("modality")
      // Subquery for monthly unique classes
      .leftJoin(
        "(SELECT modalityId, strftime('%m', created_at) as month_num, date(created_at) as class_date FROM atendiment GROUP BY modalityId, strftime('%m', created_at), date(created_at))",
        "monthly_classes",
        "monthly_classes.modalityId = modality.id"
      )
      // Regular join for attendance counts
      .leftJoin("modality.atendiments", "atendiment")
      .select([
        "modality.id AS modality_id",
        "monthly_classes.month_num AS month_number",
        "CASE monthly_classes.month_num " +
          "WHEN '01' THEN 'Janeiro' " +
          "WHEN '02' THEN 'Fevereiro' " +
          "WHEN '03' THEN 'Março' " +
          "WHEN '04' THEN 'Abril' " +
          "WHEN '05' THEN 'Maio' " +
          "WHEN '06' THEN 'Junho' " +
          "WHEN '07' THEN 'Julho' " +
          "WHEN '08' THEN 'Agosto' " +
          "WHEN '09' THEN 'Setembro' " +
          "WHEN '10' THEN 'Outubro' " +
          "WHEN '11' THEN 'Novembro' " +
          "WHEN '12' THEN 'Dezembro' " +
          "END AS month_name",
        "COUNT(DISTINCT monthly_classes.class_date) AS aulas_no_mes",
        "(SELECT COUNT(*) FROM atendiment a WHERE a.modalityId = modality.id AND a.present = 1 AND strftime('%m', a.created_at) = monthly_classes.month_num) AS presencas",
        "(SELECT COUNT(*) FROM atendiment a WHERE a.modalityId = modality.id AND a.present = 0 AND strftime('%m', a.created_at) = monthly_classes.month_num) AS faltas",
      ])
      .groupBy("modality.id, monthly_classes.month_num")
      .orderBy("modality.id, monthly_classes.month_num")
      .getRawMany();

    console.log("Mapeando os dados");
    // 3. Processamento dos dados
    const formattedReport = report.map((modality) => {
      const details = monthlyDetails
        .filter((detail) => detail.modality_id === modality.modality_id)
        .map((month) => {
          const totalRecords = month.presencas + month.faltas;
          return {
            mes: month.month_name,
            aulas: month.aulas_no_mes,
            presencas: month.presencas,
            faltas: month.faltas,
            taxa_presenca:
              totalRecords > 0
                ? ((month.presencas / totalRecords) * 100).toFixed(2) + "%"
                : "0%",
          };
        });
      // const totalAtendimentos = modality.total_atendimentos || 0;
      // const totalFaltas = modality.total_faltas || 0;
      // const totalPresencas = totalAtendimentos - totalFaltas;

      // const totalPresencas = details.reduce((sum, m) => sum + m.presencas, 0);
      // const totalFaltas = details.reduce((sum, m) => sum + m.faltas, 0);
      // const totalAtendimentos = totalPresencas + totalFaltas;

      const totalRecords = modality.total_presencas + modality.total_faltas;

      return {
        modalidade: modality.modality_name,
        professor: modality.teacher_name || "Não atribuído",
        alunos_ativos: modality.total_alunos_ativos,
        totais: {
          atendimentos: modality.total_atendimentos,
          presencas: modality.total_presencas,
          faltas: modality.total_faltas,
          taxa_presenca:
            totalRecords > 0
              ? ((modality.total_presencas / totalRecords) * 100).toFixed(2) +
                "%"
              : "0%",
        },
        detalhamento_mensal: details,
      };
    });
    // 3. Criar o PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    console.log("Gerando PDF");
    // Configurar cabeçalho para download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_geral_${new Date().toLocaleDateString()}.pdf`
    );

    // Pipe do PDF para a resposta HTTP
    doc.pipe(res);

    // 4. Adicionar conteúdo ao PDF
    doc
      .fontSize(20)
      .text("Relatório de Presenças", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, {
        align: "center",
      })
      .moveDown(2);

    console.log("Gerando detalhes de cada modalidade");
    // 5. Adicionar dados de cada modalidade
    formattedReport.forEach((modality, index) => {
      if (index > 0) {
        doc.addPage(); // Nova página para cada modalidade
      }

      // Cabeçalho da modalidade
      doc
        .fontSize(16)
        .fillColor("#333333")
        .text(modality.modalidade, { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Professor: ${modality.professor}`)
        .text(`Alunos ativos: ${modality.alunos_ativos}`)
        .moveDown(1);

      // Tabela de totais
      doc.fontSize(14).text("Totais:", { underline: true }).moveDown(0.5);

      const totals = modality.totais;
      const totalsTable = {
        headers: ["Atendimentos", "Presenças", "Faltas", "Taxa"],
        rows: [
          [
            totals.atendimentos.toString(),
            totals.presencas.toString(),
            totals.faltas.toString(),
            totals.taxa_presenca,
          ],
        ],
      };

      drawTable(doc, totalsTable, [120, 100, 100, 100]);
      doc.moveDown(1.5);

      console.log("Gerando detalhes de cada mês");
      // Tabela de detalhamento mensal
      doc
        .fontSize(14)
        .text("Detalhamento Mensal:", { underline: true })
        .moveDown(0.5);

      const monthlyTable = {
        headers: ["Mês", "Atendimentos", "Presenças", "Faltas", "Taxa"],
        rows: modality.detalhamento_mensal.map((m) => [
          m.mes,
          m.aulas.toString(),
          m.presencas.toString(),
          m.faltas.toString(),
          m.taxa_presenca,
        ]),
      };

      drawTable(doc, monthlyTable, [100, 100, 90, 90, 90]);
    });

    // Finalizar o PDF
    doc.end();
    console.log("Relatorio finalizado e enviado");
  })
  .get("/relatorio-geral", async (req: Request, res: Response) => {
    console.log("Gerando relatório completo com detalhamento mensal");

    // 1. Consulta para os totais gerais (funciona em SQLite)
    const report = await modalityRepository
      .createQueryBuilder("modality")
      .leftJoinAndSelect("modality.teachers", "teacher")
      .leftJoin(
        "modality.enrollments",
        "enrollment",
        "enrollment.approved = :approved AND enrollment.active = :active",
        {
          approved: true,
          active: true,
        }
      )
      .leftJoin("enrollment.athlete", "athlete")
      .leftJoin("modality.atendiments", "atendiment")
      .leftJoin(
        "modality.atendiments",
        "atendiment_faltas",
        "atendiment_faltas.present = :present",
        { present: false }
      )
      .select([
        "modality.id AS modality_id",
        "modality.name AS modality_name",
        "teacher.name AS teacher_name",
        "COUNT(DISTINCT athlete.id) AS total_alunos_ativos",
        "COUNT(DISTINCT atendiment.id) AS total_atendimentos",
        "COUNT(DISTINCT atendiment_faltas.id) AS total_faltas",
      ])
      .groupBy("modality.id, teacher.id")
      .getRawMany();

    console.log("Gerando relatório de detalhamento");
    // 2. Consulta para detalhamento mensal (adaptada para SQLite)
    const monthlyDetails = await modalityRepository
      .createQueryBuilder("modality")
      .leftJoin("modality.atendiments", "atendiment")
      .select([
        "modality.id AS modality_id",
        "strftime('%m', atendiment.created_at) AS month_number",
        "CASE strftime('%m', atendiment.created_at) " +
          "WHEN '01' THEN 'Janeiro' " +
          "WHEN '02' THEN 'Fevereiro' " +
          "WHEN '03' THEN 'Março' " +
          "WHEN '04' THEN 'Abril' " +
          "WHEN '05' THEN 'Maio' " +
          "WHEN '06' THEN 'Junho' " +
          "WHEN '07' THEN 'Julho' " +
          "WHEN '08' THEN 'Agosto' " +
          "WHEN '09' THEN 'Setembro' " +
          "WHEN '10' THEN 'Outubro' " +
          "WHEN '11' THEN 'Novembro' " +
          "WHEN '12' THEN 'Dezembro' " +
          "END AS month_name",
        "COUNT(DISTINCT date(atendiment.created_at)) AS dias_com_atendimento",
        "SUM(CASE WHEN atendiment.present = 1 THEN 1 ELSE 0 END) AS presencas",
        "SUM(CASE WHEN atendiment.present = 0 THEN 1 ELSE 0 END) AS faltas",
      ])
      .groupBy("modality.id, month_number")
      .orderBy("modality.id, month_number")
      .getRawMany();

    console.log("Mapeando os dados");
    // 3. Processamento dos dados
    const formattedReport = report.map((modality) => {
      const details = monthlyDetails
        .filter((detail) => detail.modality_id === modality.modality_id)
        .map((month) => {
          const total = month.presencas + month.faltas;
          return {
            mes: month.month_name,
            dias_com_atendimento: month.dias_com_atendimento,
            presencas: month.presencas,
            faltas: month.faltas,
            taxa_presenca:
              total > 0
                ? ((month.presencas / total) * 100).toFixed(2) + "%"
                : "0%",
          };
        });

      const totalAtendimentos = modality.total_atendimentos || 0;
      const totalFaltas = modality.total_faltas || 0;
      const totalPresencas = totalAtendimentos - totalFaltas;

      return {
        modalidade: modality.modality_name,
        professor: modality.teacher_name || "Não atribuído",
        alunos_ativos: modality.total_alunos_ativos,
        totais: {
          aulas: modality.total_aulas,
          registros: modality.total_registros,
          presencas: modality.total_presencas,
          faltas: modality.total_faltas,
          taxa_presenca:
            modality.total_registros > 0
              ? (
                  (modality.total_presencas / modality.total_registros) *
                  100
                ).toFixed(2) + "%"
              : "0%",
        },
        detalhamento_mensal: details,
      };
    });

    return res.json(formattedReport);
  });

//grafico
router.get("/relatorio-graficos", async (req: Request, res: Response) => {
  try {
    const atendimentosPorMes = await modalityRepository
      .createQueryBuilder("modality")
      .select([
        "strftime('%m', atendiment.created_at) AS month_number",
        "CASE strftime('%m', atendiment.created_at) " +
          "WHEN '01' THEN 'Janeiro' " +
          "WHEN '02' THEN 'Fevereiro' " +
          "WHEN '03' THEN 'Março' " +
          "WHEN '04' THEN 'Abril' " +
          "WHEN '05' THEN 'Maio' " +
          "WHEN '06' THEN 'Junho' " +
          "WHEN '07' THEN 'Julho' " +
          "WHEN '08' THEN 'Agosto' " +
          "WHEN '09' THEN 'Setembro' " +
          "WHEN '10' THEN 'Outubro' " +
          "WHEN '11' THEN 'Novembro' " +
          "WHEN '12' THEN 'Dezembro' " +
          "END AS month_name",
        "COUNT(DISTINCT date(atendiment.created_at)) AS total_atendimentos",
      ])
      .leftJoin("modality.atendiments", "atendiment")
      .groupBy("month_number")
      .orderBy("month_number")
      .getRawMany();

    const atendimentosPorModalidade = await modalityRepository
      .createQueryBuilder("modality")
      .select([
        "modality.id AS modality_id",
        "modality.name AS modality_name",
        "COUNT(DISTINCT atendiment.created_at) AS total_atendimentos",
      ])
      .leftJoin("modality.atendiments", "atendiment")
      .groupBy("modality.id")
      .orderBy("total_atendimentos", "DESC")
      .getRawMany();

    const presencasFaltas = await modalityRepository
      .createQueryBuilder("modality")
      .select([
        "SUM(CASE WHEN atendiment.present = 1 THEN 1 ELSE 0 END) AS total_presencas",
        "SUM(CASE WHEN atendiment.present = 0 THEN 1 ELSE 0 END) AS total_faltas",
      ])
      .leftJoin("modality.atendiments", "atendiment")
      .getRawOne();

    const graphData = {
      atendimentosPorMes: atendimentosPorMes.map(item => ({
        month: item.month_name,
        total: item.total_atendimentos
      })),

      atendimentosPorModalidade: atendimentosPorModalidade.map(item => ({
        modality: item.modality_name,
        total: item.total_atendimentos
      })),
      presencasFaltas: {
        presencas: presencasFaltas.total_presencas,
        faltas: presencasFaltas.total_faltas,
        taxa_presenca: presencasFaltas.total_presencas > 0 
          ? ((presencasFaltas.total_presencas / (presencasFaltas.total_presencas + presencasFaltas.total_faltas)) * 100).toFixed(2)
          : 0
      }
    };

    return res.json(graphData);
  } catch (error) {
    console.error("Error generating graph data:", error);
    return res.status(500).json({ error: "Failed to generate graph data" });
  }
})

router
  .get("/relatorio-graficos", async (req: Request, res: Response) => {
    try {
      // 1. Get total atendiments by month (for bar graph)
      const atendimentosPorMes = await modalityRepository
        .createQueryBuilder("modality")
        .select([
          "strftime('%m', atendiment.created_at) AS month_number",
          "CASE strftime('%m', atendiment.created_at) " +
            "WHEN '01' THEN 'Janeiro' " +
            "WHEN '02' THEN 'Fevereiro' " +
            "WHEN '03' THEN 'Março' " +
            "WHEN '04' THEN 'Abril' " +
            "WHEN '05' THEN 'Maio' " +
            "WHEN '06' THEN 'Junho' " +
            "WHEN '07' THEN 'Julho' " +
            "WHEN '08' THEN 'Agosto' " +
            "WHEN '09' THEN 'Setembro' " +
            "WHEN '10' THEN 'Outubro' " +
            "WHEN '11' THEN 'Novembro' " +
            "WHEN '12' THEN 'Dezembro' " +
            "END AS month_name",
          "COUNT(DISTINCT strftime('%Y-%m-%d %H:%M:%S', atendiment.created_at)) AS total_atendimentos",
        ])
        .leftJoin("modality.atendiments", "atendiment")
        .groupBy("month_number")
        .orderBy("month_number")
        .getRawMany();

      // 2. Get total atendiments by modality (for bar graph)
      const atendimentosPorModalidade = await modalityRepository
        .createQueryBuilder("modality")
        .select([
          "modality.id AS modality_id",
          "modality.name AS modality_name",
          "COUNT(DISTINCT date(atendiment.created_at)) AS total_atendimentos",
        ])
        .leftJoin("modality.atendiments", "atendiment")
        .groupBy("modality.id")
        .orderBy("total_atendimentos", "DESC")
        .getRawMany();

      // 3. Get presence/absence data (for pie chart)
      const presencasFaltas = await modalityRepository
        .createQueryBuilder("modality")
        .select([
          "SUM(CASE WHEN atendiment.present = 1 THEN 1 ELSE 0 END) AS total_presencas",
          "SUM(CASE WHEN atendiment.present = 0 THEN 1 ELSE 0 END) AS total_faltas",
        ])
        .leftJoin("modality.atendiments", "atendiment")
        .getRawOne();

      // Format the data for front-end consumption
      const graphData = {
        // For monthly atendiments bar chart
        atendimentosPorMes: atendimentosPorMes.map((item) => ({
          month: item.month_name,
          total: item.total_atendimentos,
        })),

        // For modality atendiments bar chart
        atendimentosPorModalidade: atendimentosPorModalidade.map((item) => ({
          modality: item.modality_name,
          total: item.total_atendimentos,
        })),

        // For presence/absence pie chart
        presencasFaltas: {
          presencas: presencasFaltas.total_presencas,
          faltas: presencasFaltas.total_faltas,
          taxa_presenca:
            presencasFaltas.total_presencas > 0
              ? (
                  (presencasFaltas.total_presencas /
                    (presencasFaltas.total_presencas +
                      presencasFaltas.total_faltas)) *
                  100
                ).toFixed(2)
              : 0,
        },
      };

      return res.json(graphData);
    } catch (error) {
      console.error("Error generating graph data:", error);
      return res.status(500).json({ error: "Failed to generate graph data" });
    }
  })
  .get("/", async (req: Request, res: Response) => {
    try {
      const managers = await managerRepository.find();
      res.json(managers);
    } catch (error) {
      console.error("Erro ao buscar gerentes:", error.message);
      console.error(error.stack);
      res
        .status(500)
        .json({ message: "Erro ao buscar gerentes.", error: error.message });
    }
  })
  .get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const managerId = parseInt(req.params.id, 10);

      if (isNaN(managerId)) {
        return res.status(400).json("ID de gerente inválido.");
      }

      const manager = await managerRepository.findOneBy({ id: managerId });
      if (!manager) {
        return res.status(404).json("Gerente não encontrado.");
      }

      res.status(200).json(manager);
    } catch (error) {
      console.error("Erro ao buscar gerente:", error);
      res.status(500).json("Erro ao buscar gerente.");
    }
  })
  .post("/", async (req: Request, res: Response) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const manager = managerRepository.create({
        ...req.body,
        password: hashedPassword,
        role: Roles.MANAGER,
      });

      await managerRepository.save(manager);
      res.status(201).json(manager);
    } catch (error) {
      console.error("Erro ao criar gerente:", error);
      res.status(500).json("Erro ao criar gerente.");
    }
  })
  .put("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const managerId = parseInt(req.params.id, 10);

      if (isNaN(managerId)) {
        return res.status(400).json("ID de gerente inválido.");
      }

      const manager = await managerRepository.findOneBy({ id: managerId });
      if (!manager) {
        return res.status(404).json("Gerente não encontrado.");
      }

      manager.name = req.body.name || manager.name;
      manager.cpf = req.body.cpf || manager.cpf;
      manager.rg = req.body.rg || manager.rg;
      manager.birthday = req.body.birthday || manager.birthday;
      manager.phone = req.body.phone || manager.phone;
      manager.photo_url = req.body.photo_url || manager.photo_url;
      manager.email = req.body.email || manager.email;

      if (req.body.password) {
        manager.password = await bcrypt.hash(req.body.password, 10);
      }

      await managerRepository.save(manager);
      res.status(200).json(manager);
    } catch (error) {
      console.error("Erro ao atualizar gerente:", error);
      res.status(500).json("Erro ao atualizar gerente.");
    }
  })
  .delete("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const managerId = parseInt(req.params.id, 10);

      if (isNaN(managerId)) {
        return res.status(400).json("ID de gerente inválido.");
      }

      const manager = await managerRepository.findOneBy({ id: managerId });
      if (!manager) {
        return res.status(404).json("Gerente não encontrado.");
      }

      manager.active = false;
      await managerRepository.save(manager);
      res.status(200).json("Gerente deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar gerente:", error);
      res.status(500).json("Erro ao deletar gerente.");
    }
  })
  .post("/password-reset", async (req, res) => {
    try {
      if (!req.body.email) {
        return res
          .status(400)
          .send({ error: "The manager's e-mail is required" });
      }

      const manager = await managerRepository.findOneBy({
        email: req.body.email,
      });

      if (!manager)
        return res
          .status(400)
          .send({ error: "A manager with the given e-mail doesn't exist" });

      var token = await tokenRepository.findOne({
        where: { manager: { id: manager.id } },
      });

      if (!token) {
        token = tokenRepository.create({
          manager: manager,
          token: crypto.randomBytes(32).toString("hex"),
        });

        await tokenRepository.save(token);
      }

      const link = `${process.env.BASE_URL}/manager/password-reset/${manager.id}/${token.token}`;

      let email_body = PASSWORD_RESET_BODY_TEMPLATE.replace(
        "{{user_name}}",
        manager.name
      ).replace("{{reset_link}}", link);

      await sendEmail(manager.email, "Password reset", email_body);

      res.send({ message: "password reset link sent to your email account" });
    } catch (error) {
      res.send("An error occured");
      console.log(error);
    }
  })
  .post("/password-reset/:managerId/:token", async (req, res) => {
    try {
      if (!isPasswordValid(req.body.password)) {
        res
          .status(400)
          .send(
            "Password must have at least 8 characters. At least 1 uppercase and 1 lowercase letter. At least one digit. At least one special character"
          );
        return;
      }

      const manager = await managerRepository.findOneBy({
        id: Number(req.params.managerId),
      });

      if (!manager) return res.status(400).send("invalid link or expired");

      const token = await tokenRepository.findOne({
        where: {
          manager: { id: manager.id },
          token: req.params.token,
        },
        relations: ["manager"],
      });

      if (!token) return res.status(400).send("Invalid link or expired");

      manager.password = await bcrypt.hash(req.body.password, 10);

      await managerRepository.save(manager);
      await tokenRepository.delete(token);

      res.send("password reset sucessfully.");
    } catch (error) {
      res.send("An error occured");
      console.log(error);
    }
  });

export default router;
