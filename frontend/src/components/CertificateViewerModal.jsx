import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, ShieldCheck, Award, Calendar, Building2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function CertificateViewerModal({ isOpen, onClose, data }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !data) return null;

  const {
    certificate_id,
    type_label = 'Internship Certificate',
    recipient = 'Recipient Name',
    role = 'Software Engineering Intern',
    duration = '6 Months',
    issued_date = 'June 15, 2026',
    issued_by = 'OpportunityX',
    digital_signature = '0x4f8a92b1c3d4e5f67890abcd1234ef567890abcd',
    verification_url = '',
    details = {}
  } = data;

  const url = verification_url || `https://verify.opportunityx.co.in/?id=${certificate_id}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-certificate-document');
    if (!element) return;

    setDownloading(true);

    try {
      // 1. Capture the actual rendered DOM element directly at 300 DPI high resolution
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // 2. Create A4 Landscape PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // 3. Render image onto exact 297mm x 210mm page bounds
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');

      // 4. Save file
      pdf.save(`${certificate_id}_OpportunityX_Certificate.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto print:p-0 print:bg-transparent">
        
        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl rounded-3xl bg-[#090B10] border border-slate-800 p-3 sm:p-6 shadow-2xl my-2 space-y-4 print:m-0 print:p-0 print:border-none print:shadow-none print:bg-transparent"
        >
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Award className="text-orange-400" size={20} />
              <span className="text-sm font-bold text-white">Official OpportunityX Certificate Document</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download PDF File</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer size={15} />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* LANDSCAPE OFFICIAL CERTIFICATE FRAME - ULTRA-CLEAN WHITE PROFESSIONAL TEMPLATE */}
          <div
            id="printable-certificate-document"
            className="certificate-print-area relative w-full aspect-[1.414/1] bg-white text-slate-900 p-6 sm:p-8 md:p-10 rounded-xl border border-slate-300 shadow-2xl flex flex-col justify-between overflow-hidden select-none box-border"
          >
            {/* L-Shaped Corner Ornaments */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-900" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-900" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-900" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-900" />

            {/* Header Brand & Certificate ID Row */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-2 z-10">
              <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="OpportunityX" className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                    Opportunity<span className="text-orange-500">X</span>
                  </h1>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-1">
                    GLOBAL STUDENT CAREER OS
                  </p>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  CERTIFICATE ID
                </div>
                <div className="text-xs sm:text-sm font-mono font-black text-slate-900">
                  {certificate_id}
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-600 font-bold">
                  <ShieldCheck size={12} className="text-slate-800" />
                  <span>VERIFIED  |  SECURE  |  AUTHENTIC</span>
                </div>
              </div>
            </div>

            {/* Prominent Central Certificate Body */}
            <div className="text-center my-auto py-1 z-10 space-y-2">
              <p className="text-xs font-bold tracking-[0.25em] text-slate-600 uppercase">
                THIS IS TO CERTIFY THAT
              </p>

              {/* Recipient Name with Clean Underline (Using CSS Border-b-2) */}
              <div className="inline-block border-b-2 border-slate-900 pb-1 px-8 mb-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {recipient}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto pt-0.5 font-medium">
                has successfully completed all official requirements for the <strong className="text-slate-900">{type_label}</strong> in
              </p>

              {/* Role Title */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {role}
              </h3>

              {/* DURATION, ISSUED DATE, ISSUED BY METADATA ROW */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-2 pb-1">
                {/* Duration */}
                <div className="flex items-center gap-2.5 text-left">
                  <Clock size={22} className="text-slate-800 shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase block">DURATION</span>
                    <span className="text-xs font-black text-slate-900 block leading-tight">{duration}</span>
                  </div>
                </div>

                <div className="h-7 w-px bg-slate-300 hidden sm:block" />

                {/* Issued Date */}
                <div className="flex items-center gap-2.5 text-left">
                  <Calendar size={22} className="text-slate-800 shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase block">ISSUED DATE</span>
                    <span className="text-xs font-black text-slate-900 block leading-tight">{issued_date}</span>
                  </div>
                </div>

                <div className="h-7 w-px bg-slate-300 hidden sm:block" />

                {/* Issued By */}
                <div className="flex items-center gap-2.5 text-left">
                  <Building2 size={22} className="text-slate-800 shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase block">ISSUED BY</span>
                    <span className="text-xs font-black text-slate-900 block leading-tight">{issued_by}</span>
                  </div>
                </div>
              </div>

              {/* VERIFIED COMPETENCIES */}
              {details.skills_verified && details.skills_verified.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase block">
                    VERIFIED COMPETENCIES
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-800">
                    {details.skills_verified.map((skill, idx) => (
                      <React.Fragment key={idx}>
                        <span className="font-semibold">{skill}</span>
                        {idx < details.skills_verified.length - 1 && (
                          <span className="text-slate-400 font-normal select-none">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STANDALONE VERIFICATION BANNER */}
            <div className="flex items-center justify-center gap-3 my-1 z-10 w-full px-2">
              <div className="h-px bg-slate-300 flex-1" />
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <ShieldCheck size={14} className="text-slate-900" />
                <span>Verify this credential anytime at <strong className="text-slate-900 font-bold font-mono">verify.opportunityx.co.in</strong></span>
              </div>
              <div className="h-px bg-slate-300 flex-1" />
            </div>

            {/* Footer Signatures, QR Code & Seal */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 z-10">
              
              {/* QR Verification Box */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <div className="p-1 bg-white rounded border border-slate-300 shrink-0">
                  <QRCodeSVG value={url} size={48} level="M" fgColor="#0F172A" />
                </div>
                <div className="text-left space-y-0.5 font-mono">
                  <span className="text-[8px] text-slate-500 uppercase font-bold block">SCAN TO VERIFY</span>
                  <span className="text-[10px] text-slate-900 font-black block leading-tight">
                    {certificate_id}
                  </span>
                  <span className="text-[8px] text-slate-500 block">Tamper-Proof Registry</span>
                </div>
              </div>

              {/* Official Circular Seal */}
              <div className="text-center space-y-0.5">
                <div className="w-10 h-10 mx-auto rounded-full border-2 border-amber-500 bg-white p-0.5 shadow-sm flex items-center justify-center">
                  <ShieldCheck size={22} className="text-slate-900" />
                </div>
                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest block">
                  SEAL OF AUTHENTICITY
                </span>
              </div>

              {/* Authority Signature Image */}
              <div className="text-right space-y-0.5">
                <div className="h-9 sm:h-10 flex items-center justify-end">
                  <img
                    src="/signature_dark.png"
                    alt="OpportunityX Executive Signature"
                    className="h-full max-h-10 object-contain"
                  />
                </div>
                <div className="h-px w-36 bg-slate-300 ml-auto my-0.5" />
                <p className="text-[10px] font-bold text-slate-900 leading-none">Digitally Signed</p>
                <p className="text-[9px] text-slate-600 font-medium leading-none">OpportunityX Verification Registry</p>
                <p className="text-[8px] font-mono text-slate-500 truncate max-w-[170px] leading-tight">
                  Signature Hash: {digital_signature.slice(0, 20)}...
                </p>
              </div>

            </div>

            {/* Bottom Disclaimer */}
            <div className="text-center pt-1 border-t border-slate-100 mt-1">
              <p className="text-[8px] font-mono text-slate-500">
                This is a digitally issued certificate and does not require a physical signature.
              </p>
            </div>
          </div>
        </motion.div>

        {/* LANDSCAPE PRINT CSS ENGINE */}
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }

            html, body {
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #FFFFFF !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              overflow: hidden !important;
            }

            body * {
              visibility: hidden !important;
            }

            .certificate-print-area, .certificate-print-area * {
              visibility: visible !important;
            }

            .certificate-print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              margin: 0 !important;
              padding: 2.5rem 3.5rem !important;
              box-sizing: border-box !important;
              background-color: #FFFFFF !important;
              border: 1px solid #CBD5E1 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
}
