using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models.Firestore;

namespace Trifold.Services
{
    public class QRService : IQRService
    {
        private ILogger logger;
        private IHostingEnvironment environment;

        public QRService(ILogger<QRService> logger, IHostingEnvironment environment)
        {
            this.logger = logger;
            this.environment = environment;
        }

        public string GenerateQRCode(string url, int eventId)
        {
            string qrSavePath = Path.Combine(environment.WebRootPath, $"qrcodes\\qrcode_{eventId}.png");

            try
            {
                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                QRCode qrCode = new QRCode(qrCodeData);
                Bitmap qrCodeImage = qrCode.GetGraphic(20);
                qrCodeImage.Save(qrSavePath, ImageFormat.Png);
                return $"/qrcodes/qrcode_{eventId}.png";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating QR code. File name: {qrSavePath}", qrSavePath);
                return null;
            }
        }
    }
}
