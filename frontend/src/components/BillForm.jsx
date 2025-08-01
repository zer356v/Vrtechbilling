import React, { useState } from "react";
import { getServiceTypes, getCustomers } from "../utils/ChartData.js";
import { saveBill } from "../utils/billStorage.js";
import { saveBill2 } from "../utils/billstorage2.js";
import { generateBillPDF } from "../utils/pdfGenerator.js";
import { assets } from "../assets/assets";

/**
 * Bill creation form component
 * @param {Object} props - Component props
 * @param {Function} [props.onBillSaved] - Optional callback when a bill is saved
 */
const BillForm = ({ onBillSaved }) => {
  const printInvoice = () => {
    window.print();
  };

  const [billData, setBillData] = useState({
    billtype: "",
    customer: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    invoice: "",
    date: new Date().toISOString().split("T")[0],
    additionalItems: [],
    notes: "",
  });

  const [newItem, setNewItem] = useState({
    sno: "",
    name: "",
    hsn: "995463",
    units: "",
    quantityType: "",
    price: "",
    gst: "",
    cgst: "",
    sgst: "",
    totalAmount: "",
  });

  const [previewMode, setPreviewMode] = useState(false);

  const customers = getCustomers();
  const serviceTypes = getServiceTypes();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate total amount for current item based on input values
  const calculateItemTotal = (price, units, gst) => {
    const itemPrice = parseFloat(price) || 0;
    const itemUnits = parseFloat(units) || 0;
    const gstRate = parseFloat(gst) || 0;

    const subtotal = itemPrice * itemUnits;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;

    return {
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      cgst: (gstAmount / 2).toFixed(2),
      sgst: (gstAmount / 2).toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleAddItem = () => {
    if (
      newItem.sno &&
      newItem.name &&
      newItem.hsn &&
      newItem.units &&
      newItem.price &&
      newItem.gst
    ) {
      const calculations = calculateItemTotal(
        newItem.price,
        newItem.units,
        newItem.gst
      );

      const itemWithCalculations = {
        ...newItem,
        cgst: calculations.cgst,
        sgst: calculations.sgst,
        totalAmount: calculations.total,
      };

      setBillData((prev) => ({
        ...prev,
        additionalItems: [...prev.additionalItems, itemWithCalculations],
      }));

      // Reset form for new item
      setNewItem({
        sno: "",
        name: "",
        hsn: "995463",
        units: "",
        quantityType: "",
        price: "",
        gst: "",
        cgst: "",
        sgst: "",
        totalAmount: "",
      });
    }
  };

  const convertToWords = (n) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (isNaN(n)) return "";

    if ((n = parseInt(n).toString()).length > 9) return "Overflow";

    const num = ("000000000" + n)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!num) return "";

    let str = "";
    str +=
      num[1] != "00"
        ? (a[Number(num[1])] || b[num[1][0]] + " " + a[num[1][1]]) + " Crore "
        : "";
    str +=
      num[2] != "00"
        ? (a[Number(num[2])] || b[num[2][0]] + " " + a[num[2][1]]) + " Lakh "
        : "";
    str +=
      num[3] != "00"
        ? (a[Number(num[3])] || b[num[3][0]] + " " + a[num[3][1]]) +
          " Thousand "
        : "";
    str += num[4] != "0" ? a[Number(num[4])] + " Hundred " : "";
    str +=
      num[5] != "00"
        ? (str != "" ? "and " : "") +
          (a[Number(num[5])] || b[num[5][0]] + " " + a[num[5][1]])
        : "";

    return str.trim().toUpperCase();
  };

  const handleRemoveItem = (index) => {
    setBillData((prev) => ({
      ...prev,
      additionalItems: prev.additionalItems.filter((_, i) => i !== index),
    }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...newItem, [name]: value };

    // Auto-calculate when price, units, or gst changes
    if (name === "price" || name === "units" || name === "gst") {
      const calculations = calculateItemTotal(
        updatedItem.price,
        updatedItem.units,
        updatedItem.gst
      );
      updatedItem.cgst = calculations.cgst;
      updatedItem.sgst = calculations.sgst;
      updatedItem.totalAmount = calculations.total;
    }

    setNewItem(updatedItem);
  };

  // Calculate overall bill totals
  const calculateBillTotals = () => {
    const totals = billData.additionalItems.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.totalAmount) || 0;
        const itemPrice = parseFloat(item.price) || 0;
        const itemUnits = parseFloat(item.units) || 0;
        const itemSubtotal = itemPrice * itemUnits;
        const itemTax = itemTotal - itemSubtotal;

        return {
          subtotal: acc.subtotal + itemSubtotal,
          tax: acc.tax + itemTax,
          total: acc.total + itemTotal,
        };
      },
      { subtotal: 0, tax: 0, total: 0 }
    );

    return {
      subtotal: totals.subtotal.toFixed(2),
      tax: totals.tax.toFixed(2),
      total: totals.total.toFixed(2),
    };
  };

  const handleExportPDF = () => {
    const totals = calculateBillTotals();

    // Save the bill to localStorage
    const savedBill = saveBill({
      billtype: billData.billtype,
      customer: billData.customer,
      address: billData.address,
      city: billData.city,
      state: billData.state,
      zip: billData.zip,
      invoice: billData.invoice,
      date: billData.date,
      additionalItems: billData.additionalItems,
      notes: billData.notes,
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      total: totals.total,
    });

    // Save the bill to localStorage 2
    const savedBill2 = saveBill2({
      billtype: billData.billtype,
      customer: billData.customer,
      address: billData.address,
      city: billData.city,
      state: billData.state,
      zip: billData.zip,
      invoice: billData.invoice,
      date: billData.date,
      additionalItems: billData.additionalItems,
      notes: billData.notes,
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      total: totals.total,
    });

    // Generate and download PDF
    generateBillPDF(savedBill);

    // Reset form
    setBillData({
      billtype: "",
      customer: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      invoice: "",
      date: new Date().toISOString().split("T")[0],
      additionalItems: [],
      notes: "",
    });

    setPreviewMode(false);

    // Notify parent component that a bill was saved
    if (onBillSaved) {
      onBillSaved();
    }

    alert("Bill saved and PDF generated successfully!");
  };

  const renderBillPreview = () => {
    const totals = calculateBillTotals();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Bill Preview - {billData.invoice}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          <div className="printable bg-white p-8">
            <div className="invoice-content">
              <img className="logo w-90" src={assets.logo} alt="" />
              <h2 className="text-xl font-bold text-center -mt-4">
                {billData.billtype}
              </h2>
              <div className="flex justify-between -mt-2 text-sm">
                <div className="px-12">
                  <p>
                    <strong>TO:</strong>
                  </p>
                  <p>{billData.customer}</p>
                  <div className="whitespace-pre-line">{billData.address}</div>
                  <p>
                    {billData.city}, {billData.state} - {billData.zip}
                  </p>
                </div>
                <div className="px-12">
                  <p>
                    <strong>INVOICE NO:</strong> {billData.invoice}
                  </p>
                  <p>
                    <strong>DATE:</strong> {billData.date}
                  </p>
                </div>
              </div>

              <table className="ml-20 w-82  border-collapse text-center text-sm mt-8">
                <thead>
                  <tr>
                    <th className="border p-2">SL NO</th>
                    <th className="border p-2">ITEM DESCRIPTION</th>
                    <th className="border p-2">HSN</th>
                    <th className="border p-2">QUANTITY</th>
                    <th className="border p-2">RATE</th>
                    <th className="border p-2">GST</th>
                    <th className="border p-2">CGST</th>
                    <th className="border p-2">SGST</th>
                    <th className="border p-2">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.additionalItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="border p-2 text-center font-bold">
                        {item.sno}
                      </td>
                      <td className="border p-2 text-center font-bold whitespace-pre-wrap">
                        {item.name}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.hsn}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.units + item.quantityType}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        ₹{item.price}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.gst && item.gst !== "0" ? `${item.gst}%` : "-"}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.cgst && item.cgst !== "0.00"
                          ? `₹${item.cgst}`
                          : "-"}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.sgst && item.sgst !== "0.00"
                          ? `₹${item.sgst}`
                          : "-"}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        ₹{item.totalAmount}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="8" className="border p-2 text-right font-bold">
                      GRAND TOTAL
                    </td>
                    <td className="border p-2 text-center font-bold">
                      ₹{totals.total}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-12 text-sm px-12 whitespace-pre-wrap">
                <strong className="text-sm">Notes: </strong>
                {billData.notes}
              </p>

              <p className="mt-12 text-sm px-12">
                <strong className="text-sm">Amount in Words:</strong>{" "}
                {convertToWords(totals.total)}
              </p>
            </div>

            <div className="invoice-footer">
              <div className="flex justify-between text-sm w-84 ">
                <div className="px-12">
                  <p className="dev">
                    <strong>Declaration:</strong>
                  </p>
                  <p className="w-96">
                    We declare that this invoice shows the actual price of the
                    Goods described and that all particulars are true and
                    correct.
                  </p>
                </div>
                <div className="text-sm px-12">
                  <p>
                    <strong>Bank name:</strong> HDFC bank
                  </p>
                  <p>
                    <strong>Ac/no:</strong> 5010 0562 3633 08
                  </p>
                  <p>
                    <strong>IFSC code:</strong> HDFC0003760
                  </p>
                  <p>
                    <strong>G PAY:</strong> 9790811296
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm  px-12 gap-9 mt-12">
                <p>Customer Signature:</p>
                <p>Computer generated invoice requires no signature:</p>
                <p>For VR TECH HVAC Solutions:</p>
              </div>
              <img className="w-90 mt-2" src={assets.footer} alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBillForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* ... keep existing code (customer form fields) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Bill Type
            </label>
            <input
              name="billtype"
              value={billData.billtype}
              onChange={handleInputChange}
              id="billtype"
              type="text"
              required
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter Bill Type"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Customer
            </label>
            <input
              name="customer"
              value={billData.customer}
              onChange={handleInputChange}
              id="customer"
              type="text"
              required
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter customer name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={billData.address}
              onChange={handleInputChange}
              id="address"
              required
              rows={3}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full resize-y"
              placeholder="Enter Address"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">City</label>
            <input
              type="text"
              name="city"
              value={billData.city}
              onChange={handleInputChange}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter the city"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={billData.state}
              onChange={handleInputChange}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter the State"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Zip_code
            </label>
            <input
              type="text"
              name="zip"
              value={billData.zip}
              onChange={handleInputChange}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter the Zip_code"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Invoice_No
            </label>
            <input
              type="text"
              name="invoice"
              value={billData.invoice}
              onChange={handleInputChange}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              placeholder="Enter the Invoice_No"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Service Date
            </label>
            <input
              type="date"
              name="date"
              value={billData.date}
              onChange={handleInputChange}
              className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Service Details</h3>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-1/10">
              <label className="block text-gray-700 font-medium mb-2">
                S/No
              </label>
              <input
                type="text"
                name="sno"
                value={newItem.sno}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
                placeholder="0"
              />
            </div>

            <div className="w-1/10">
              <label className="block text-gray-700 font-medium mb-2">
                HSN
              </label>
              <input
                type="text"
                name="hsn"
                value={newItem.hsn}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              />
            </div>
            <div className="w-1/10">
              <label className="block text-gray-700 font-medium mb-2">
                SERVICES
              </label>
              <textarea
                type="text"
                name="name"
                value={newItem.name}
                rows={1}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
                placeholder="Enter service"
                style={{
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.2",
                }}
                onInput={(e) => {
                  const text = e.target.value;
                  const lines = text.split("\n");
                  let newText = "";

                  lines.forEach((line, lineIndex) => {
                    if (line.length > 20) {
                      let words = line.split(" ");
                      let currentLine = "";

                      words.forEach((word, wordIndex) => {
                        if ((currentLine + word).length > 20) {
                          if (currentLine.trim() !== "") {
                            newText += currentLine.trim() + "\n";
                          }

                          while (word.length > 20) {
                            newText += word.substring(0, 20) + "\n";
                            word = word.substring(20);
                          }
                          currentLine = word + " ";
                        } else {
                          currentLine += word + " ";
                        }
                      });

                      if (currentLine.trim() !== "") {
                        newText += currentLine.trim();
                      }
                    } else {
                      newText += line;
                    }

                    if (lineIndex < lines.length - 1) {
                      newText += "\n";
                    }
                  });

                  if (newText !== text) {
                    e.target.value = newText;
                    handleNewItemChange(e);
                  }
                }}
              />
            </div>
            <div className="w-1/11">
              <label className="block text-gray-700 font-medium mb-2">
                QUANTITY
              </label>
              <input
                type="number"
                name="units"
                value={newItem.units}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
                placeholder="Enter Quantity"
              />
            </div>
            <div className="w-1/10">
              <label className="block text-gray-700 font-medium mb-2">
                Quantity Type
              </label>
              <select
                name="quantityType"
                value={newItem.quantityType}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
              >
                <option value="">Select type</option>
                <option value=" (unit)">Unit</option>
                <option value=" (mtr)">Meter</option>
              </select>
            </div>
            <div className="w-1/11">
              <label className="block text-gray-700 font-medium mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={newItem.price}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
                placeholder="0.00"
              />
            </div>
            <div className="w-1/9">
              <label className="block text-gray-700 font-medium mb-2">
                GST(%)
              </label>
              <input
                type="number"
                name="gst"
                value={newItem.gst}
                onChange={handleNewItemChange}
                className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
                placeholder="Enter GST"
              />
            </div>
            <div className="w-1/9">
              <label className="block text-gray-700 font-medium mb-2">
                CGST(₹)
              </label>
              <input
                type="number"
                name="cgst"
                value={newItem.cgst}
                readOnly
                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full"
                placeholder="Auto calculated"
              />
            </div>
            <div className="w-1/9">
              <label className="block text-gray-700 font-medium mb-2">
                SGST(₹)
              </label>
              <input
                type="number"
                name="sgst"
                value={newItem.sgst}
                readOnly
                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full"
                placeholder="Auto calculated"
              />
            </div>
            <div className="w-1/9 pt-2" >
              <label className="text-sm text-gray-700 font-medium mb-2">
                TOTAL_AMT(₹)
              </label>
              <input
                type="number"
                name="totalAmount"
                value={newItem.totalAmount}
                readOnly
                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full"
                placeholder="Auto calculated"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {billData.additionalItems.length > 0 && (
            <div className="mt-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">S/No</th>
                    <th className="px-4 py-2 text-left">SERVICES</th>
                    <th className="px-4 py-2 text-left">HSN</th>
                    <th className="px-4 py-2 text-left">QUANTITY</th>
                    <th className="px-4 py-2 text-left">PRICE</th>
                    <th className="px-4 py-2 text-left">GST</th>
                    <th className="px-4 py-2 text-left">CGST</th>
                    <th className="px-4 py-2 text-left">SGST</th>
                    <th className="px-4 py-2 text-left">TOTAL_AMOUNT</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.additionalItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="border px-4 py-2">{item.sno}</td>
                      <td className=" border px-4 py-2 whitespace-pre-wrap ">
                        {item.name}
                      </td>
                      <td className="border px-4 py-2">{item.hsn}</td>
                      <td className=" border px-4 py-2">
                        {item.units + item.quantityType}
                      </td>
                      <td className=" border px-4 py-2">₹{item.price}</td>
                      <td className="border p-2 text-center font-bold">
                        {item.gst && item.gst !== "0" ? `${item.gst}%` : "-"}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.cgst && item.cgst !== "0.00"
                          ? `₹${item.cgst}`
                          : "-"}
                      </td>
                      <td className="border p-2 text-center font-bold">
                        {item.sgst && item.sgst !== "0.00"
                          ? `₹${item.sgst}`
                          : "-"}
                      </td>
                      <td className=" border px-4 py-2">₹{item.totalAmount}</td>
                      <td className=" border px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <label className="block text-gray-700 font-medium mb-2">Notes </label>
          <textarea
            name="notes"
            value={billData.notes}
            onChange={handleInputChange}
            className="px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
            placeholder="Add any additional notes here..."
            rows={3}
            style={{
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              lineHeight: "1.2",
            }}
            onInput={(e) => {
              const text = e.target.value;
              const lines = text.split("\n");
              let newText = "";

              lines.forEach((line, lineIndex) => {
                if (line.length > 55) {
                  let words = line.split(" ");
                  let currentLine = "";

                  words.forEach((word, wordIndex) => {
                    // If adding the word exceeds limit
                    if ((currentLine + word).length > 55) {
                      if (currentLine.trim() !== "") {
                        newText += currentLine.trim() + "\n";
                      }
               
                      while (word.length > 55) {
                        newText += word.substring(0, 55) + "\n";
                        word = word.substring(55);
                      }
                      currentLine = word + " ";
                    } else {
                      currentLine += word + " ";
                    }
                  });

                  if (currentLine.trim() !== "") {
                    newText += currentLine.trim();
                  }
                } else {
                  newText += line;
                }

                // Only add a line break if it's not the last line
                if (lineIndex < lines.length - 1) {
                  newText += "\n";
                }
              });

              // Update only if changed
              if (newText !== text) {
                e.target.value = newText;
                handleNewItemChange(e);
              }
            }}
          ></textarea>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="text-lg font-semibold">
              Bill Total: ₹{calculateBillTotals().total}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {previewMode ? (
        <div>
          <div className="mb-4 flex justify-between items-center"></div>
          {renderBillPreview()}
        </div>
      ) : (
        renderBillForm()
      )}
    </div>
  );
};

export default BillForm;