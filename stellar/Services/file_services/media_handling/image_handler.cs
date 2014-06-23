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
    public class image_handler {
        private static ILog log = log4net.LogManager.GetLogger("ImageService");

        /// <summary> </summary>
        public enum Dimensions {
            /// <summary> </summary>
            Width,
            /// <summary> </summary>
            Height
        }
        /// <summary> </summary>
        public enum AnchorPosition {
            /// <summary> </summary>
            Top,
            /// <summary> </summary>
            Center,
            /// <summary> </summary>
            Bottom,
            /// <summary> </summary>
            Left,
            /// <summary> </summary>
            Right
        }
        /// <summary> </summary>
        public enum imageMethod {
            /// <summary> </summary>
            Percent,
            /// <summary> </summary>
            Constrain,
            /// <summary> </summary>
            Fixed,
            /// <summary> </summary>
            Crop
        }


        #region(tests)


        /// <summary> </summary>
        public static bool isUploadAJpeg(HttpPostedFile someFile) {
            if (someFile.ContentType == "image/jpg" || someFile.ContentType == "image/jpeg" || someFile.ContentType == "image/pjpeg") {
                return true;
            }
            return false;
        }


        /// <summary> </summary>
        public static bool isByteACMYK(Stream image) {
            using (StreamReader sr = new StreamReader(image)) {
                string contents = sr.ReadToEnd();
                if (contents.ToLower().Contains("cmyk")) {
                    return true;
                }
            }
            return false;
        }


        /// <summary> </summary>
        public static bool isFileACMYKJpeg(System.Drawing.Image image) {
            System.Drawing.Imaging.ImageFlags flagValues = (System.Drawing.Imaging.ImageFlags)Enum.Parse(typeof(System.Drawing.Imaging.ImageFlags), image.Flags.ToString());
            if (flagValues.ToString().ToLower().IndexOf("ycck") == -1) {
                // based on http://www.maxostudio.com/Tut_CS_CMYK.cfm

                bool ret = false;
                try {
                    int cmyk = (image.Flags & (int)ImageFlags.ColorSpaceCmyk);
                    int ycck = (image.Flags & (int)ImageFlags.ColorSpaceYcck);

                    ret = ((cmyk > 0) || (ycck > 0));
                } catch (Exception ex) {
                    log4net.LogManager.GetLogger("ImageService").Error(ex.Message);
                }
                return ret;
            }
            return true;
        }
        /// <summary> </summary>
        public static Boolean checkImg(string ext, Stream stream) {
            // Make a copy of the stream to stop the destrustion of the gif animation per
            // http://stackoverflow.com/questions/8763630/c-sharp-gif-image-to-memorystream-and-back-lose-animation
            if (ext != "gif") {
                System.Drawing.Image img = System.Drawing.Image.FromStream(stream);
                if (isFileACMYKJpeg(img) || isByteACMYK(stream)) {
                    //stream.Dispose();
                    return false;
                }
            }
            //stream.Dispose();
            return true;
        }
        #endregion

        #region(normalize)
        /* RESTORE
        public static media_repo pushXMPdb(media_repo media, string pathToImageFile) {
           
                        Bitmap bmp = new Bitmap(pathToImageFile);
                        BitmapMetadata Mdata = (BitmapMetadata)bmp.Metadata;
                        string date = md.DateTaken; 
                        //object t = Mdata.GetQuery(@"/xmp/tiff:model");
                        


            return media;

        }*/
        /// <summary> </summary>
        public static string setOrientation(string pathToImageFile) {

            //http://dotmac.rationalmind.net/2009/08/correct-photo-orientation-using-exif/
            // Rotate the image according to EXIF data
            Bitmap bmp = new Bitmap(pathToImageFile);
            EXIFextractor exif = new EXIFextractor(ref bmp, "\n"); // get source from http://www.codeproject.com/KB/graphics/exifextractor.aspx?fid=207371
            string values = "";
            foreach (System.Web.UI.Pair s in exif) {
                // Remember the data is returned 
                // in a Key,Value Pair object
                values += "  -  " + s.First + "  " + s.Second;
            }
            log.Info("setOrientation at path " + pathToImageFile + " with" + values);
            if (exif["Orientation"] != null) {
                RotateFlipType flip = OrientationToFlipType(int.Parse(exif["Orientation"].ToString()));
                if (flip != RotateFlipType.RotateNoneFlipNone) // don't flip of orientation is correct
                {
                    bmp.RotateFlip(flip);
                    exif.setTag(0x112, "1"); // Optional: reset orientation tag
                    bmp.Save(pathToImageFile, ImageFormat.Jpeg);
                }
            }
            String or = null;
            if (exif["Image Width"] != null && exif["Image Height"] != null) {
                or = int.Parse(exif["Image Width"].ToString()) > int.Parse(exif["Image Height"].ToString()) ? "h" : "v";
            }
            if (String.IsNullOrEmpty(or)) {
                System.Drawing.Image img = System.Drawing.Image.FromFile(pathToImageFile);
                int width = img.Width;
                int height = img.Height;
                or = width > height ? "h" : "v";
                log.Info("exif was null so W:" + width + " & H:" + height + "  --- producing:" + or);
            }
            return or;
        }
        /// <summary> </summary>
        private static RotateFlipType OrientationToFlipType(int orientation) {
            RotateFlipType action = RotateFlipType.RotateNoneFlipNone;
            switch (orientation) {
                case 1:
                    action = RotateFlipType.RotateNoneFlipNone;
                    break;
                case 2:
                    action = RotateFlipType.RotateNoneFlipX;
                    break;
                case 3:
                    action = RotateFlipType.Rotate180FlipNone;
                    break;
                case 4:
                    action = RotateFlipType.Rotate180FlipX;
                    break;
                case 5:
                    action = RotateFlipType.Rotate90FlipX;
                    break;
                case 6:
                    action = RotateFlipType.Rotate90FlipNone;
                    break;
                case 7:
                    action = RotateFlipType.Rotate270FlipX;
                    break;
                case 8:
                    action = RotateFlipType.Rotate270FlipNone;
                    break;
                default:
                    action = RotateFlipType.RotateNoneFlipNone;
                    break;
            }
            return action;
        }


        #endregion

        #region(read/write)
        /// <summary> </summary>
        public static void saveIamge(int id, string NewFile, Image imgPhoto) {
            log.Info("saving photo to filepath: " + NewFile);
            // create a writer and open the file
            //stellar.Services.LogService.writelog(" in saveIamge " + NewFile);


            imgPhoto.Save(NewFile);
            //compress the file
            //if(HttpContext.Current!=null)ImageService.smushit(id, NewFile, GetMimeType(imgPhoto));
            imgPhoto.Dispose();
        }
        /// <summary> </summary>
        public static void deleteTmpIamges(string image_path) {
            log.Info("saving photo to filepath: " + image_path);
            // create a writer and open the file
            //stellar.Services.LogService.writelog("Deleting Images: " + image_path);
            File.Delete(image_path);
        }

        #endregion

        /// <summary> </summary>
        public static String image(int id, int w, int h, int p, string m, bool protect, string pre, string mark, bool nocache) {
            posting image = ActiveRecordBase<posting>.Find(id);
            string uploads_path = file_info.site_uploads_path() ;
            string[] generalized_file_path = image.static_file.Split(new String[] { "uploads/", "images/" }, StringSplitOptions.RemoveEmptyEntries);
            string file_path = file_handler.normalize_path(uploads_path.Trim('/') + "/images/" + generalized_file_path[generalized_file_path.Length - 1].Trim('/'));
            String[] fileparts = file_path.Split('.');
            string ext = fileparts[fileparts.Length - 1];

            string cache_path = file_info.site_cache_path().Trim('/') + "/uploads/images/";
            string cached_file = cache_path + generalized_file_path[generalized_file_path.Length - 1].Trim('/');

            string cache_url = file_info.relative_site_cache_path().Trim('/') + "/uploads/images/";
            string cached_url = cache_url + generalized_file_path[generalized_file_path.Length - 1].Trim('/');


            if (String.IsNullOrWhiteSpace(m)) {
                m = "constrain";
                w = 1000;//this will be site prefenece for max served iamges.
                h = 1000;
            }

            string arg = (!String.IsNullOrEmpty(pre) ? "_" + pre + "_" : "");
            arg += (w != 0 ? "w_" + w + "_" : "");
            arg += (h != 0 ? "h_" + h + "_" : "");
            arg += (p != 0 ? "p_" + p + "_" : "");
            arg += (protect != false ? "pro_true_" : "");
            arg += (!String.IsNullOrEmpty(m) ? "m_" + m + "_" : "");
            arg += (!String.IsNullOrEmpty(mark) ? "mark_" + mark + "_" : "");




            String[] c_file_parts = cached_file.Split(new string[] { "." + ext }, StringSplitOptions.None);
            string cached_file_path = c_file_parts[0] + id + arg + "." + ext;

            String[] c_cached_url = cached_url.Split(new string[] { "." + ext }, StringSplitOptions.None);
            string cached_file_url = c_cached_url[0] + id + arg + "." + ext;


            // if the process image doesn't Exist yet create it
            if (!File.Exists(cached_file_path)) {
                System.Drawing.Image processed_image = null;
                try{
                    processed_image = System.Drawing.Image.FromFile(file_path);
                } catch (Exception ex) {
                    throw new IOException(ex.Message.Insert(ex.Message.Length, " " + file_path));
                }
                if(processed_image!=null){
                    //set some defaults
                    image_handler.imageMethod methodChoice = image_handler.imageMethod.Percent;
                    image_handler.Dimensions dimensional = image_handler.Dimensions.Width;

                    //choose medth of sizing and set their defaults
                    switch (m) {
                        case "percent":
                            methodChoice = image_handler.imageMethod.Percent;
                            break;
                        case "constrain":
                            methodChoice = image_handler.imageMethod.Constrain;
                            dimensional = w != 0 ? image_handler.Dimensions.Width : image_handler.Dimensions.Height;
                            break;
                        case "fixed":
                            methodChoice = image_handler.imageMethod.Fixed;
                            break;
                        case "crop":
                            methodChoice = image_handler.imageMethod.Crop;
                            break;
                    }
                    new image_handler().process(id, processed_image, cached_file_path, methodChoice, p, h, w, dimensional, protect, mark, image.get_meta("ext"));
                }

            }
            return cached_file_url;

        }



        /// <summary> </summary>
        public void process(int id, Image OriginalFile, string NewFile, imageMethod method, int percent, int height, int width, Dimensions dimensions, bool protect, string mark, string ext) {
            /* example usage
            imgPhoto = ScaleByPercent(imgPhotoVert, 50);
            imgPhoto = ConstrainProportions(imgPhotoVert, 200, Dimensions.Width);
            imgPhoto = FixedSize(imgPhotoVert, 200, 200);
            imgPhoto = Crop(imgPhotoVert, 200, 200, AnchorPosition.Center);
            imgPhoto = Crop(imgPhotoHoriz, 200, 200, AnchorPosition.Center);
            */

            if (ext != "gif") {
                // Prevent using images internal thumbnail
                OriginalFile.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipNone);
                OriginalFile.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipNone);
            }
            Image imgPhoto = null;
            ImageFormat type = get_image_type(OriginalFile);


            //check to see if the image need protection from sizing up
            if (protect && !image_sizing.protectSize(OriginalFile, width, height, true)) {
                saveIamge(id, NewFile, OriginalFile); // save image
                return;
            }
            log.Info(" in process pre size" + NewFile);
            //stellar.Services.LogService.writelog(" in process pre size" + NewFile);
            switch (method) {
                case imageMethod.Percent:
                    imgPhoto = image_sizing.ScaleByPercent(OriginalFile, percent);
                    break;

                case imageMethod.Constrain:
                    imgPhoto = image_sizing.ConstrainProportions(OriginalFile, width != 0 ? width : height, dimensions);
                    break;

                case imageMethod.Fixed:
                    imgPhoto = image_sizing.FixedSize(OriginalFile, width, height);
                    break;

                case imageMethod.Crop:
                    imgPhoto = image_sizing.Crop(OriginalFile, width, height, AnchorPosition.Center);
                    break;
            }
            if (!String.IsNullOrEmpty(mark)) {
                imgPhoto = watermaking.watermaker_img(imgPhoto, id, mark);
            }
            log.Info(" in process postsize" + NewFile);

            //stellar.Services.LogService.writelog(" in process postsize" + NewFile);

            saveIamge(id, NewFile, imgPhoto); // save image
        }

        #region(image information)
        //This needs to move in to the mime class
        /// <summary> </summary>
        public static string GetMimeType(Image i) {
            Guid imgguid = i.RawFormat.Guid;
            foreach (ImageCodecInfo codec in ImageCodecInfo.GetImageDecoders()) {
                if (codec.FormatID == imgguid)
                    return codec.MimeType;
            }
            return "image/unknown";
        }

        /// <summary> </summary>
        static ImageFormat get_image_type(Image imgPhoto) {
            ImageFormat imageFormat = imgPhoto.RawFormat;
            if (imgPhoto.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Jpeg)) {
                return ImageFormat.Jpeg;
            } else if (imgPhoto.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Png)) {
                return ImageFormat.Png;
            } else if (imgPhoto.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Gif)) {
                return ImageFormat.Gif;
            } else if (imgPhoto.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Tiff)) {
                return ImageFormat.Tiff;
            } else if (imgPhoto.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Bmp)) {
                return ImageFormat.Bmp;
            }
            return null;
        }
        #endregion

        #region(manipulation)



        



        #endregion



        #region(optimise)
        /// <summary> </summary>
            public static bool smushit(int id, string image_name, String mimeType) {
                // sent file to yahoo
                string url = "http://www.smushit.com/ysmush.it/ws.php?";// "http://www.smushit.com/ysmush.it/ws.php?";
                log.Info("trying smushit" + image_name);
                //reset the .ext file name
                posting image = ActiveRecordBase<posting>.Find(id);

                string orgFile = image_name;
                image_name = Regex.Replace(image_name, ".ext", "." + image.get_meta("ext"), RegexOptions.IgnoreCase);

                File.Copy(orgFile, image_name, true);

                NameValueCollection nvc = new NameValueCollection();
                //nvc.Add("id", "TTR");
                //nvc.Add("btn-submit-photo", "Upload");
                string yurl = "";
                try {
                    String responseData = httpService.HttpUploadFile(url, image_name, "files", file_mime.mime_type(image.get_meta("ext")), nvc);
                    JObject obj = JObject.Parse(responseData);
                    yurl = (string)obj["dest"]; // what is the path?
                } catch {
                }
                if (!String.IsNullOrEmpty(yurl)) {
                    log.Info("did smushit" + yurl);
                    byte[] imagebytes = httpService.DownloadBinary(yurl);
                    file_handler.ByteArrayToFile(image_name, imagebytes);
                    File.Copy(image_name, orgFile, true);// overwirte the .ext with the new file.
                    //File.Delete(image_name);
                    deleteTmpIamges(image_name);
                    return true;
                } else {
                    return false;
                }
            }
        #endregion





    }
}
