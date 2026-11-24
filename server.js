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

app.set("view engine", "ejs");
app.use(express.json());

db.connect();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/api/dashboard", async (req, res) => {
    try {
        const customerNum = await db.query(
            "SELECT count(*) FROM customers"
        );

        const customers = await db.query(
            "SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2",
            [3, 0]
        );

        const revenueAmt = await db.query(
            "SELECT sum(saleamount) FROM sales"
        );

        const sales = await db.query(`
            SELECT products.name, sales.quantity, sales.saleamount
            FROM sales
            LEFT JOIN products ON
                sales.productid = products.id
            ORDER BY sales.id ASC
        `);

        const ordersAmt = await db.query(
            "SELECT count(quantity) FROM orders"
        );

        const issuesAmt = await db.query(
            "SELECT count(id) FROM alerts WHERE type = 'issues'"
        );

        const messages = await db.query(
            "SELECT * FROM alerts WHERE type = 'issues'"
        );

        const notifAmt = await db.query(
            "SELECT count(id) FROM alerts WHERE type = 'notifications'"
        );

        const notifications = await db.query(
            "SELECT * FROM alerts WHERE type = 'notifications'"
        );

        const tasks = await db.query(
            "SELECT * FROM alerts WHERE type = 'tasks'"
        );

        res.json({
            username: "UTRGV Vaqueros",

            revenueAmt: "$" + Number(
                revenueAmt.rows[0].sum
            ).toLocaleString("en-US"),

            customerNum: Number(
                customerNum.rows[0].count
            ).toLocaleString("en-US"),

            ordersAmt: ordersAmt.rows[0].count,
            issuesAmt: issuesAmt.rows[0].count,
            notifAmt: notifAmt.rows[0].count,

            customers: customers.rows.map(customer => ({
                name: customer.name,
                email: customer.email,
                status: customer.status,
                joined: customer.datejoined.toLocaleDateString("en-US")
            })),

            sales: sales.rows.map(sale => ({
                product: sale.name,
                quantity: sale.quantity,
                revenue: "$" + Number(
                    sale.saleamount
                ).toLocaleString("en-US")
            })),

            messages: messages.rows.map(msg => ({
                messsage: msg.description
            })),

            notifications: notifications.rows.map(notif => ({
                messsage: notif.description
            })),

            tasks: tasks.rows.map(task => ({
                messsage: task.description
            })),

            activities: []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
