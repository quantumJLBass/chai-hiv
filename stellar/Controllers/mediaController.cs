#region Directives
using System;
using System.Threading;
using System.Dynamic;
using System.Collections;
using System.Collections.Specialized;
using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.MonoRail.Framework;
using Castle.MonoRail.Framework.Helpers;
using Castle.MonoRail.ActiveRecordSupport;
using stellar.Models;
using stellar.Services;
//using MonoRailHelper;
using System.IO;
using System.Web;
using Castle.ActiveRecord.Queries;
using System.Data;
using System.Configuration;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Text.RegularExpressions;
using System.Text;

using log4net;
using log4net.Config;
using Goheer.EXIF;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Linq;
#endregion

namespace stellar.Controllers {
    [Layout("admin")]
    public class mediaController : adminController {
        ILog log = log4net.LogManager.GetLogger("mediaController");
        public mediaController() {
            Controllers.BaseController.current_controller = "media";
        }

        /*
         *  File structure of the media
         *  - uploads/media/                        //main media folder
         *      -mediaType/                         //mediaType folder (note there has to be a method that changes this)
         *          -media.id/                      //the id of the media
         *              • filename.*ext*            //note this would be the orginal image untounched even in name 
         *              • filename.ext              //the main ext (max size to 1000x1000 or site_settings)
         *              - type/                     //folder of type that the image will be tied to (/events/)
         *                  • filename_*arg*.ext    //the cache of the image sized as needed
         */



        public void Index() {
            //ActiveRecordBase<Block>.FindAll();
            PropertyBag["AccessDate"] = DateTime.Now;
        }

        /**/
        public void New() {
            String CreditList = GetCredit();
            PropertyBag["credits"] = CreditList;
            PropertyBag["imagetypes"] = ActiveRecordBase<taxonomy>.FindAll();
            PropertyBag["images"] = ActiveRecordBase<posting>.FindAll();
        }

        public void inlineupload() {
            String CreditList = GetCredit();
            PropertyBag["credits"] = CreditList;
            PropertyBag["imagetypes"] = ActiveRecordBase<taxonomy>.FindAll();
            PropertyBag["images"] = ActiveRecordBase<posting>.FindAll();
            CancelLayout();
        }





        public void Edit(int id) {

            String CreditList = GetCredit();
            PropertyBag["credits"] = CreditList; // string should be "location1","location2","location3"

            PropertyBag["imagetypes"] = ActiveRecordBase<taxonomy>.FindAll();
            PropertyBag["image"] = ActiveRecordBase<posting>.Find(id);
            PropertyBag["images"] = ActiveRecordBase<posting>.FindAll();
            RenderView("new");
        }

        public String GetCredit() {
            String sql = "SELECT DISTINCT s.credit FROM media_repo AS s WHERE NOT s.credit = 'NULL'";
            SimpleQuery<String> q = new SimpleQuery<String>(typeof(posting), sql);
            Array credits = q.Execute();
            String creditsList = "";
            foreach (String s in credits) {
                creditsList += '"' + s.ToString() + '"' + ',';
            }
            return creditsList.TrimEnd(',');
        }



        /**/
        public void removeImage(int image_id, int event_id, bool ajax) {
            posting image = ActiveRecordBase<posting>.Find(image_id);
            // a var for uploads will start here
            String uploadPath = file_info.root_path() + @"uploads\";
            if (event_id != 0) {
                uploadPath += @"events\" + event_id + @"\";
            }

            string newFile = uploadPath + image.id + ".ext";

            ActiveRecordMediator<posting>.Delete(image);
            if (event_id != 0) {
                posting events = ActiveRecordBase<posting>.Find(event_id);
                //events.images.Remove(image);//FIX IT
                FileInfo ImgFile = new FileInfo(newFile);
                ImgFile.Delete();
                ActiveRecordMediator<posting>.Save(events);
            }

            if (ajax) {
                CancelView();
                CancelLayout();
                RenderText("true");
                return;
            }
            Flash["message"] = "Image Added";
            RedirectToAction("list");
        }



        public void uploadFiles(IRequest request) {
            CancelLayout();
            CancelView();
            int i = 0;
            string json = HttpContext.Current.Request.Form["returnType"] == "id" ? "" : "[";
            object[] tmpMediaObj = new object[0];

            foreach (String key in HttpContext.Current.Request.Files.Keys) {
                HttpPostedFile file = HttpContext.Current.Request.Files[key];

                String Fname = System.IO.Path.GetFileName(file.FileName);
                String[] fileparts = Fname.Split('.');

                Stream stream = file.InputStream;
                MemoryStream memoryStream = new MemoryStream();
                httpService.CopyStream(stream, memoryStream);
                memoryStream.Position = 0;
                stream = memoryStream;


                bool ok = image_handler.checkImg(fileparts[1], stream); // should be mediaCheck
                if (!ok) {
                    json += "{\"status\":\"You have uploaded a CMYK image.  Please conver to RGB first then try again.  File not uploaded\"}";
                } else {
                    /*
                     * At this point the image seems sound so we want to set up the image fallbacks,
                     * We do this by first putting the org image in a folder under media and image,
                     * Next size the org into a .ext with max 1000x1000px for size, and thumbs if asked
                     * After the first size add any types (events/geo/etc) the media is tied to
                     */
                    /* Set Id */
                    posting media = new posting();
                    media.static_file = Fname;


                    media.meta_data.Add(new meta_data() { meta_key = "ext", value = fileparts[1] });

                    media.taxonomy_types.Add(ActiveRecordBase<taxonomy_type>.Find(3)); // this is to just set a base type just in cause
                    ActiveRecordMediator<posting>.Save(media);


                    String org_path = getUploadsPath("image\\" + media.id, false);
                    /* save orginal */
                    string org_File = org_path + fileparts[0] + "." + fileparts[1].ToLower();

                    if (file.ContentLength <= 0) log.Info("StartTheThread for " + media.static_file);


                    file.SaveAs(org_File);
                    /* save firstStage .ext unsized */
                    string tmp_File = org_path + fileparts[0] + ".ext";
                    file.SaveAs(tmp_File);


                    media.meta_data.Add(new meta_data() { meta_key = "orientation", value = image_handler.setOrientation(org_File) });

                    //media = imageService.pushXMPdb(media, org_File);
                    media.static_file = getUploadsRelavtivePath("image\\" + media.id, false) + fileparts[0] + "." + fileparts[1].ToLower();

                    int type = 3; // this would be a preference from stie_settings
                    int typeTmp = int.Parse(String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["mediatype"])
                                ? HttpContext.Current.Request.Form["mediatype[" + Fname + "]"]
                                : HttpContext.Current.Request.Form["mediatype"]);
                    if (typeTmp > 0) {
                        type = typeTmp;
                    }


                    media.taxonomy_types.Add(ActiveRecordBase<taxonomy_type>.Find(type));

                    String caption = String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["caption"])
                                        ? HttpContext.Current.Request.Form["caption[" + Fname + "]"]
                                        : HttpContext.Current.Request.Form["caption"];
                    if (!String.IsNullOrEmpty(caption) && caption != "undefined")
                        media.meta_data.Add(new meta_data() { meta_key="caption", value = caption});

                    String credit = String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["credit"])
                                    ? HttpContext.Current.Request.Form["credit[" + Fname + "]"]
                                    : HttpContext.Current.Request.Form["credit"];
                    if (!String.IsNullOrEmpty(credit) && credit != "undefined")
                        media.meta_data.Add(new meta_data() { meta_key = "credit", value = credit });
                    ActiveRecordMediator<posting>.Save(media);



                    String pool = String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["pool"])
                                    ? HttpContext.Current.Request.Form["pool[" + Fname + "]"]
                                    : HttpContext.Current.Request.Form["pool"];

                    int tmpPoolId = int.Parse(String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["pool_" + pool])
                        ? String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["pool_" + pool + "[" + Fname + "]"])
                                                        ? ""
                                                        : HttpContext.Current.Request.Form["pool_" + pool + "[" + Fname + "]"]
                                : HttpContext.Current.Request.Form["pool_" + pool]);
                    if (tmpPoolId > 0) {
                        applyMediaToObject(media, tmpPoolId, pool);
                    }

                    /* lets send note to the end user uploaded */
                    string mediaurl = "/media/download.castle?id=" + media.id + "&m=crop&w=148&h=100";
                    String tmpjson = "{\"name\":\"" + file.FileName +
                                "\",\"size\":" + file.ContentLength +
                                ",\"url\":\"/media/download.castle?id=" + media.id +
                                "\",\"thumbnail_url\":\"" + mediaurl + "\"}";
                    json += HttpContext.Current.Request.Form["returnType"] == "id" ? media.id.ToString() : tmpjson;
                    if (tmpMediaObj.Length > 0) Array.Resize(ref tmpMediaObj, tmpMediaObj.Length + 1);
                    tmpMediaObj.CopyTo(getMediaBuild(media, Fname), tmpMediaObj.Length);
                }
                i = i + 1;
            }
            json += HttpContext.Current.Request.Form["returnType"] == "id" ? "" : "]";
            HttpContext.Current.Response.Write(json);
            //startImage processing
            //startImageProcessing(tmpMediaObj);
            //end the respons as the image processing will run in  the background
            HttpContext.Current.ApplicationInstance.CompleteRequest();
        }

        /* maybe turn in to hashtable so that the keys can be used? */
        public Object[] getMediaBuild(posting media, String Fname) {
            Object[] tmp = new Object[1];
            tmp[0] = media;
            return tmp;
        }

        public void startImageProcessing(Object[] tmpMediaObj) {
            foreach (object[] media in tmpMediaObj) {
                createNewFile(media);
            }
        }
        public Thread StartTheThread(posting media, System.Drawing.Image processed_image, string tmp_File) {
            log.Info("StartTheThread for " + media.static_file + " with id " + media.id + " at path " + tmp_File);
            var t = new Thread(() => new image_handler().process(media.id, processed_image, tmp_File, image_handler.imageMethod.Constrain, 0, 0, 1000, image_handler.Dimensions.Width, true, "", media.get_meta("ext")));
            t.Start();
            return t;
        }


        /* from file that exists */
        public void createNewFile(object[] media) {
            posting mediaObj = (posting)media[0];
            String types_path = getUploadsPath("image\\" + mediaObj.taxonomy_types.First().alias + "\\" + mediaObj.taxonomy_types.First().alias, false);
            String url = getUploadsURL("image", true);
            string newFilePath = types_path + mediaObj.id + ".ext";
            string FileName = mediaObj.id + ".ext";

            byte[] contents = null;

            contents = File.ReadAllBytes(HttpContext.Server.MapPath(mediaObj.static_file));
            MemoryStream memoryStream = new MemoryStream(contents);

            System.Drawing.Image processed_image = null;
            processed_image = System.Drawing.Image.FromStream(memoryStream);

            try {
                log.Info("preping StartTheThread for " +
                            mediaObj.static_file + " with id " + mediaObj.id +
                            " at path " + newFilePath);
                StartTheThread(mediaObj, processed_image, newFilePath);
            } catch {
                log.Error("Failed trying to StartTheThread for " +
                            mediaObj.static_file + " with id " + mediaObj.id +
                            " at path " + newFilePath);
            }
        }




        public void applyMediaToObject(posting media, int id, string type) {
            switch (type) {
                case "events":
                    posting events = ActiveRecordBase<posting>.Find(id);
                    //events.images.Add(media);//FIX IT

                    ActiveRecordMediator<posting>.Save(events);


                    //events.Save();

                    // So this should be abstracted to the bottom where the events is a var and same with the id
                    String cachePath = file_info.root_path();
                    cachePath += @"uploads\";
                    cachePath += @"events\cache\";

                    string file = events.id + "_centralevents" + ".ext";
                    String file_path = cachePath + file;
                    if (File.Exists(file_path)) {
                        File.Delete(file_path);
                    }

                    break;
            }
        }
        /* START OF move to the service */
        /*
         * 
         * 
         * 
         */

        /* END OF move to the service */



        protected string getUploadsURL(string mediaType, bool usetemp) {
            if (String.IsNullOrEmpty(mediaType)) mediaType = "image";
            String Url = httpService.getRootUrl();
            if (!Url.EndsWith("\\"))
                Url += "\\";
            Url += @"uploads\media\" + mediaType + @"\";
            if (usetemp) Url += @"tmp\";
            return Url;
        }
        protected string getUploadsPath(string mediaType, bool usetemp) {

            if (String.IsNullOrEmpty(mediaType)) mediaType = "image";

            String path = file_info.root_path();
            path += @"uploads\media\" + mediaType + @"\";
            if (usetemp) path += @"tmp\";

            if (!file_info.dir_exists(path)) {
                System.IO.Directory.CreateDirectory(path);
            }
            return path;
        }
        protected string getUploadsRelavtivePath(string mediaType, bool usetemp) {
            String path = getUploadsPath(mediaType, usetemp);
            String directory = file_info.root_path();
            path = path.Replace(directory, "");
            if (!path.StartsWith("\\"))
                path = "\\" + path;
            if (!file_info.dir_exists(path)) {
                System.IO.Directory.CreateDirectory(path);
            }
            return path;
        }



        public void Update(
            [ARDataBind("image", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting image,
            HttpPostedFile newimage,
            int events_id,
            bool ajax
            ) {
                ActiveRecordMediator<posting>.Save(image);
            if (newimage.ContentLength != 0) {
                String Fname = System.IO.Path.GetFileName(newimage.FileName);
                String[] fileparts = Fname.Split('.');
                if (String.IsNullOrEmpty(image.get_meta("file_name"))) {
                    image.meta_data.Add(new meta_data() { meta_key = "file_name", value = fileparts[0] });
                }
                image.meta_data.Add(new meta_data() { meta_key = "ext", value = fileparts[1] });
                

                Stream stream = newimage.InputStream;
                MemoryStream memoryStream = new MemoryStream();
                httpService.CopyStream(stream, memoryStream);
                memoryStream.Position = 0;
                stream = memoryStream;


                //set up the image up from the stream
                System.Drawing.Image processed_image = System.Drawing.Image.FromStream(newimage.InputStream);

                if (image_handler.isFileACMYKJpeg(processed_image) || image_handler.isByteACMYK(stream)) {
                    if (ajax) {
                        CancelView();
                        CancelLayout();
                        RenderText("You have uploaded a CMYK image.  Please conver to RGB first.");
                        return;
                    }
                    Flash["error"] = "You have uploaded a CMYK image.  Please conver to RGB first.";
                    RedirectToReferrer();
                    return;
                }


                // a var for uploads will start here
                String uploadPath = file_info.root_path();
                if (!uploadPath.EndsWith("\\"))
                    uploadPath += "\\";
                uploadPath += @"uploads\";

                if (events_id != 0) {
                    uploadPath += @"events\" + events_id + @"\";
                }
                if (!file_info.dir_exists(uploadPath)) {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }
                string newFile = uploadPath + image.id + ".ext";
                log.Info("uploadfilename: " + newFile);
                //stellar.Services.LogService.writelog(" in Update " + newFile);

                //helperService.ResizeImage(newimage, uploadPath + image.id + ".ext", 1000, 1000, true);           
                new image_handler().process(image.id, processed_image, newFile, image_handler.imageMethod.Constrain, 0, 0, 1000, image_handler.Dimensions.Width, true, "", image.get_meta("ext"));
            }

            ActiveRecordMediator<posting>.Save(image);
            if (events_id != 0) {
                posting events = ActiveRecordBase<posting>.Find(events_id);
                //events.images.Add(image);//FIX IT
                ActiveRecordMediator<posting>.Save(events);
            }

            if (ajax) {
                CancelView();
                CancelLayout();
                RenderText(image.id.ToString());
                return;
            }
            Flash["message"] = "Image Added";
            RedirectToAction("list");
        }
        public void UpdatePool([ARDataBind("image", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting image, HttpPostedFile newimage) {
            ActiveRecordMediator<posting>.Save(image);
            if (newimage.ContentLength != 0) {
                String Fname = System.IO.Path.GetFileName(newimage.FileName);
                String[] fileparts = Fname.Split('.');
                if (String.IsNullOrEmpty(image.get_meta("file_name"))) {
                    image.meta_data.Add(new meta_data() { meta_key = "file_name", value = fileparts[0] });
                }
                image.meta_data.Add(new meta_data() { meta_key = "ext", value = fileparts[1] });

                // Make a copy of the stream to stop the destrustion of the gif animation per
                // http://stackoverflow.com/questions/8763630/c-sharp-gif-image-to-memorystream-and-back-lose-animation
                Stream stream = newimage.InputStream;
                MemoryStream memoryStream = new MemoryStream();
                httpService.CopyStream(stream, memoryStream);
                memoryStream.Position = 0;
                stream = memoryStream;

                //set up the image up from the stream
                //System.Drawing.Image processed_image = System.Drawing.Image.FromStream(newimage.InputStream);

                System.Drawing.Image processed_image = null;

                if (image.get_meta("ext") == "gif") {
                    //set up the image up from the stream
                    processed_image = System.Drawing.Image.FromStream(stream);//newimage.InputStream);
                } else {
                    processed_image = System.Drawing.Image.FromStream(newimage.InputStream);

                    if (image_handler.isFileACMYKJpeg(processed_image) || image_handler.isByteACMYK(stream)) {
                        Flash["error"] = "You have uploaded a CMYK image.  Please conver to RGB first.";
                        RedirectToReferrer();
                        return;
                    }
                }



                // a var for uploads will start here
                String uploadPath = file_info.root_path() + @"\uploads\";

                if (!file_info.dir_exists(uploadPath)) {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }
                string newFile = uploadPath + image.id + ".ext";         
                new image_handler().process(image.id, processed_image, newFile, image_handler.imageMethod.Constrain, 0, 0, 1000, image_handler.Dimensions.Width, true, "", image.get_meta("ext"));
            }
            ActiveRecordMediator<posting>.Save(image);
            RedirectToAction("list");
        }

        [SkipFilter()]
        public void getmap(string path) {
            CancelLayout();
            CancelView();

            // Read in the file into a byte array
            byte[] contents = null;

            String cachePath = file_info.root_path();

            try {
                contents = File.ReadAllBytes(cachePath + path);
            } catch (Exception ex) {
                log.Error("Error uploading file", ex);
            }

            HttpContext.Response.ClearContent();
            HttpContext.Response.ClearHeaders();
            if (contents != null) {
                String contentDisposition = "inline; filename=\"" + path + "\"";

                Response.Clear();
                String contentType = "image/gif";

                // Setup the response
                HttpContext.Response.Buffer = true;
                HttpContext.Response.AddHeader("Content-Length", contents.Length.ToString());
                DateTime dt = DateTime.Now.AddYears(1);
                HttpContext.Response.Cache.SetExpires(dt);
                HttpContext.Response.Cache.SetMaxAge(new TimeSpan(dt.ToFileTime()));
                HttpContext.Response.Cache.SetValidUntilExpires(true);
                HttpContext.Response.Cache.SetCacheability(HttpCacheability.Public);
                HttpContext.Response.Expires = 780000;
                HttpContext.Response.ContentType = contentType;

                // Write the file to the response
                HttpContext.Response.BinaryWrite(contents);
                //log.Info("Finished download for image id " + id + ", length: " + contents.Length.ToString() + " bytes");
            }
            HttpContext.Current.ApplicationInstance.CompleteRequest();
        }


        // h = height , w = width , p = percent, m = method , protect= stop sizing up of image, pre = prefix to image name 
        [SkipFilter()]
        public void Download(int id, int eventsid, int w, int h, int p, string m, bool protect, string pre, string mark, int maxage, bool nocache, bool mug) {
            CancelLayout();
            CancelView();
            log.Info("Starting download for image id " + id);
            posting image = ActiveRecordBase<posting>.Find(id);
            string uploadPath = "";

            if (image.static_file != null) {
                uploadPath = image.static_file;
                String fullpath = id + ".ext";
                uploadPath = Regex.Replace(uploadPath, "(.*)(\\\\.*?)(.*)", "$1");
                if (!uploadPath.EndsWith("\\"))
                    uploadPath += "\\";
            } else {
                // build the path for the new image
                uploadPath = Context.ApplicationPath + @"\uploads\";
                if (mug) {
                    uploadPath += @"mugshots\";
                }

                /**/
                if (eventsid != 0) {
                    posting events = ActiveRecordBase<posting>.Find(eventsid);
                    uploadPath += @"events\" + events.id + @"\";

                    //check for events level image existence
                    string orgFile = HttpContext.Server.MapPath(uploadPath + id + ".ext");
                    if (!File.Exists(orgFile)) {
                        //it didn't so lets take a look at the pool for the image
                        string newuploadPath = Context.ApplicationPath + @"\uploads\";
                        string neworgFile = HttpContext.Server.MapPath(newuploadPath + id + ".ext");
                        if (File.Exists(neworgFile)) {
                            uploadPath = Context.ApplicationPath + @"\uploads\";
                        }
                    }
                }
            }
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


            string newFile = HttpContext.Server.MapPath(uploadPath + id + arg + ".ext");

            // if the process image doesn't Exist yet create it
            if (!File.Exists(newFile)) {

                string baseFile = uploadPath + id + ".ext";
                if (!File.Exists(baseFile)) { baseFile = uploadPath + image.static_file; }

                System.Drawing.Image processed_image = System.Drawing.Image.FromFile(HttpContext.Server.MapPath(baseFile));
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
                new image_handler().process(id, processed_image, newFile, methodChoice, p, h, w, dimensional, protect, mark, image.get_meta("ext"));
            }

            // Read in the file into a byte array
            byte[] contents = null;
            try {
                contents = File.ReadAllBytes(HttpContext.Server.MapPath(uploadPath + id + arg + ".ext"));
            } catch (Exception ex) {
                log.Error("Error uploading file", ex);
            }

            HttpContext.Response.ClearContent();
            HttpContext.Response.ClearHeaders();
            if (contents != null) {
                String contentDisposition = "inline; filename=\"" + image.get_meta("filename") + arg + "." + image.get_meta("ext") + "\"";

                HttpContext.Response.Clear();
                String contentType = "applicaton/image";
                switch (image.get_meta("ext").ToLower()) {
                    case "gif":
                        contentType = "image/gif";
                        break;
                    case "png":
                        contentType = "image/png";
                        break;
                    case "jpg":
                    case "jpe":
                    case "jpeg":
                        contentType = "image/jpeg";
                        break;
                    case "bmp":
                        contentType = "image/bmp";
                        break;
                    case "tif":
                    case "tiff":
                        contentType = "image/tiff";
                        break;
                    case "eps":
                        contentType = "application/postscript";
                        break;
                    default:
                        contentDisposition = "attachment; filename=\"" + image.get_meta("filename") + arg + "." + image.get_meta("ext") + "\"";
                        contentType = "application/" + image.get_meta("ext").ToLower();
                        break;
                }

                // Setup the response
                HttpContext.Response.Buffer = true;
                HttpContext.Response.AddHeader("Content-Length", contents.Length.ToString());
                DateTime dt = DateTime.Now.AddYears(1);
                HttpContext.Response.Cache.SetExpires(dt);
                HttpContext.Response.Cache.SetMaxAge(new TimeSpan(dt.ToFileTime()));
                HttpContext.Response.Cache.SetValidUntilExpires(true);
                HttpContext.Response.Cache.SetCacheability(HttpCacheability.Public);
                HttpContext.Response.Expires = 0;
                HttpContext.Response.ContentType = contentType;
                //HttpContext.Response.AddHeader("Content-Disposition", "inline; filename=\"" + image.FileName + arg + "." + image.Ext + "\"");
                HttpContext.Response.Cache.SetMaxAge(new TimeSpan(84, 0, 0, 0, 0));
                // Write the file to the response
                HttpContext.Response.BinaryWrite(contents);
            }
            log.Info("Finished download for image id " + id + ", length: " + contents.Length.ToString() + " bytes");
            HttpContext.Current.ApplicationInstance.CompleteRequest();
        }


        //private string GetFileName(HttpPostedFile file)
        //{
        //    int i = 0, j = 0;
        //    string filename;
        //    filename = file.FileName;
        //    do
        //    {
        //        i = filename.IndexOf(@"\", j + 1);
        //        if (i >= 0) j = i;
        //    } while (i >= 0);
        //    filename = filename.Substring(j + 1, filename.Length - j - 1);
        //    return filename;
        //}

        [Layout("browser")]
        public void Browser(string type) {
            PropertyBag["images"] = ActiveRecordBase<posting>.FindAll();
        }
    }
}
