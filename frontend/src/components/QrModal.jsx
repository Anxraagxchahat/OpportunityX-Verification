import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Download, ShieldCheck } from 'lucide-react';
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
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 30, 30, 540, 540);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `OpportunityX_QR_${certificateId || 'Verification'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm rounded-2xl bg-surface-elevated border border-border-subtle p-6 sm:p-7 text-center space-y-5 shadow-elevated"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-surface rounded-lg border border-border-subtle transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex p-2.5 rounded-xl bg-accent-subtle border border-accent-brand/20 text-accent-brand mb-1">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight font-sans">QR Code Verification</h3>
            <p className="text-xs font-mono text-text-muted">{certificateId}</p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-xl bg-white border border-border-subtle shadow-sm flex items-center justify-center">
            <QRCodeSVG
              id="certificate-qr-code"
              value={url}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/brand/icon/light/opportunityx-icon-light.png",
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            Scan this QR code with any smartphone camera to verify this certificate on the official OpportunityX registry.
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2.5 rounded-lg border border-border-subtle hover:border-border-strong bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-3.5 py-2.5 rounded-lg bg-accent-brand hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-subtle active:scale-[0.98] cursor-pointer"
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

export default QrModal;
