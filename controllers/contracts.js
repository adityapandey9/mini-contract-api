import { db } from "../db/client.js";
import { contracts } from "../drizzle/schema/contracts.js";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import { broadcastUpdate } from "../wss/index.js";

export const getContracts = async (req, res) => {
  try {
    let {
      id,
      title,
      status,
      party,
      condition,
      page = 1,
      limit = 10,
    } = req.query;

    try {
      page = parseInt(page);
    } catch (error) {
      return res.status(400).json({ message: "Enter a valid page number" });
    }

    if (Number.isInteger(page) && page < 1) {
      return res.status(400).json({ message: "Enter a valid page number" });
    }

    if (condition && condition !== "AND" && condition !== "OR") {
      return res
        .status(400)
        .json({ message: "Enter a valid condition AND, OR" });
    }

    const filters = [];

    if (id) filters.push(eq(contracts.id, Number(id)));
    if (status) filters.push(eq(contracts.status, status));
    if (title) filters.push(ilike(contracts.title, `%${title}%`));
    if (party) {
      filters.push(sql`
        EXISTS (
          SELECT 1 FROM unnest(${contracts.parties}) AS p(party)
          WHERE p.party ILIKE ${`%${party}%`}
        )
      `);
    }

    const offset = (Number(page) - 1) * Number(limit);

    let filterCondition = and(...filters);

    if (condition === "OR") {
      filterCondition = or(...filters);
    }

    const query = db
      .select()
      .from(contracts)
      .where(filterCondition)
      .limit(Number(limit))
      .offset(offset);
    const totalQuery = db
      .select({ count: sql`count(*)::int` })
      .from(contracts)
      .where(filterCondition);

    const [data, total] = await Promise.all([query, totalQuery]);

    res.json({
      total: Number(total[0]?.count || 0),
      contracts: data,
    });
  } catch (error) {
    console.error("Get Contracts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createContract = async (req, res) => {
  try {
    const { title, description, status, content, parties } = req.body;

    if (!title || !status || !content || !parties) {
      return res
        .status(400)
        .json({ message: "title, status, content, and parties are required" });
    }

    const result = await db
      .insert(contracts)
      .values({
        title,
        description,
        status,
        content,
        parties,
      })
      .returning();

    broadcastUpdate({ type: "created", contract: result[0] });

    res.status(201).json({ contract: result[0] });
  } catch (error) {
    console.error("Create Contract Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadContracts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileContent = fileBuffer.toString("utf-8");

    let contractsArray = [];

    try {
      contractsArray = JSON.parse(fileContent);
    } catch {
      contractsArray = fileContent
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    }

    if (!Array.isArray(contractsArray)) {
      contractsArray = [contractsArray];
    }

    const inserted = await db
      .insert(contracts)
      .values(
        contractsArray.map(
          ({ title, description, status, content, parties }) => ({
            title,
            description,
            status,
            content,
            parties,
          })
        )
      )
      .returning();

    broadcastUpdate({ type: "created", contracts: inserted });

    res.status(201).json({ inserted });
  } catch (err) {
    console.error("Upload Contract Error:", err);
    res.status(500).json({ message: "Failed to upload contracts" });
  }
};

export const updateContract = async (req, res) => {
  try {
    const contractId = Number(req.params.id);
    const { title, description, status, content, parties } = req.body;

    if (isNaN(contractId)) {
      return res.status(400).json({ message: "Invalid contract ID" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (content !== undefined) updateData.content = content;
    if (parties !== undefined) updateData.parties = parties;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updateData.updatedAt = new Date();

    const updated = await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, contractId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Contract not found" });
    }

    broadcastUpdate({ type: "updated", contract: updated[0] });

    res.json({ updated: updated[0] });
  } catch (error) {
    console.error("Update Contract Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteContract = async (req, res) => {
  try {
    const contractId = Number(req.params.id);

    if (isNaN(contractId)) {
      return res.status(400).json({ message: "Invalid contract ID" });
    }

    const deleted = await db
      .delete(contracts)
      .where(eq(contracts.id, contractId))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Contract not found" });
    }

    broadcastUpdate({ type: "deleted", contract: deleted[0] });

    res.json({ message: "Contract deleted", deleted: deleted[0] });
  } catch (error) {
    console.error("Delete Contract Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const query = await db.execute(sql`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Draft')::int AS draft,
        COUNT(*) FILTER (WHERE status = 'Finalized')::int AS finalized,

        COUNT(*) FILTER (
          WHERE created_at >= ${oneMonthAgo}
        )::int AS total_last_month,

        COUNT(*) FILTER (
          WHERE status = 'Draft' AND created_at >= ${oneMonthAgo}
        )::int AS draft_last_month,

        COUNT(*) FILTER (
          WHERE status = 'Finalized' AND created_at >= ${oneMonthAgo}
        )::int AS finalized_last_month,

        (
          SELECT json_agg(c)
          FROM (
            SELECT id, title, status, updated_at, description
            FROM contracts
            ORDER BY updated_at DESC
            LIMIT 3
          ) c
        ) AS recent_contracts
      FROM contracts;
    `);

    const data = query.rows[0];

    res.json({
      stats: {
        total: data.total,
        draft: data.draft,
        finalized: data.finalized,
        change: {
          total: data.total - data.total_last_month,
          draft: data.draft - data.draft_last_month,
          finalized: data.finalized - data.finalized_last_month,
        },
      },
      recentContracts: data.recent_contracts || [],
    });
  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
