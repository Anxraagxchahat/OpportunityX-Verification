import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QrModal({ isOpen, onClose, certificateId, verificationUrl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = verificationUrl || `${window.location.origin}/?id=${certificateId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('certificate-qr-code');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = '#05070D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, 360, 360);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${certificateId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative w-full max-w-sm rounded-3xl bg-[#0B0D14] border border-slate-800 p-6 sm:p-8 text-center space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/60 rounded-full border border-slate-800 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-2">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">QR Code Verification</h3>
            <p className="text-xs font-mono text-slate-400">{certificateId}</p>
          </div>

          {/* QR Code Container */}
          <div className="p-5 rounded-2xl bg-white/95 border border-slate-700 shadow-inner flex items-center justify-center">
            <QRCodeSVG
              id="certificate-qr-code"
              value={url}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.png",
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>

          <p className="text-xs text-slate-400">
            Scan this QR code with any standard smartphone camera to verify this certificate on OpportunityX.
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-orange-500/20"
            >
              <Download size={14} />
              <span>Download QR</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
