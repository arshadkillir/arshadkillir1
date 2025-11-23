/* Thermal-friendly KOT styles (80mm width) */
.kotContainer {
  width: 80mm;
  padding: 4mm;
  box-sizing: border-box;
}

.kot {
  width: 100%;
  font-family: "Courier New", monospace;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.brand {
  text-align: left;
}

.brandEn {
  font-size: 14px;
  font-weight: 700;
}

.outlet {
  font-size: 11px;
  margin-top: 2px;
}

.meta {
  text-align: right;
}

.copyLabel {
  font-size: 12px;
  font-weight: 700;
  background: #000;
  color: #fff;
  padding: 2px 6px;
  display: inline-block;
  border-radius: 2px;
}

.time {
  font-size: 10px;
  margin-top: 4px;
}

/* Info rows */
.info {
  margin: 6px 0;
  font-size: 11px;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

/* Items */
.items {
  margin-top: 6px;
  margin-bottom: 6px;
}

.itemBlock {
  margin-bottom: 6px;
  page-break-inside: avoid;
}

.itemMain {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
}

.qty {
  width: 18mm;
  text-align: left;
  font-size: 14px;
}

.itemName {
  flex: 1;
  text-align: left;
  font-size: 14px;
}

/* Modifiers and notes */
.modifiers {
  margin-left: 18mm;
  margin-top: 2px;
  font-size: 11px;
  color: #000;
}

.modifier {
  margin-bottom: 2px;
}

.note {
  margin-left: 18mm;
  margin-top: 2px;
  font-size: 11px;
  font-style: italic;
}

/* Order-level notes */
.orderNotes {
  margin-top: 6px;
  border-top: 1px dashed #000;
  padding-top: 6px;
  font-size: 11px;
}

.noteText {
  margin-top: 4px;
}

/* Footer / cut line */
.footer {
  margin-top: 8px;
  text-align: center;
  font-size: 10px;
}

.cutLine {
  color: #000;
}

/* Print rules */
@media print {
  .kotContainer {
    width: 80mm;
    padding: 2mm;
  }

  .copyLabel {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
