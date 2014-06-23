#region Directives
using System;
using System.Data;
using System.Configuration;
using stellar.Models;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
using System.Web;
//using MonoRailHelper;
using System.Xml;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Specialized;
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;
using stellar.Services;
using log4net;
using log4net.Config;
using Goheer.EXIF;
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class image_sizing {
        private static ILog log = log4net.LogManager.GetLogger("ImageService");

        /// <summary> </summary>
        public static Boolean protectSize(Image OriginalFile, int MaxWidth, int MaxHeight, bool onBoth) {
            if ((OriginalFile.Height <= MaxWidth && OriginalFile.Width <= MaxWidth) && onBoth) {
                return false;
            }
            if (OriginalFile.Height <= MaxWidth) {
                return false;
            }
            if (OriginalFile.Width <= MaxWidth) {
                return false;
            }
            return true;
        }
        /// <summary> </summary>
        public static Image ScaleByPercent(Image imgPhoto, int Percent) {
            float nPercent = ((float)Percent / 100);

            int sourceWidth = imgPhoto.Width;
            int sourceHeight = imgPhoto.Height;
            int sourceX = 0;
            int sourceY = 0;

            int destX = 0;
            int destY = 0;
            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);

            Bitmap bmPhoto = new Bitmap(destWidth, destHeight, PixelFormat.Format24bppRgb);
            bmPhoto.SetResolution(imgPhoto.HorizontalResolution, imgPhoto.VerticalResolution);

            Graphics grPhoto = Graphics.FromImage(bmPhoto);
            grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;

            grPhoto.DrawImage(imgPhoto,
                new Rectangle(destX, destY, destWidth, destHeight),
                new Rectangle(sourceX, sourceY, sourceWidth, sourceHeight),
                GraphicsUnit.Pixel);

            grPhoto.Dispose();
            return bmPhoto;
        }
        /// <summary> </summary>
        public static Image ConstrainProportions(Image imgPhoto, int Size, image_handler.Dimensions Dimension) {
            log.Info(" in ConstrainProportions ");
            //stellar.Services.LogService.writelog(" in ConstrainProportions ");
            int sourceWidth = imgPhoto.Width;
            int sourceHeight = imgPhoto.Height;
            int sourceX = 0;
            int sourceY = 0;
            int destX = 0;
            int destY = 0;
            float nPercent = 0;

            switch (Dimension) {
                case image_handler.Dimensions.Width:
                    nPercent = ((float)Size / (float)sourceWidth);
                    break;
                default:
                    nPercent = ((float)Size / (float)sourceHeight);
                    break;
            }

            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);

            Bitmap bmPhoto = new Bitmap(destWidth, destHeight, PixelFormat.Format24bppRgb);
            bmPhoto.SetResolution(imgPhoto.HorizontalResolution, imgPhoto.VerticalResolution);

            Graphics grPhoto = Graphics.FromImage(bmPhoto);
            grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;
            log.Info(" in ConstrainProportions mid drawing:");
            //stellar.Services.LogService.writelog(" in ConstrainProportions mid drawing:" );
            grPhoto.DrawImage(imgPhoto,
                new Rectangle(destX - 1, destY - 1, destWidth + 1, destHeight + 1),
                new Rectangle(sourceX, sourceY, sourceWidth - 1, sourceHeight - 1),
                // new Rectangle(destX,destY,destWidth,destHeight),
                // new Rectangle(sourceX,sourceY,sourceWidth,sourceHeight),
                GraphicsUnit.Pixel);
            log.Info(" in ConstrainProportions before Dispose ");
            //stellar.Services.LogService.writelog(" in ConstrainProportions before Dispose");
            //grPhoto.Dispose();
            return bmPhoto;
        }
        /// <summary> </summary>
        public static Image FixedSize(Image imgPhoto, int Width, int Height) {
            int sourceWidth = imgPhoto.Width;
            int sourceHeight = imgPhoto.Height;
            int sourceX = 0;
            int sourceY = 0;
            int destX = 0;
            int destY = 0;

            float nPercent = 0;
            float nPercentW = 0;
            float nPercentH = 0;

            nPercentW = ((float)Width / (float)sourceWidth);
            nPercentH = ((float)Height / (float)sourceHeight);

            //if we have to pad the height pad both the top and the bottom
            //with the difference between the scaled height and the desired height
            if (nPercentH < nPercentW) {
                nPercent = nPercentH;
                destX = (int)((Width - (sourceWidth * nPercent)) / 2);
            } else {
                nPercent = nPercentW;
                destY = (int)((Height - (sourceHeight * nPercent)) / 2);
            }

            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);

            Bitmap bmPhoto = new Bitmap(Width, Height, PixelFormat.Format24bppRgb);
            bmPhoto.SetResolution(imgPhoto.HorizontalResolution, imgPhoto.VerticalResolution);

            Graphics grPhoto = Graphics.FromImage(bmPhoto);
            grPhoto.Clear(Color.Red);
            grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;

            grPhoto.DrawImage(imgPhoto,
                new Rectangle(destX, destY, destWidth, destHeight),
                new Rectangle(sourceX, sourceY, sourceWidth, sourceHeight),
                GraphicsUnit.Pixel);

            grPhoto.Dispose();
            return bmPhoto;
        }
        /// <summary> </summary>
        public static Image Crop(Image imgPhoto, int Width, int Height, image_handler.AnchorPosition Anchor) {
            int sourceWidth = imgPhoto.Width;
            int sourceHeight = imgPhoto.Height;
            int sourceX = 0;
            int sourceY = 0;
            int destX = 0;
            int destY = 0;

            float nPercent = 0;
            float nPercentW = 0;
            float nPercentH = 0;

            nPercentW = ((float)Width / (float)sourceWidth);
            nPercentH = ((float)Height / (float)sourceHeight);

            if (nPercentH < nPercentW) {
                nPercent = nPercentW;
                switch (Anchor) {
                    case image_handler.AnchorPosition.Top:
                        destY = 0;
                        break;
                    case image_handler.AnchorPosition.Bottom:
                        destY = (int)(Height - (sourceHeight * nPercent));
                        break;
                    default:
                        destY = (int)((Height - (sourceHeight * nPercent)) / 2);
                        break;
                }
            } else {
                nPercent = nPercentH;
                switch (Anchor) {
                    case image_handler.AnchorPosition.Left:
                        destX = 0;
                        break;
                    case image_handler.AnchorPosition.Right:
                        destX = (int)(Width - (sourceWidth * nPercent));
                        break;
                    default:
                        destX = (int)((Width - (sourceWidth * nPercent)) / 2);
                        break;
                }
            }

            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);

            Bitmap bmPhoto = new Bitmap(Width, Height, PixelFormat.Format24bppRgb);
            bmPhoto.SetResolution(imgPhoto.HorizontalResolution, imgPhoto.VerticalResolution);

            Graphics grPhoto = Graphics.FromImage(bmPhoto);
            grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;

            grPhoto.DrawImage(imgPhoto,
                new Rectangle(destX - 1, destY - 1, destWidth + 1, destHeight + 1),
                new Rectangle(sourceX, sourceY, sourceWidth - 1, sourceHeight - 1),
                GraphicsUnit.Pixel);

            grPhoto.Dispose();
            return bmPhoto;
        }

    }
}
