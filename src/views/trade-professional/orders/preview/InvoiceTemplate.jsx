import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceTemplate = ({ invoiceData }) => {
  // Helper functions to extract and format data
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '';
  const customer = invoiceData?.createdBy || {};
  const shipping = invoiceData?.shippingAddress || {};
  const items = invoiceData?.orderDetails || [];
  const subtotal = invoiceData?.subtotal || 0;
  const discount = invoiceData?.discount || 0;
  const tax = invoiceData?.tax || 0;
  const total = invoiceData?.total || 0;
  const currency = '£';

  //console.log(invoiceData,'545455455454544545');

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', fontSize: 14 }}>
      <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ backgroundColor: '#f5f5f5', padding: 20 }}>
        <tbody><tr><td align="center">
          <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: '100%' }}>
            <tbody><tr><td style={{ padding: 30 }}>
              {/* Header Section */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: 40 }}>
                <tbody><tr>
                  <td width="50%" valign="middle" style={{ borderRight: '1px solid #a44949', paddingRight: 30, height: 90 }}>
                    <h1 style={{ margin: 0, fontSize: 36, fontWeight: 300, color: '#333', letterSpacing: 2 }}>EUROTILE</h1>
                  </td>
                  <td width="50%" valign="middle" style={{ paddingLeft: 30 }}>
                    <table cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 15, paddingBottom: 5, lineHeight: 1.3 }}>
                            <img src="email.png" alt="" width="20px" align="top" style={{ verticalAlign: 'middle', marginRight: 5 }} />
                            support@eurotile.com
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: 15, lineHeight: 1.3 }}>
                            <img src="gps.png" alt="" width="20px" align="top" style={{ verticalAlign: 'middle', marginRight: 5 }} /> 1250 High Road | London | N20 0PB
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr></tbody>
              </table>

              {/* Invoice Title and Details */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: 30 }}>
                <tbody>
                  <tr>
                    <td colSpan={2}>
                      <h2 style={{ margin: '0 0 5px 0', fontSize: 32, fontWeight: 'bold', color: '#333' }}>INVOICE</h2>
                    </td>
                  </tr>
                  <tr>
                    <td width="48%" valign="top">
                      <table cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td style={{ paddingBottom: 0, color: '#333' }}>
                              Invoice Number : {invoiceData?.orderId || 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ color: '#333' }}>
                              VAT Number : 478 4887 17
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td width="4%"></td>
                    <td width="48%" valign="top">
                      <table cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td style={{ paddingBottom: 0, color: '#333' }}>
                              Invoice Date : {formatDate(invoiceData?.createdAt)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ color: '#333' }}>
                              Delivery Date : {formatDate(invoiceData?.shippedAt) || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Customer Details */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: 30 }}>
                <tbody><tr>
                  <td width="48%" valign="top">
                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: 16, fontWeight: 'bold' }}>Customer & Billing Details</h3>
                    <table cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr>
                          <td style={{ paddingBottom: 0, color: '#333' }}>
                            Name : {customer?.name || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingBottom: 0, color: '#333' }}>
                            Address : {customer?.addresses?.addressLine1 || ''}, {customer?.addresses?.city || ''}, {customer?.addresses?.state || ''} {customer?.addresses?.postalCode || ''}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: '#333' }}>
                            Contact : {customer?.phone || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" valign="top">
                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: 16, fontWeight: 'bold' }}>Ship to:</h3>
                    <table cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr>
                          <td style={{ paddingBottom: 0, color: '#333' }}>
                            Name : {shipping?.name || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingBottom: 0, color: '#333' }}>
                            Address : {shipping?.addressLine1 || ''}, {shipping?.city || ''}, {shipping?.state || ''} {shipping?.postalCode || ''}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: '#333' }}>
                            Contact : {shipping?.phone || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr></tbody>
              </table>

              {/* Items Table */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: 30 }}>
                <tbody>
                  <tr style={{ backgroundColor: '#7b0505' }}>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none' }}>#</td>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none' }}>Items & Description</td>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none', textAlign: 'center' }}>Qty</td>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none', textAlign: 'center' }}>Price</td>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none', textAlign: 'center' }}>Discount</td>
                    <td style={{ padding: 16, color: 'white', fontWeight: 'bold', border: 'none', textAlign: 'center' }}>Total</td>
                  </tr>
                  {items.map((item, idx) => {
                    let productDetail = {};
                    try {
                      productDetail = typeof item.productDetail === 'string' ? JSON.parse(item.productDetail) : item.productDetail;
                    } catch (e) {}
                    return (
                      <tr key={item._id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#ead8d8' }}>
                        <td style={{ padding: 16, color: '#333', border: 'none' }}>{idx + 1}</td>
                        <td style={{ padding: 16, color: '#333', border: 'none' }}>
                          {productDetail?.product?.name || 'N/A'}<br />
                          <small>SKU: {productDetail?.product?.sku || 'N/A'}</small>
                        </td>
                        <td style={{ padding: 16, color: '#333', border: 'none', textAlign: 'center' }}>
                          {item.quantity}<br />
                          <small>{productDetail?.attributes?.find?.(attr => attr.metaKey === 'size')?.metaValue || ''}</small>
                        </td>
                        <td style={{ padding: 16, color: '#333', border: 'none', textAlign: 'center' }}>{currency}{item.price?.toFixed(2)}</td>
                        <td style={{ padding: 16, color: '#333', border: 'none', textAlign: 'center' }}>{item.discount ? `${item.discount}%` : '-'}</td>
                        <td style={{ padding: 16, color: '#333', border: 'none', textAlign: 'center' }}>{currency}{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <hr style={{ marginTop: 50 }} />

              {/* Payment Details and Totals */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginTop: 30 }}>
                <tbody><tr>
                  <td width="45%" valign="top">
                    {/* <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: 16, fontWeight: 'bold' }}>Bank Transfer Payments</h3>
                    <table cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr><td style={{ color: '#333', lineHeight: 1.6 }}>International Wood & Porcelain Limited</td></tr>
                        <tr><td style={{ color: '#333', lineHeight: 1.6 }}>Bank Name: HSBC</td></tr>
                        <tr><td style={{ color: '#333', lineHeight: 1.6 }}>Sort Code: 40-18-00</td></tr>
                        <tr><td style={{ color: '#333', lineHeight: 1.6 }}>Account No: 01061011</td></tr>
                      </tbody>
                    </table> */}
                  </td>
                  <td width="10%"></td>
                  <td width="45%" valign="top">
                    <table width="100%" cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '10px 30px', color: '#333' }}><strong>Subtotal</strong></td>
                          <td style={{ padding: '10px 30px', color: '#333', textAlign: 'right' }}><strong>{currency}{subtotal.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 30px', color: '#333' }}><strong>VAT (20%)</strong></td>
                          <td style={{ padding: '10px 30px', color: '#333', textAlign: 'right' }}><strong>{currency}{tax.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ padding: '5px 10px', color: '#333' }}><hr /></td>
                        </tr>
                        <tr style={{ backgroundColor: '#ead8d8' }}>
                          <td style={{ padding: '10px 30px', color: '#333', fontSize: 14 }}><strong>Total Amount Due</strong></td>
                          <td style={{ padding: '10px 30px', color: '#333', fontSize: 14, textAlign: 'right' }}><strong>{currency}{total.toFixed(2)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr></tbody>
              </table>

              {/* Terms & Conditions Footer */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginTop: 40 }}>
                <tbody><tr><td>
                  <table width="100%" cellPadding={15} cellSpacing={0} border={0} style={{ backgroundColor: '#f5e6e6', marginBottom: 20 }}>
                    <tbody><tr><td style={{ padding: 20 }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: 14, fontWeight: 'bold' }}>Eurotile Sales Terms & Conditions</h4>
                      <p style={{ margin: '0 0 10px 0', color: '#333', fontSize: 12, lineHeight: 1.4 }}>
                        All deliveries are kerbside only and require a solid, level surface. Customers must inspect tiles upon delivery and report any damage within 24 hours, supported by photographic evidence. Returns are accepted only if goods are in original condition and packaging, with customers responsible for arranging return transport. Eurotile accepts no liability for delays caused by transport, customs, or manufacturing issues. All orders are subject to Eurotile's full Terms & Conditions.
                      </p>
                      <p style={{ margin: 0, color: '#333', fontSize: 12, fontWeight: 'bold' }}>
                        Full Sales Terms & Conditions – See Next Page.
                      </p>
                    </td></tr></tbody>
                  </table>
                  <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ borderTop: '1px solid #ddd', paddingTop: 15 }}>
                    <tbody><tr><td align="center">
                      <p style={{ margin: 0, color: '#666', fontSize: 11, lineHeight: 1.4 }}>
                        Eurotile is a trading name of International Wood & Porcelain Ltd. Company Registered in England & Wales – No. 14831555.
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: 11, lineHeight: 1.4 }}>
                        VAT Registration No. 478 4887 17. Registered Office: Suite 1 First Floor, 81 Old Church Road, London, England, E4 6ST.
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: 11, lineHeight: 1.4 }}>
                        All sales are subject to Eurotile's Terms & Conditions. Terms effective as of June 2025.
                      </p>
                    </td></tr></tbody>
                  </table>
                </td></tr></tbody>
              </table>

              {/* Full Sales Terms & Conditions */}
              <table width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ marginTop: 40, backgroundColor: '#f5e6e6', marginBottom: 20, fontSize: 12 }}>
                <tbody><tr><td style={{ padding: '20px' }}>
                  <h2 style={{ fontWeight: 500, marginBottom: 10 }}>Full Sales Terms & Conditions</h2>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>1. DELIVERY TERMS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.1 Kerbside Delivery Only: All deliveries are kerbside. Drivers are not insured to enter properties or move goods beyond the public roadway.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.2 Customer Responsibility: It is the buyer's responsibility to ensure site access and suitable surface for offloading. Eurotile will not be liable for failed deliveries due to site inaccessibility.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.3 Delivery Surface Requirements: Deliveries must be made to solid, level, and stable surfaces. Eurotile will not offload pallets onto gravel, steep inclines, or any terrain deemed unsuitable or unsafe by the delivery driver. Failure to meet these conditions may result in delivery failure and additional charges.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.4 Delivery Times: All delivery windows are estimates. Eurotile does not guarantee delivery times and accepts no liability for delays due to logistics, customs, or weather conditions.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.5 Unattended Sites: Deliveries to unattended sites are made at the customer's written instruction and risk. No liability is accepted for damage, theft, or exposure.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>1.6 Redelivery Charges: If a delivery cannot be completed due to inaccessibility, unsafe conditions, or no one being present to receive the order, a redelivery fee of £60 per pallet may apply. This covers logistical rescheduling and associated carrier costs.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>2. DELIVERY PREPARATION</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>2.1 Provide full delivery address, access instructions, and site contact.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>2.2 Notify Eurotile at least 24 hours before dispatch to amend delivery details.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>3. INSPECTION & DAMAGE REPORTING</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>3.1 Pallets must be inspected upon delivery.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>3.2 Claims for breakages must be submitted within 24 hours, with clear photographic evidence.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>3.3 Minor imperfections, edge chipping, or tiles designated for cuts are not deemed defective.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>3.4 Up to 5% breakage is covered by one free pack included per pallet.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>3.5 Insurance Pack: Each full pallet includes a complimentary insurance pack equivalent to approximately 5% of the order quantity. This pack is non-refundable and excluded from return/refund calculations.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>4. BREAKAGE & REPLACEMENT PROCESS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>4.1 Claims reviewed and processed within 3–7 working days.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>4.2 Replacement orders may require 2–3 weeks for production and transit.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>5. RETURNS & CANCELLATIONS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>5.1 Returns must be pre-authorised and in original, saleable condition.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>5.2 Return transport costs are borne by the buyer.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>5.3 Eurotile return service ranges from £300–£500 per pallet depending on location.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>5.4 Refused deliveries incur a £40 per pallet fee plus transport charges.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>5.5 Transit Cancellation Policy: Orders cancelled after dispatch but before delivery are subject to deductions for: Outbound shipping fees, Return freight charges, Warehousing or handling surcharges (minimum £300–£500 per pallet).</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>6. CUSTOMS, COMPLIANCE & PRODUCT STANDARDS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>6.1 All prices exclude VAT unless otherwise stated.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>6.2 Orders are subject to delays due to customs or supplier issues.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>6.3 Products adhere to manufacturer specifications and relevant EU/UK standards.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>6.4 Eurotile operates as a distributor and is not liable for manufacturer-side delays or errors.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>6.5 All tiles are sourced from certified European factories and meet EN ISO 14411 / ISO 13006 standards.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>7. PAYMENT TERMS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>7.1 All orders must be paid in full at the time of order. No credit terms are available unless expressly authorised by Eurotile management. Orders will not be dispatched or delivered until full payment has been received and cleared by Eurotile.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>8. TITLE & RISK</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>8.1 Title to goods shall not pass to the buyer until full payment is received.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>8.2 Risk passes upon delivery to the kerbside drop-off point.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>9. STORAGE POLICY</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>9.1 If you are unable to accept delivery on the agreed date, we will store your order free of charge for up to 30 days.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>9.2 Beyond this period, a storage fee of £7.50 per pallet per week will apply.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>9.3 This storage charge must be paid in full before the goods are released for delivery or refund.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>10. LIMITATIONS OF LIABILITY</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>10.1 Eurotile's liability shall not exceed the value of the goods supplied.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>10.2 We accept no liability for consequential loss, project delays, or indirect damages.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>10.3 Delivery dates are estimates only. Eurotile is not liable for project delays, indirect losses, or missed contractor appointments caused by freight delays, customs processing, or weather conditions.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>10.4 Eurotile does not accept responsibility for indirect losses, delays, or project disruptions resulting from product faults.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>11. FORCE MAJEURE</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>11.1 Eurotile shall not be held liable for failure to perform due to circumstances beyond its reasonable control, including but not limited to delays by suppliers, natural disasters, strikes, or transportation issues.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>12. PRODUCT WARRANTY</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>12.1 Eurotile acts as a distributor, not the manufacturer of the goods supplied.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>12.2 In the event of a manufacturing fault, Eurotile will coordinate with the factory to offer a remedy — this may include replacement, refund, or repair, subject to the original manufacturer warranty.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>13. TILE VARIATIONS & INSTALLATION</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>13.1 Variations in shade, texture, and calibration are inherent in porcelain tiles.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>13.2 Customers must verify suitability and quantities prior to installation.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>13.3 No claims will be accepted once tiles are fixed.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>14. JURISDICTION</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>14.1 These terms shall be governed by and interpreted in accordance with the laws of England and Wales.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>15. ENTIRE AGREEMENT</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>15.1 These Terms & Conditions constitute the entire agreement between the parties concerning the sale of goods and supersede all previous communications or representations.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>16. CUSTOMER ACKNOWLEDGEMENT</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>16.1 By making payment or accepting delivery, you confirm agreement to these Sales Terms & Conditions as printed or referenced on this invoice.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>17. RIGHT TO CANCEL (CONSUMER CONTRACTS REGULATIONS)</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>17.1 In accordance with UK Consumer Contracts Regulations, you have the right to cancel your order within 14 days of receiving the goods. Notification of cancellation must be made in writing.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>18. RETURN CONDITION AND RESTOCKING</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>18.1 Returned items must be in original, unopened packaging and in saleable condition. Damaged, opened, or installed items are not eligible for refund.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>18.2 If packaging is missing or significantly damaged and goods are no longer re-saleable, a restocking fee of up to 75% may be deducted from your refund.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>19. RETURNS PROCESS</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>19.1 You must contact Eurotile to obtain a return authorisation before sending goods back. Unauthorised returns may not be accepted.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>20. INVOICE DISCLOSURE</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>20.1 If an order is placed through a trade account, affiliate channel, or referral partner (such as an interior designer or influencer), this invoice may have been issued under a Eurotile-affiliated transaction. In such cases, Eurotile may pay a commission to the referring party. This does not affect the product pricing paid by the customer in any way.</p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}><strong style={{ fontSize: 13 }}>21. DATA & PRIVACY</strong></p>
                  <p style={{ marginTop: 10, marginBottom: 10 }}>21.1 Your personal information is handled in accordance with our Privacy Policy, available on our website.</p>
                </td></tr></tbody>
              </table>

            </td></tr></tbody>
          </table>
        </td></tr></tbody>
      </table>
    </div>
  );
};

 
export default InvoiceTemplate; 