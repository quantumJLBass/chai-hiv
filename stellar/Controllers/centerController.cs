#region using
using System;
using System.Collections;
using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.ActiveRecord.Framework;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using stellar.Models;
//using MonoRailHelper;
using System.IO;
using System.Net;
using System.Web;
using NHibernate.Criterion;
using System.Xml;
using System.Xml.XPath;
using System.Text.RegularExpressions;
using System.Text;
using System.Net.Sockets;
using System.Web.Mail;
using stellar.Services;

using System.CodeDom;
using System.CodeDom.Compiler;
using System.Reflection;
using Microsoft.CSharp;
using System.Reflection.Emit;
using System.Runtime.InteropServices;
using System.Runtime.Remoting;
using System.Threading;
using Microsoft.SqlServer.Types;
using System.Data.SqlTypes;
/* Newtonsoft slated to remove */
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;

using log4net;
using log4net.Config;



using System.Collections.ObjectModel;
using System.Dynamic;
using System.Linq;
using System.Web.Script.Serialization;

using System.Net.Mail;
using Castle.Components.Common.EmailSender;
using Castle.Components.Common.EmailSender.Smtp;

using System.Collections.Specialized;

using System.DirectoryServices;
using System.DirectoryServices.Protocols;
using System.DirectoryServices.AccountManagement;
#endregion


namespace stellar.Controllers {
    [Layout("simple")]
    public class centerController : BaseController {
        ILog log = log4net.LogManager.GetLogger("centerController");
        //srvr = ldap server, e.g. LDAP://domain.com
        //usr = user name
        //pwd = user password


        public void home() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //this is the default action so this is where the first check to install will have to go 
            //if (!Controllers.installController.is_installed()) Controllers.installController.start_install();
            RenderView("home");
        }
        
        public void login() {
            RenderView("login");
        }
        public void signin(String user,String checkhash) {
            if (String.IsNullOrWhiteSpace(user) && String.IsNullOrWhiteSpace(checkhash)) {
                Redirect("center", "login", new Hashtable());
            }
            Boolean loggedin = IsAuthenticated("LDAP://bosdc1.clintonhealthacess.org/", user, checkhash);
            Redirect("center", "login", new Hashtable());
        }
        public void logout() {
            logout_user();
            Redirect("center", "login", new Hashtable());
        }

        public Boolean is_pubview(Boolean pub) {
            if (context().Request.QueryString["pub"] == null) {
                HttpCookie myCookie = context().Request.Cookies["hivpubview"];
                // Read the cookie information and display it.
                if (myCookie != null) {
                    pub = Convert.ToBoolean(myCookie.Value);
                } else {
                    pub = true;
                }
            }
            HttpCookie veiwonlyCookie = context().Request.Cookies["hivviewonly"];
            if (veiwonlyCookie != null) {
                Boolean veiwonly=Convert.ToBoolean(veiwonlyCookie.Value);
                if (veiwonly) pub = true;
            }
            return pub;
        }

        #region(references)
        public void references(Boolean skiplayout, String exclude, Boolean pub) {
            //do the auth
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            PropertyBag["published"] = is_pubview(pub);
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            PropertyBag["items"] = ActiveRecordBase<reference>.FindAll().Where(x => !x.deleted && !drop.Contains(x.baseid.ToString()));
            RenderView("references");
        }
        public void reference(int id, Boolean skiplayout, String typed_ref) {
            //do the auth
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (!String.IsNullOrWhiteSpace(typed_ref)) PropertyBag["type"] = typed_ref;
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<reference>.Find(id);

            RenderView("reference");
        }

        [SkipFilter()]
        public void savereference([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] reference item,
            HttpPostedFile newfile,
            Boolean ajaxed_update,
            Boolean forced_tmp,
            String apply,
            String cancel,
            Boolean skiplayout) {
                if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (cancel != null) {
                Redirect("center", "references", new Hashtable());
                return;
            }

            
            if (!String.IsNullOrWhiteSpace(item.url)) {
                reference refer = ActiveRecordBase<reference>.FindFirst(new Order("url", false),
                   new List<AbstractCriterion>() { 
                                   Expression.Eq("url", item.url),
                               }.ToArray()
                );
                if (refer!=null && refer.baseid > 0)
                {
                    Flash["message"] = "Reference  existed.";
                    RedirectToUrl("~/center/reference.castle?id=" + refer.baseid);
                    return;
                }
            }

            //todo abstract this since the taxonmies also have need for this.  
            //when it's done remeber it should account for children

            //item.static_file
            item.tmp = false;





            if (item.meta_data!=null) item.meta_data.Clear();
            if (item.meta_data == null) item.meta_data = new List<meta_data>();
            //todo abstract this since the taxonmies also have need for this.  
            //when it's done remeber it should account for children
            String[] keys = HttpContext.Current.Request.Params.AllKeys.Where(x => x.StartsWith("value[")).ToArray();
            for (int i = 0; i <= keys.Count(); i++) {
                if (!String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["value[" + i + "]"])) {
                    String val = HttpContext.Current.Request.Form["value[" + i + "]"];
                    String option = HttpContext.Current.Request.Form["meta_key[" + i + "]"];
                    if (!String.IsNullOrWhiteSpace(option)) {
                        meta_data tmp = new meta_data() {
                            value = val,
                            meta_key = option,
                            post = item
                        };
                        item.meta_data.Add(tmp);
                    }
                }
            }
            ActiveRecordMediator<reference>.Save(item);

            if (newfile.ContentLength != 0) {
                String Fname = System.IO.Path.GetFileName(newfile.FileName);
                String[] fileparts = Fname.Split('.');

                Stream stream = newfile.InputStream;
                MemoryStream memoryStream = new MemoryStream();
                httpService.CopyStream(stream, memoryStream);
                memoryStream.Position = 0;
                stream = memoryStream;

                // a var for uploads will start here
                String uploadPath = file_info.root_path();
                if (!uploadPath.EndsWith("\\"))
                    uploadPath += "\\";
                uploadPath += @"refs\";

                if (!file_info.dir_exists(uploadPath)) {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }
                string file_path = uploadPath + item.baseid + "." + fileparts[1];
                newfile.SaveAs(file_path);
                item.static_file = @"/refs/"+item.baseid + "." + fileparts[1];
                ActiveRecordMediator<reference>.Save(item);
            }







            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied to reference edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied to reference edits";
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString());
                    } else {
                        RedirectToUrl("~/center/reference.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved reference edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved reference  edits ";
                ActiveRecordMediator<reference>.Save(item);
                /// ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "references", hashtable);
                return;
            }
        }
         [SkipFilter()]
        public void remove_reference(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<reference>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "references", new Hashtable());
        }

        #endregion

        #region(clinicals)
         public void clinicals(Boolean skiplayout, String exclude, Boolean pub) {
             if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
             pub = is_pubview(pub);
             PropertyBag["published"] = pub;
            //do the auth
            userService.clearTmps<clinical>();
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;

            IList<clinical> items = ActiveRecordBase<clinical>.FindAll();
            PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
            if (skiplayout) {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
            } else {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
            }
            RenderView("clinicals");
        }
         public void copyclinical(int id, String name) {
             CancelLayout();
             CancelView();
             var newObj = versionService._copy<clinical>(id, name, false);
             if (newObj != null && newObj.baseid > 0) {
                 Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                 RedirectToUrl("~/center/clinical.castle?id=" + newObj.baseid);
             } else {
                 Flash["error"] = "Failed to copy item.";
                 Hashtable hashtable = new Hashtable();
                 Redirect("center", "clinicals", hashtable);
             }
         }
        public static int make_clinical_tmp() {
            clinical tmp = new clinical();
            tmp.tmp = true;
            appuser user = userService.getUserFull();
            tmp.editing = user;
            ActiveRecordMediator<clinical>.Save(tmp);
            return tmp.baseid;
        }

        public void clinical(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_clinical_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<clinical>.Find(id);
            PropertyBag["drugs"] = ActiveRecordBase<drug>.FindAll().Where(x => !x.deleted);

            RenderView("clinical");
        }

         [SkipFilter()]
        public void saveclinical([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] clinical item,
            Boolean ajaxed_update,
            Boolean forced_tmp,
            String apply,
            String cancel,
            Boolean skiplayout) {
                if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());

            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (cancel != null) {
                if (item.tmp == true && item.baseid > 0) ActiveRecordMediator<clinical>.Delete(item);
                Redirect("center", "clinicals", new Hashtable());
                return;
            }
            

            //todo abstract this since the taxonmies also have need for this.  
            //when it's done remeber it should account for children
            if (item.taxonomies!=null) item.taxonomies.Clear();
            if (item.meta_data != null) item.meta_data.Clear();
            String[] keys = HttpContext.Current.Request.Params.AllKeys.Where(x => x.StartsWith("value[")).ToArray();
            for (int i = 0; i <= keys.Count(); i++) {
                if (!String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["value[" + i + "]"])) {
                    String val = HttpContext.Current.Request.Form["value[" + i + "]"];
                    String option = HttpContext.Current.Request.Form["option_key[" + i + "]"];
                    if (!String.IsNullOrWhiteSpace(val)) {
                        taxonomy tmp = ActiveRecordBase<taxonomy>.Find(Int32.Parse(option));
                        item.meta_data.Add(new meta_data() {
                            value = val,
                            meta_key = option
                        });
                        item.taxonomies.Add(tmp);
                    }
                }
            }
            if (item.published) item.content = "";
            item.tmp = false;
            ActiveRecordMediator<clinical>.Save(item);

            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied " + item.alias + " edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.alias + " edits for " + item.ln_clinical_t;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString() + "," + item.ln_clinical_t);
                    } else {
                        RedirectToUrl("~/center/clinical.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.alias + " edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.alias + " edits for " + item.ln_clinical_t;
                ActiveRecordMediator<clinical>.Save(item);
                /// ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "clinicals", hashtable);
                return;
            }
        }
         [SkipFilter()]
        public void remove_clinical(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<clinical>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "clinicals", new Hashtable());
        }
        #endregion
        #region(trials)
         public void trials(Boolean skiplayout, String exclude, Boolean pub) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            pub = is_pubview(pub);
            PropertyBag["published"] = pub;
            //do the auth
            userService.clearTmps<trial>();
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            IList<trial> items = ActiveRecordBase<trial>.FindAll();
            PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
            if (skiplayout) {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
            } else {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
            }
            RenderView("trials");
        }
         public static int make_trial_tmp() {
             trial tmp = new trial();
             tmp.tmp = true;
             appuser user = userService.getUserFull();
             tmp.editing = user;
             ActiveRecordMediator<trial>.Save(tmp);
             return tmp.baseid;
         }
         public void trial(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_trial_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<trial>.Find(id);
            RenderView("trial");
        }
        [SkipFilter()]
         public void savetrial([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] trial item,
            Boolean ajaxed_update,
            Boolean forced_tmp,
            String apply,
            String cancel,
            String transition,
            Boolean skiplayout) {
                if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (cancel != null) {
                if (item.tmp == true && item.baseid > 0) ActiveRecordMediator<trial>.Delete(item);
                Redirect("center", "trials", new Hashtable());
                return;
            }
            item.tmp = false;
            if (item.published) item.content = "";
            ActiveRecordMediator<trial>.Save(item);

            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied " + item.record_id + " edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.record_id + " edits for " + item.number;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString() + "," + item.number);
                    } else {
                        RedirectToUrl("~/center/trial.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.record_id + " edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.record_id + " edits for " + item.number;
                ActiveRecordMediator<trial>.Save(item);
                /// ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "trials", hashtable);
                return;
            }
        }

        [SkipFilter()]
        public void remove_trial(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<trial>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "trials", new Hashtable());
        }
        #endregion
        #region(drugs)
        public void drugs(Boolean skiplayout, String exclude, Boolean pub) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            pub = is_pubview(pub);
            PropertyBag["published"] = pub;
            //do the auth
            userService.clearTmps<drug>();
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            IList<drug> items = ActiveRecordBase<drug>.FindAll();
            PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
            if (skiplayout) {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
            } else {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
            }
            RenderView("drugs");
        }
        public static int make_drug_tmp() {
            drug tmp = new drug();
            tmp.tmp = true;
            appuser user = userService.getUserFull();
            tmp.editing = user;
            ActiveRecordMediator<drug>.Save(tmp);
            return tmp.baseid;
        }
        public void drug(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_drug_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<drug>.Find(id);
            RenderView("drug");
        }

        public void copydrug(int id, String name) {
            CancelLayout();
            CancelView();
            var newObj = versionService._copy<drug>(id, name, false);
            if (newObj != null && newObj.baseid > 0) {
                Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                RedirectToUrl("~/center/drug.castle.castle?id=" + newObj.baseid);
            } else {
                Flash["error"] = "Failed to copy item.";
                Hashtable hashtable = new Hashtable();
                Redirect("center", "drugs", hashtable);
            }

        }
        [SkipFilter()]
        public void savedrug([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] drug item,
            Boolean ajaxed_update,
            Boolean forced_tmp,
            String apply,
            String cancel,
            String transition,
            Boolean skiplayout) {
                if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());

            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (cancel != null) {
                if (item.tmp == true && item.baseid > 0) ActiveRecordMediator<drug>.Delete(item);
                Redirect("center", "drugs", new Hashtable());
                return;
            }

            item.markets.Clear();
            String[] keys = HttpContext.Current.Request.Params.AllKeys.Where(x => x.StartsWith("markets_counts[")).ToArray();
            for (int i = 1; i <= keys.Count(); i++) {
                String param_id = HttpContext.Current.Request.Form["markets_counts[" + i + "]"];
                String baseid = HttpContext.Current.Request.Form["markets[" + param_id + "].baseid"];
                String year = HttpContext.Current.Request.Form["markets[" + param_id + "].year"];
                String chai_ceiling_price = HttpContext.Current.Request.Form["markets[" + param_id + "].chai_ceiling_price"];
                String patients_on_therapy = HttpContext.Current.Request.Form["markets[" + param_id + "].patients_on_therapy"];
                String source_one = HttpContext.Current.Request.Form["markets[" + param_id + "].source_one"];
                String source_one_price = HttpContext.Current.Request.Form["markets[" + param_id + "].source_one_price"];
                String source_two = HttpContext.Current.Request.Form["markets[" + param_id + "].source_two"];
                String source_two_price = HttpContext.Current.Request.Form["markets[" + param_id + "].source_two_price"];

                drug_market market = new drug_market() {
                    year = year,
                    chai_ceiling_price = chai_ceiling_price,
                    patients_on_therapy = patients_on_therapy,
                    source_one = source_one,
                    source_one_price = source_one_price,
                    source_two = source_two,
                    source_two_price = source_two_price
                };

                ActiveRecordMediator<drug_market>.Save(market);
                item.markets.Add(market);
            }


            item.tmp = false;
            if (item.published) item.content = "";
            ActiveRecordMediator<drug>.Save(item);

            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied " + item.baseid + " edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.baseid + " edits for " + item.brand_name;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString() + "," + item.brand_name);
                    } else {
                        RedirectToUrl("~/center/drug.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.baseid + " edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.baseid + " edits for " + item.brand_name;
                ActiveRecordMediator<drug>.Save(item);
                /// ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "drugs", hashtable);
                return;
            }
        }
         [SkipFilter()]
        public void remove_drug(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<drug>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "drugs", new Hashtable());
        }
        #endregion
        #region(substances)
         public void substances(Boolean skiplayout, String exclude, Boolean pub) {
             if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
             pub = is_pubview(pub);
             PropertyBag["published"] = pub;
             //do the auth
            userService.clearTmps<substance>();
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "0";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            IList<substance> items = ActiveRecordBase<substance>.FindAll();
            PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
            if (skiplayout) {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
            } else {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
            }
            RenderView("substances");
        }
        public static int make_substance_tmp() {
             substance tmp = new substance();
             tmp.tmp = true;
             appuser user = userService.getUserFull();
             tmp.editing = user;
             ActiveRecordMediator<substance>.Save(tmp);
             return tmp.baseid;
         }
        public void substance(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_substance_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<substance>.Find(id);
            RenderView("substance");
        }
        [SkipFilter()]
        public void savesubstance([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] substance item,
            HttpPostedFile newfile,
            Boolean remove_file,
            Boolean ajaxed_update,
            Boolean forced_tmp,
            String apply,
            String cancel,
            String transition,
            Boolean skiplayout) {
                if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (cancel != null) {
                if (item.tmp == true && item.baseid > 0) ActiveRecordMediator<substance>.Delete(item);
                Redirect("center", "substances", new Hashtable());
                return;
            }



            item.tmp = false;
            if (item.published) item.content = "";

            if (remove_file) item.static_file = "";
            ActiveRecordMediator<substance>.Save(item);

            if (newfile.ContentLength != 0)
            {
                String Fname = System.IO.Path.GetFileName(newfile.FileName);


                Stream stream = newfile.InputStream;
                MemoryStream memoryStream = new MemoryStream();
                httpService.CopyStream(stream, memoryStream);
                memoryStream.Position = 0;
                stream = memoryStream;

                // a var for uploads will start here
                String uploadPath = file_info.root_path();
                if (!uploadPath.EndsWith("\\"))
                    uploadPath += "\\";
                uploadPath += @"substances\";

                if (!file_info.dir_exists(uploadPath))
                {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }
                string file_path = uploadPath + item.baseid + "." + Fname;
                newfile.SaveAs(file_path);
                item.static_file = @"/substances/" + item.baseid + "." + Fname;
                ActiveRecordMediator<substance>.Save(item);
            }

            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied " + item.lab_code + " edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.lab_code + " edits for " + item.generic_name;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString() + "," + item.generic_name);
                    } else {
                        RedirectToUrl("~/center/substance.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.lab_code + " edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.lab_code + " edits for " + item.generic_name;
                ActiveRecordMediator<substance>.Save(item);
                /// ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "substances", hashtable);
                return;
            }

            //do the auth
            RenderView("substance");
        }
         [SkipFilter()]
        public void remove_substance(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<substance>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "substances", new Hashtable());
        }

         #endregion



        





        public void reports() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_") && !x.meta_key.Contains("__name") ).ToList();
            List<user_meta_data> dataname = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_") && x.meta_key.Contains("__name") ).ToList();

            Hashtable hashtable = new Hashtable();
            foreach(user_meta_data item in dataname){
                hashtable.Add(item.meta_key, item.value);
            }

            PropertyBag["savedreports"] = data;
            PropertyBag["datanames"] = hashtable;

            RenderView("reports");
        }



        public void report() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            Dictionary<String, String> params_list = httpService.getPostParmas_obj();

            String type = params_list["type"];

            int c = 0;
            foreach (String key in params_list.Keys) {
                if (key.IndexOf("property") > -1) c++;
            }
            String Where = "";
            for (int i = 0; i < c; i++) {
                String property = "itm."+ params_list["property[" + i + "]"];

                String wherreOperator = params_list["operator[" + i + "]"];
                if (String.IsNullOrWhiteSpace(wherreOperator)) {
                    wherreOperator = " = ";
                }


                String value = "'";
                if (wherreOperator == "LIKE" || wherreOperator == "NOT LIKE") {
                    value = value + "%";
                }
                value = value + params_list["value[" + i + "]"].Trim(',');
                if (wherreOperator == "LIKE" || wherreOperator == "NOT LIKE")  {
                    value = value + "%";
                }
                value = value + "'";


                String joining = "";
                if (i > 0) {
                    joining = params_list["joining[" + i + "]"];
                }
                String clause = " " + property + " " + wherreOperator + " " + value + "";
                Where += (i == 0 ? " WHERE " : joining + " ") + clause;
            }
            String selected = " itm ";
            if (String.IsNullOrWhiteSpace(params_list["selected_properties"])) params_list["selected_properties"] = "*";
            if (params_list["selected_properties"] != "*") selected = params_list["selected_properties"];
            String sql = @"SELECT " + selected + " FROM " + type + " AS itm " + Where;

            if (type == "drug") {
                SimpleQuery<drug> pq = new SimpleQuery<drug>(typeof(drug), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "clinical") {
                SimpleQuery<clinical> pq = new SimpleQuery<clinical>(typeof(clinical), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "substance") {
                SimpleQuery<substance> pq = new SimpleQuery<substance>(typeof(substance), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "trial") {
                SimpleQuery<trial> pq = new SimpleQuery<trial>(typeof(trial), sql);
                PropertyBag["items"] = pq.Execute();
            }
            PropertyBag["type"] = type;
            PropertyBag["ran_query"] = sql;
            String qkey = helperService.CalculateMD5Hash(type + sql);
            PropertyBag["qkey"] = "sql_" + type + "_" + qkey;

            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key == qkey && !x.meta_key.Contains("__name")).ToList();
            List<user_meta_data> dataname = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key == qkey + "__name").ToList();


            if (data.Count() == 0) {
                PropertyBag["saved"] = false;
            } else {
                PropertyBag["saved"] = true;
            }
            PropertyBag["savedreports"] = data;
            PropertyBag["datanames"] = dataname;
            //RenderView("reports");
        }

        public void rerunreport(String type, String sql) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (type == "drug") {
                SimpleQuery<drug> pq = new SimpleQuery<drug>(typeof(drug), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "clinical") {
                SimpleQuery<clinical> pq = new SimpleQuery<clinical>(typeof(clinical), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "substance") {
                SimpleQuery<substance> pq = new SimpleQuery<substance>(typeof(substance), sql);
                PropertyBag["items"] = pq.Execute();
            }
            if (type == "trial") {
                SimpleQuery<trial> pq = new SimpleQuery<trial>(typeof(trial), sql);
                PropertyBag["items"] = pq.Execute();
            }
            PropertyBag["type"] = type;
            PropertyBag["ran_query"] = sql;

            String qkey = helperService.CalculateMD5Hash(type + sql);
            PropertyBag["qkey"] = "sql_" + type + "_" + qkey;

            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key == qkey && !x.meta_key.Contains("__name")).ToList();

            if (data.Count() == 0) {
                PropertyBag["saved"] = true;
            } else {
                PropertyBag["saved"] = false;
            }

            RenderView("report");
        }

        public void predefinedeport(String alias)
        {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            String type = "";
            String sql = "";
            if (alias == "drug_market_monitoring")
            {
                sql = "drug";

                SimpleQuery<drug> pq = new SimpleQuery<drug>(typeof(drug), sql);
                type = "";
                PropertyBag["items"] = pq.Execute();
            }
            PropertyBag["type"] = type;
            PropertyBag["ran_query"] = sql;

            //PropertyBag["saved"] = true;
            RenderView("report");
        }
        public void savereport(String type, String sql, String query_name)
        {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            appuser user = userService.getUser();
            String key = "sql_" + type + "_" + helperService.CalculateMD5Hash(type + sql);
            user_meta_data md = new user_meta_data() { meta_key = key, value = sql };
            user_meta_data md_name = new user_meta_data() { meta_key = key + "__name", value = query_name };
            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key == key).ToList();

            if (data.Count() == 0) {
                user.user_meta_data.Add(md);
                ActiveRecordMediator<appuser>.SaveAndFlush(user);
                user.user_meta_data.Add(md_name);
                ActiveRecordMediator<appuser>.SaveAndFlush(user);
                Flash["message"] = "New query saved";
                PropertyBag["saved"] = true; 
            } else {
                Flash["error"] = "Query already existed";
                PropertyBag["saved"] = false;
            }

            List<user_meta_data> olddata = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_") && !x.meta_key.Contains("__name")).ToList();
            List<user_meta_data> olddata_names = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_") && x.meta_key.Contains("__name")).ToList();
            PropertyBag["savedreports"] = olddata;
            PropertyBag["datanames"] = olddata_names;

            //RenderView("reports");
        }

        public void listsavedreports() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            appuser user = userService.getUser();
            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_")).ToList();

            //RenderView("reports");
        }



        public void delete_post<t>(int id) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            dynamic post = ActiveRecordBase<t>.Find(id);
            Flash["message"] = "A Place, <strong>" + post.name + "</strong>, has been <strong>deleted</strong>.";
            //logger.writelog("Moved event to the trash", getView(), getAction(), post.baseid);
            post.deleted = true;
            ActiveRecordMediator<dynamic>.SaveAndFlush(post);
        }

        public void trashbin() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            PropertyBag["postingtypes"] = ActiveRecordBase<posting_type>.FindAll();
            List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
            baseEx.Add(Expression.Eq("deleted", true));
            int limit = 99999;
            Order[] ord = new Order[1];
            ord[0] = Order.Asc("name");
            PropertyBag["trashbin"] = ActiveRecordBase<_base>.SlicedFindAll(0, limit, ord, baseEx.ToArray());

            //RenderView("trashbin");
        }
        public void massaction(int[] mass, String deletemass, String restoremass) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            foreach (int id in mass) {
                if (!String.IsNullOrWhiteSpace(restoremass)) {
                    dynamic item = ActiveRecordBase<_base>.Find(id);
                    // if (item.owner.baseid == userService.getUser().baseid) {
                    item.deleted = false;
                    ActiveRecordMediator<_base>.Save(item);
                    //}
                }
            }
            if (!String.IsNullOrWhiteSpace(restoremass)) {
                Flash["message"] = "Items " + mass.ToString() + ", has been <strong>restored</strong>.";
                logger.writelog("Removed Items " + mass.ToString() + ",  from the trash", getView(), getAction());
            }
            RedirectToAction("trashbin");
        }

        public void restore_item(int id) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            dynamic item = ActiveRecordBase<_base>.Find(id);
            if (item != null) {
                Flash["message"] = "<strong>" + item.name + "</strong>, has been <strong>restored</strong>.";
                logger.writelog("Removed item.name from the trash", getView(), getAction(), item.baseid);
                item.deleted = false;
                ActiveRecordMediator<publish_base>.Save(item);
            }
            CancelLayout();
            RedirectToAction("trashbin");
        }

        public Boolean is_viewonly() {

            Boolean viewstate = false;
            if (Controllers.BaseController.authenticated()) {
                viewstate = userService.checkPrivleage("is_view_only");
            }
            HttpCookie myCookie = Controllers.BaseController.context().Request.Cookies["hivviewonly"];

            if (Controllers.BaseController.context().Request.Params["viewonly"] == "1")  {
                viewstate = true;
            }
            if (myCookie != null) {
                viewstate = Convert.ToBoolean(myCookie.Value);
            }
            return viewstate;
        }


        public string feilds(string formfeild, string datatype, string model_prop, string value, string custom_lable, string placeholder, string html_class, string html_attr) {
            String html = "";
            switch (formfeild)
            {
                case "textinput":
                    {
                        html = feild_textinput(datatype, model_prop, value, custom_lable, placeholder, html_class, html_attr); break;
                    }
            }

            return html;
        }

        public string feild_textinput(string datatype, string model_prop, string value, string custom_lable, string placeholder, string html_class, string html_attr) {
            String html = "A text input";

            /*
		#set($feildObj=$!postingService.get_taxonomy($datatype, $model_prop,"SYSTEM__feild_helpers"))
		#if($feildObj && $feildObj.name!="")
			#set($lable=$feildObj.name)
		#end
		#if($custom_lable && $custom_lable!="")
			#set($lable=$custom_lable)
		#end

	#if($viewonly)
		<label >$lable: #feild_helper($feildObj)</label>
		$!value
	#else
		<label for="$model_prop">$lable: #feild_helper($feildObj)</label>
		<input type="text" name="item.$model_prop" id="$model_prop" #if($placholder!="")placeholder="$placholder"#end #if($class!="")class="$class"#end #if($value && $!value!="" && $!value!="System.String[]") value="$!value" #end $attr />
	#end
             */
            String lable = "";
            taxonomy feildObj = postingService.get_taxonomy(datatype, model_prop,"SYSTEM__feild_helpers");
            String field_helper = "";
	        if(feildObj.content!=""){
		        field_helper="<i class='icon-question-sign blue' title='"+feildObj.content+"></i>";
	        }

            if(feildObj.name!=""){
                lable=feildObj.name;
		    }
		    if(custom_lable!=""){
                lable=custom_lable;
            }

            if (is_viewonly()) {
                html = "<label >" + lable + ": " + field_helper + "</label> " + value;
            } else {

                String feild_name = "item." + model_prop;
                placeholder = (placeholder != "") ? "placeholder='" + placeholder + "'" : "";
                html_class = (html_class != "") ? "class='" + html_class + "'" : "";
                value = (value != "" && value != "System.String[]") ? "value='" + value + "'" : "";

                html = "<label for='" + model_prop + "'>" + lable + ": " + field_helper + "</label>" +
                "<input type='text' name='" + feild_name + "' id='" + model_prop + "' " + placeholder + " " + html_class + " " + value + " " + html_attr + " />";
            }




            return html;
        }





    }
}