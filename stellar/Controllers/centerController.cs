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
    /// <summary> </summary>
    [Layout("simple")]
    public class centerController : BaseController {
        ILog log = log4net.LogManager.GetLogger("centerController");
        //srvr = ldap server, e.g. LDAP://domain.com
        //usr = user name
        //pwd = user password


        /// <summary> </summary>
        public void home() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //this is the default action so this is where the first check to install will have to go 
            //if (!Controllers.installController.is_installed()) Controllers.installController.start_install();
            RenderView("home");
        }

        /// <summary> </summary>
        public void login() {
            RenderView("login");
        }
        /// <summary> </summary>
        public void signin(String user,String checkhash) {
            if (String.IsNullOrWhiteSpace(user) && String.IsNullOrWhiteSpace(checkhash)) {
                Redirect("center", "login", new Hashtable());
            }
            Boolean loggedin = IsAuthenticated("LDAP://bosdc1.clintonhealthacess.org/", user, checkhash);
            Redirect("center", "login", new Hashtable());
        }
        /// <summary> </summary>
        public void logout() {
            logout_user();
            Redirect("center", "login", new Hashtable());
        }

        /// <summary> </summary>
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
        /// <summary> </summary>
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
        /// <summary> </summary>
        public void reference(int id, Boolean skiplayout, String typed_ref) {
            //do the auth
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (!String.IsNullOrWhiteSpace(typed_ref)) PropertyBag["type"] = typed_ref;
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<reference>.Find(id);

            RenderView("reference");
        }

        /// <summary> </summary>
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
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "references", hashtable);
                return;
            }
        }
        /// <summary> </summary>
         [SkipFilter()]
        public void remove_reference(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<reference>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "references", new Hashtable());
        }

        #endregion

         #region(clinicals)
         /// <summary> </summary>
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
         /// <summary> </summary>
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
         /// <summary> </summary>
        public static int make_clinical_tmp() {
            clinical tmp = new clinical();
            tmp.tmp = true;
            appuser user = userService.getUserFull();
            tmp.editing = user;
            ActiveRecordMediator<clinical>.Save(tmp);
            return tmp.baseid;
        }

        /// <summary> </summary>
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

        /// <summary> </summary>
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
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "clinicals", hashtable);
                return;
            }
        }
         /// <summary> </summary>
         [SkipFilter()]
        public void remove_clinical(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<clinical>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "clinicals", new Hashtable());
        }
        #endregion
         #region(trials)
         /// <summary> </summary>
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
         /// <summary> </summary>
         public static int make_trial_tmp() {
             trial tmp = new trial();
             tmp.tmp = true;
             appuser user = userService.getUserFull();
             tmp.editing = user;
             ActiveRecordMediator<trial>.Save(tmp);
             return tmp.baseid;
         }
         /// <summary> </summary>
         public void trial(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_trial_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<trial>.Find(id);
            RenderView("trial");
        }
         /// <summary> </summary>
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
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "trials", hashtable);
                return;
            }
        }

        /// <summary> </summary>
        [SkipFilter()]
        public void remove_trial(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<trial>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "trials", new Hashtable());
        }
        #endregion
        #region(drug_families)
        /// <summary> </summary>
        public void families(Boolean skiplayout, String exclude, Boolean pub) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            pub = is_pubview(pub);
            PropertyBag["published"] = pub;
            //do the auth
            userService.clearTmps<drug_family>();
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "";
            String[] drop = exclude.Split(',');
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            IList<drug_family> items = ActiveRecordBase<drug_family>.FindAll();
            PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
            if (skiplayout) {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
            } else {
                PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
            }
            RenderView("families");
        }
        /// <summary> </summary>
        public static int make_family_tmp() {
            drug_family tmp = new drug_family();
            tmp.tmp = true;
            appuser user = userService.getUserFull();
            tmp.editing = user;
            ActiveRecordMediator<drug_family>.Save(tmp);
            return tmp.baseid;
        }
        /// <summary> </summary>
        public void family(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_family_tmp();
            if (id > 0) {
                drug_family fam = ActiveRecordBase<drug_family>.Find(id);
                PropertyBag["item"] = fam;

                List<substance> substances = new List<substance>();
                substances.AddRange(fam.substances);
                if (substances.Count == 0) {
                    substances.Add(new substance());
                    PropertyBag["substances"] = substances;
                }


            }

            RenderView("family");
        }

        /// <summary> </summary>
        public void copyfamily(int id, String name) {
            CancelLayout();
            CancelView();
            var newObj = versionService._copy<drug_family>(id, name, false);
            if (newObj != null && newObj.baseid > 0) {
                Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                RedirectToUrl("~/center/family.castle?id=" + newObj.baseid);
            } else {
                Flash["error"] = "Failed to copy item.";
                Hashtable hashtable = new Hashtable();
                Redirect("center", "families", hashtable);
            }

        }
        /// <summary> </summary>
        [SkipFilter()]
        public void savefamily([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] drug_family item,
            [ARDataBind("family_substance", Validate = true, AutoLoad = AutoLoadBehavior.OnlyNested)]family_substance[] family_substance,
            [ARDataBind("substances", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)]substance[] substances,
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
                if (item.tmp == true && item.baseid > 0) ActiveRecordMediator<drug_family>.Delete(item);
                Redirect("center", "families", new Hashtable());
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


            //item.substances.Clear();
            /* for the expaned lookup table */
            foreach (family_substance si in family_substance) {
                if (si.substance != null && si.substance.baseid > 0) {
                    family_substance find = ActiveRecordBase<family_substance>.FindFirst(new ICriterion[] { Expression.Eq("substance", si.substance), Expression.Eq("family", item) });
                    if (find==null){
                        find = new family_substance() {
                            family = item,
                            substance = si.substance,
                            substance_order = si.substance_order
                        };
                    } else {
                        find.substance_order = si.substance_order;
                    }
                    ActiveRecordMediator<family_substance>.Save(find);
                }
            }
            foreach (substance substance in substances) {
                if (substance.id > 0 && !item.substances.Contains(substance)) {
                    item.substances.Add(substance);
                }
            }





            item.tmp = false;
            if (item.published) item.content = "";
            ActiveRecordMediator<drug_family>.Save(item);

            //do the auth
            if (apply != null || ajaxed_update) {
                logger.writelog("Applied " + item.baseid + " edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.baseid + " edits for " + item.name;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout(); CancelView();
                        RenderText(item.baseid.ToString() + "," + item.name);
                    } else {
                        RedirectToUrl("~/center/family.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.baseid + " edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.baseid + " edits for " + item.name;
                ActiveRecordMediator<drug_family>.Save(item);
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "families", hashtable);
                return;
            }
        }
        /// <summary> </summary>
        [SkipFilter()]
        public void remove_family(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<drug_family>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "families", new Hashtable());
        }
        #endregion
        #region(drugs)
        /// <summary> </summary>
        public void drugs(Boolean skiplayout, String exclude, Boolean pub, Boolean json, string callback) {
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

            if (json) {
                CancelLayout();
                CancelView();
                String json_str = "";
                items = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString())).ToList();
                json_str += @"  { 
";
                foreach (drug item in items) {
                    json_str += @"""" + item.baseid + @""":{";
                    json_str += @"""baseid"":""" + item.baseid + @""",";
                    // json_str += @"""fam_baseid"":""" + sub.families.First().family.baseid + @""",";
                    json_str += @"""name"":""" + item.name + @""",";
                    json_str += @"""lab_code"":""" + item.lab_code + @""",";
                    // json_str += @"""fam_baseid"":""" + sub.families.First().family.baseid + @""",";
                    json_str += @"""label_claim"":""" + item.label_claim + @""",";
                    json_str += @"""manufacturer"":""" + item.manufacturer + @"""";
                    json_str += @"
},";
                    // this vodo of the new line is wrong
                    json_str += "".Replace(@"
", String.Empty);


                }
                json_str += @"
}";


                if (!string.IsNullOrEmpty(callback)) {
                    json_str = callback + "(" + json_str + ")";
                }
                Response.ContentType = "application/json; charset=UTF-8";
                RenderText(json_str);
            } else {

                PropertyBag["draft_count"] = items.Where(x => !x.tmp && !x.deleted && !x.published && !drop.Contains(x.baseid.ToString())).Count();
                if (skiplayout) {
                    PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString()));
                } else {
                    PropertyBag["items"] = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString()));
                }
                RenderView("drugs");
            }
        }
        /// <summary> </summary>
        public static int make_drug_tmp() {
            drug tmp = new drug();
            tmp.tmp = true;
            appuser user = userService.getUserFull();
            tmp.editing = user;
            ActiveRecordMediator<drug>.Save(tmp);
            return tmp.baseid;
        }
        /// <summary> </summary>
        public void drug(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_drug_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<drug>.Find(id);
            RenderView("drug");
        }

        /// <summary> </summary>
        public void copydrug(int id, String name) {
            CancelLayout();
            CancelView();
            var newObj = versionService._copy<drug>(id, name, false);
            if (newObj != null && newObj.baseid > 0) {
                Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                RedirectToUrl("~/center/drug.castle?id=" + newObj.baseid);
            } else {
                Flash["error"] = "Failed to copy item.";
                Hashtable hashtable = new Hashtable();
                Redirect("center", "drugs", hashtable);
            }

        }
        /// <summary> </summary>
        [SkipFilter()]
        public void savedrug([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] drug item,
            Boolean ajaxed_update,
            Boolean json,
            String callback,
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
            /*
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
            */

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
                        if (json) {
                            String json_str = "";

                            json_str += @"  { 
";

                            json_str += @"""" + item.baseid + @""":{";
                            json_str += @"""baseid"":""" + item.baseid + @""",";
                            // json_str += @"""fam_baseid"":""" + sub.families.First().family.baseid + @""",";
                            json_str += @"""name"":""" + item.brand_name + @""",";
                            json_str += @"""label_claim"":""" + item.label_claim + @""",";
                            json_str += @"""manufacturer"":""" + item.manufacturer + @"""";
                            json_str += @"
},";
                                // this vodo of the new line is wrong
                            json_str += "".Replace(@"
", String.Empty);


                            json_str += @"
}";


                            if (!string.IsNullOrEmpty(callback)) {
                                json_str = callback + "(" + json_str + ")";
                            }
                            Response.ContentType = "application/json; charset=UTF-8";
                            RenderText(json_str);
                        } else {
                            RenderText(item.baseid.ToString() + "," + item.brand_name);
                        }
                        
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
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "drugs", hashtable);
                return;
            }
        }
        /// <summary> </summary>
         [SkipFilter()]
        public void remove_drug(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<drug>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "drugs", new Hashtable());
        }
        #endregion
         #region(substances)
         /// <summary> </summary>
         public void substances(Boolean skiplayout, String exclude, Boolean pub, Boolean json, string callback) {
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


            if (json) {
                CancelLayout();
                CancelView();
                String json_str = "";
                items = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString())).ToList();
                json_str += @"  { 
";
                foreach (substance sub in items) {
                    json_str += @""""+sub.baseid+@""":{";
                    json_str += @"""baseid"":"""+sub.baseid+@""",";
                   // json_str += @"""fam_baseid"":""" + sub.families.First().family.baseid + @""",";
                    json_str += @"""name"":""" + postingService.get_taxonomy(sub.generic_name).name + @""",";
                    json_str += @"""lab_code"":""" + sub.lab_code + @"""";
                    json_str += @"
},";
                    // this vodo of the new line is wrong
                    json_str += "".Replace(@"
", String.Empty);


                }
                json_str += @"
}";


                if (!string.IsNullOrEmpty(callback)) {
                    json_str = callback + "(" + json_str + ")";
                }
                Response.ContentType = "application/json; charset=UTF-8";
                RenderText(json_str);
            } else {
                if (skiplayout) {
                    items = items.Where(x => !x.tmp && !x.deleted && !drop.Contains(x.baseid.ToString())).ToList();
                } else {
                    items = items.Where(x => !x.tmp && !x.deleted && x.published == pub && !drop.Contains(x.baseid.ToString())).ToList();
                }
                 PropertyBag["items"] = items;
                RenderView("substances");
            }
        }

         /// <summary> </summary>
        public static int make_substance_tmp() {
             substance tmp = new substance();
             tmp.tmp = true;
             appuser user = userService.getUserFull();
             tmp.editing = user;
             ActiveRecordMediator<substance>.Save(tmp);
             return tmp.baseid;
         }
        /// <summary> </summary>
        public void substance(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            //do the auth
            if (skiplayout) CancelLayout();
            PropertyBag["skiplayout"] = skiplayout;
            if (id <= 0) id = make_substance_tmp();
            if (id > 0) PropertyBag["item"] = ActiveRecordBase<substance>.Find(id);
            RenderView("substance");
        }
        /// <summary> </summary>
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
                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                //hashtable.Add("post_type", item.post_type.alias);
                Redirect("center", "substances", hashtable);
                return;
            }

            //do the auth
            //RenderView("substance");
        }
        /// <summary> </summary>
         [SkipFilter()]
        public void remove_substance(int id, Boolean skiplayout) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            delete_post<substance>(id);
            Flash["message"] = "Removed Item";
            Redirect("center", "substances", new Hashtable());
        }

         #endregion









         /// <summary> </summary>
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



        /// <summary> </summary>
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

        /// <summary> </summary>
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

        /// <summary> </summary>
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
        /// <summary> </summary>
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

        /// <summary> </summary>
        public void listsavedreports() {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            appuser user = userService.getUser();
            List<user_meta_data> data = ActiveRecordBase<user_meta_data>.FindAll().Where(x => x.meta_key.Contains("sql_")).ToList();

            //RenderView("reports");
        }



        /// <summary> </summary>
        public void delete_post<t>(int id) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            dynamic post = ActiveRecordBase<t>.Find(id);
            Flash["message"] = "A Place, <strong>" + post.name + "</strong>, has been <strong>deleted</strong>.";
            //logger.writelog("Moved event to the trash", getView(), getAction(), post.baseid);
            post.deleted = true;
            ActiveRecordMediator<dynamic>.SaveAndFlush(post);
        }

        /// <summary> </summary>
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
        /// <summary> </summary>
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

        /// <summary> </summary>
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










        /// <summary> </summary>
        public void get_taxonomies(String tax, String exclude, string callback) {
            if (!Controllers.BaseController.authenticated()) Redirect("center", "login", new Hashtable());
            
            if (String.IsNullOrWhiteSpace(exclude)) exclude = "0";
            String[] drop = exclude.Split(',');

            IList<taxonomy> taxs = postingService.get_taxonomies(tax);

            CancelLayout();
            CancelView();
            String json_str = "";

            json_str += @"  { 
";
            foreach (taxonomy item in taxs) {
                json_str += @"""" + item.baseid + @""":{";
                json_str += @"""baseid"":""" + item.baseid + @""",";
                // json_str += @"""fam_baseid"":""" + sub.families.First().family.baseid + @""",";
                json_str += @"""name"":""" + item.name + @""",";
                json_str += @"""alias"":""" + item.alias + @"""";
                json_str += @"
},";
                // this vodo of the new line is wrong
                json_str += "".Replace(@"
", String.Empty);


            }
            json_str += @"
}";


            if (!string.IsNullOrEmpty(callback)) {
                json_str = callback + "(" + json_str + ")";
            }
            Response.ContentType = "application/json; charset=UTF-8";
            RenderText(json_str);
        }
        /// <summary> </summary>
        public void update_taxonomy([ARDataBind("taxonomy", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] taxonomy taxonomy, Boolean ajax, String oldtax_alias, String oldtax_type_alias) {
            ActiveRecordMediator<taxonomy>.Save(taxonomy);

            dynamic items = new List<_base>();
            string name = "";
            taxonomy_type type = null;

            if (!String.IsNullOrWhiteSpace(oldtax_alias) && !String.IsNullOrWhiteSpace(oldtax_type_alias)) {
                type = taxonomy.taxonomy_type;
                name = taxonomy.name;
                ActiveRecordMediator<_base>.Save(taxonomy);

                //find old ones and clean them up
                taxonomy tax = ActiveRecordBase<taxonomy>.Find(taxonomy.baseid);
                try {
                    IList<_base> taxed = tax.get_taxonomy_items(oldtax_type_alias, oldtax_alias);
                    if (taxed.Count() > 0) {
                        items.AddRange(taxed);
                        String alias = taxonomy.alias;
                        foreach (_base p in items) {
                            log.Info("appling taxonomy " + type.alias + " to " + p.baseid + "/" + p.alias);
                            PropertyInfo propInfo = p.GetType().GetProperty(type.alias);
                            propInfo.SetValue(p, alias, new object[] { });
                            log.Info("adding new taxonomy back to items");
                            ActiveRecordMediator<_base>.Save(p);
                        }
                    }

                    Flash["message"] = "taxonomy has " + items.Count + " items to change from: <b>" + oldtax_type_alias + "/" + oldtax_alias +
                        "</b>  TO   <b>" + type.alias + "/" + taxonomy.alias + "</b>";
                    log.Info("taxonomy has " + items.Count + " items to change to " + oldtax_type_alias + "/" + oldtax_alias);

                } catch {

                }


            }
            if (ajax) {
                CancelLayout();
                if (taxonomy.baseid > 0) {
                    RenderText("{\"state\":\"true\",\"baseid\":\"" + taxonomy.baseid + "\",\"name\":\"" + taxonomy.name + "\",\"alias\":\"" + taxonomy.alias + "\"}");
                } else {
                    RenderText("{\"state\":\"false\"}");
                }
                return;
            }
            RedirectToAction("taxonomy");
        }
















        /// <summary> </summary>
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


        /// <summary> </summary>
        public string notes(string datatype, string name, string position) {
            String html = "";
            taxonomy tab_noteObj = postingService.get_taxonomy(datatype, "tab_note_" + name, "SYSTEM__tab_notes_" + position);
            if (tab_noteObj != null && !String.IsNullOrWhiteSpace(tab_noteObj.content)) {
		        html = "<div style='clear:both;'>"+
                    "<p class='noteblock'>"+
			        tab_noteObj.content +
                "</p></div>";
	        }
            return html;
        }


        /// <summary> </summary>
        public string feilds(string formfeild, string datatype, string model_prop, string value, string custom_lable, string placeholder, string html_class, string html_attr) {
            return feilds(formfeild, datatype, model_prop, value, "", custom_lable, placeholder, html_class, html_attr);
        }

        /// <summary> </summary>
        public string feilds(string formfeild, string datatype, string model_prop, string value, string options, string custom_lable, string placeholder, string html_class, string html_attr) {
            String html = "";
            switch (formfeild) {
                case "textinput":  {
                        html = feild_textinput(datatype, model_prop, value, custom_lable, placeholder, html_class, html_attr); break;
                    }
                case "textarea": {
                        html = feild_textarea(datatype, model_prop, value, custom_lable, placeholder, html_class, html_attr); break;
                    }
                case "select": {
                        html = feild_select( datatype, model_prop, value, options, custom_lable, html_class, html_attr); break;
                    }

            }

            return html;
        }

        /// <summary> </summary>
        public string feild_textinput(string datatype, string model_prop, string value, string custom_lable, string placeholder, string html_class, string html_attr) {
            String html = "";
            String lable = "";
            String field_helper = "";
            String feild_name = "";

            taxonomy feildObj = postingService.get_taxonomy(datatype, model_prop,"SYSTEM__feild_helpers");

            if (feildObj != null) {
                if (feildObj.content!=null && feildObj.content != "") {
		            field_helper="<i class='icon-question-sign blue' title='"+feildObj.content+"'></i>";
	            }
                if (feildObj.name != null && feildObj.name != "") {
                    lable = feildObj.name + ": ";
		        }
            }
		    if(custom_lable!=""){
                lable = custom_lable + ": ";
            }

            if (is_viewonly()) {
                html = "<label >" + lable + field_helper + "</label> " + value;
            } else {
                feild_name = "item." + model_prop;
                placeholder = (placeholder != "") ? "placeholder='" + placeholder + "'" : "";
                html_class = (html_class != "") ? "class='" + html_class + "'" : "";
                value = (value != "" && value != "System.String[]") ? "value='" + value + "'" : "";

                html = "<label for='" + model_prop + "'>" + lable + field_helper + "</label>" +
                "<input type='text' name='" + feild_name + "' id='" + model_prop + "' " + placeholder + " " + html_class + " " + value + " " + html_attr + " />";
            }
            return html;
        }

        /// <summary> </summary>
        public string feild_textarea(string datatype, string model_prop, string value, string custom_lable, string placeholder, string html_class, string html_attr) {
            String html = "";
            String lable = "";
            String field_helper = "";
            String feild_name = "";

            taxonomy feildObj = postingService.get_taxonomy(datatype, model_prop, "SYSTEM__feild_helpers");

            if (feildObj != null) {
                if (feildObj.content != null && feildObj.content != "") {
                    field_helper = "<i class='icon-question-sign blue' title='" + feildObj.content + "'></i>";
                }
                if (feildObj.name != null && feildObj.name != "") {
                    lable = feildObj.name + ": ";
                }
            }
            if (custom_lable != "") {
                lable = custom_lable + ": ";
            }

            if (is_viewonly()) {
                html = "<label >" + lable + field_helper + "</label> " + value;
            } else {
                feild_name = "item." + model_prop;
                placeholder = (placeholder != "") ? "placeholder='" + placeholder + "'" : "";
                html_class = (html_class != "") ? "class='" + html_class + "'" : "";
                value = (value != "" && value != "System.String[]") ? "" + value + "" : "";

                html = "<label for='" + model_prop + "'>" + lable + field_helper + "</label>" +
                "<textarea name='" + feild_name + "' id='" + model_prop + "' " + placeholder + " " + html_class + " " + html_attr + " >" + value + "</textarea>";
            }
            return html;
        }

        /// <summary> </summary>
        public string feild_select(string datatype, string model_prop, string value, string options, string custom_lable, string html_class, string html_attr) {
            String html = "";
            String lable = "";
            String field_helper = "";
            String feild_name = "";

            taxonomy feildObj = postingService.get_taxonomy(datatype, model_prop, "SYSTEM__feild_helpers");

            if (feildObj != null) {
                if (feildObj.content != null && feildObj.content != "") {
                    field_helper = "<i class='icon-question-sign blue' title='" + feildObj.content + "'></i>";
                }
                if (feildObj.name != null && feildObj.name != "") {
                    lable = feildObj.name + ": ";
                }
            }
            if (custom_lable != "") {
                lable = custom_lable + ": ";
            }

            if (is_viewonly()) {
                html = "<label >" + lable + field_helper + "</label> " + value;
            } else {
                feild_name = "item." + model_prop;
                html_class = (html_class != "") ? "class='" + html_class + "'" : "";
                value = (value != "" && value != "System.String[]") ? "" + value + "" : "";


                dynamic opts = objectService.explode(options);

                html = "<label for='" + model_prop + "'>" + lable + field_helper + "</label>" +
                    
                        "<select name='" + feild_name + "' id='" + model_prop + "' " + html_class + " " + html_attr + " >" + 
                        "<option value=''>Select</option>";
                        foreach(dynamic part in opts) {
                            dynamic selval = part.Trim();
                            dynamic opt = part.Trim();

					        if( part.Contains("=>") ){
						        dynamic opval = objectService.explode(part,"=>");
						        selval = opval[1].Trim();
						        opt = opval[0].Trim();
					        }

                            String selected = ( !String.IsNullOrWhiteSpace(value) && value == selval ) ?  "selected" : "";

					        html += "<option value='" + selval + "' data='" + value + " -- " + selval + "' " + selected + " >" + opt + "</option>";
                          }
                    
                html += "</select>";
            }
            return html;
        }

    }
}