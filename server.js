import express from "express";
import pg from "pg"

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "123456",
  host: "localhost",  
  port: 5432,
  database: "mystore",  
});

db.connect();

app.use(express.static("public"));

app.get("/api/dashboard", async (req, res) => {
    try {
        const limit = 3;
        const offset = 0;

        // 1. Total customers
        const customerCount = await db.query(`
            SELECT count(*) FROM customers
        `);

        // 2. Customer information
        const customers = await db.query(`
            SELECT * FROM customers
            ORDER BY id LIMIT $1 OFFSET $2
        `, [limit, offset]);

        // 3. Total revenue
        const revenue = await db.query(`
            SELECT sum(saleamount) FROM sales
        `);

        // 4. Sales information
        const sales = await db.query(`
            SELECT products.name, sales.quantity, sales.saleamount
            FROM sales
            LEFT JOIN products ON
                sales.productid = products.id
            ORDER BY sales.id ASC
        `);

        // 5. Total orders
        const orders = await db.query(`
            SELECT count(quantity) FROM orders
        `);

        // 6. Total issues
        const issueCount = await db.query(`
            SELECT count(id) FROM alerts
            WHERE type = 'issues'
        `);

        // 7. Issues information
        const issues = await db.query(`
            SELECT * FROM alerts
            WHERE type = 'issues'
        `);

        // 8. Total notifications
        const notificationCount = await db.query(`
            SELECT count(id) FROM alerts
            WHERE type = 'notifications'
        `);

        // 9. Notifications information
        const notifications = await db.query(`
            SELECT * FROM alerts
            WHERE type = 'notifications'
        `);

        // 10. Tasks information
        const tasks = await db.query(`
            SELECT * FROM alerts
            WHERE type = 'tasks'
        `);

        res.json({
            stats: {
                customers: customerCount.rows[0].count,
                revenue: revenue.rows[0].sum ?? 0,
                orders: orders.rows[0].count,
                issues: issueCount.rows[0].count,
                notifications: notificationCount.rows[0].count
            },

            customers: customers.rows.map(customer => ({
                ...customer,
                joined: customer.datejoined.toLocaleDateString("en-US")
            })),

            sales: sales.rows.map(sale => ({
                product: sale.name,
                quantity: sale.quantity,
                revenue: sale.saleamount
            })),

            alerts: [
                ...issues.rows,
                ...notifications.rows,
                ...tasks.rows
            ]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Unable to load dashboard."
        });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
