
const fs = require("fs");

// Read the original order database
const data = JSON.parse(
  fs.readFileSync("./data/orders.json", "utf8")
);

// These must match your Google Sheets headers
const headers = [
  "order_id",
  "customer_name",
  "customer_email",
  "order_date",
  "items",
  "subtotal",
  "shipping_fee",
  "cod_fee",
  "total",
  "payment_method",
  "status",
  "courier",
  "tracking_url",
  "shipped_date",
  "estimated_delivery",
  "delivered_date",
  "cancelled_date",
  "cancellation_reason",
  "refund_status",
  "shipping_address"
];

// Escape values correctly for CSV
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    value = JSON.stringify(value);
  }

  return '"' + String(value).replace(/"/g, '""') + '"';
}

// Convert each order into a CSV row
const rows = data.orders.map(order =>
  headers.map(header => escapeCSV(order[header]))
);

// Create CSV content
const csv = [
  headers.join(","),
  ...rows.map(row => row.join(","))
].join("\n");

// Save CSV in project root
fs.writeFileSync(
  "./orders_for_sheets.csv",
  "\uFEFF" + csv,
  "utf8"
);

console.log(`Successfully converted ${data.orders.length} orders!`);
console.log("File created: orders_for_sheets.csv");