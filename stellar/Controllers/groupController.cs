namespace stellar.Controllers {
    #region using
    using System.Collections.Generic;
    using Castle.ActiveRecord;
    using Castle.MonoRail.Framework;
    using Castle.MonoRail.ActiveRecordSupport;
    //using MonoRailHelper;
    using NHibernate.Criterion;
    using System.IO;
    using System.Web;
    using System;
    using stellar.Models;
    using stellar.Services;
    using System.Xml;
    using System.Linq;
    using log4net;
    #endregion

    /* this 
     * is apart of the user controller as this is what groupd them
     * jBass out
     */
    /// <summary> </summary>
    [Layout("admin")]
    public class groupController : adminController {
        ILog log = log4net.LogManager.GetLogger("groupController");
        /// <summary> </summary>
        public groupController() {
            Controllers.BaseController.current_controller = "group";
        }

        #region groups
        /// <summary> </summary>
        public void list_groups() {
            PropertyBag["admin_groups"] = ActiveRecordBase<user_group>.FindAll().Where(x => x.isAdmin == true);
            PropertyBag["FE_groups"] = ActiveRecordBase<user_group>.FindAll().Where(x => x.isAdmin == false);

            PropertyBag["privileges"] = ActiveRecordBase<privilege>.FindAll();

            RenderView("list");
        }

        /// <summary> </summary>
        public void edit_group(int id) {
            logger.writelog("Editing group", getView(), getAction(), id);
            PropertyBag["privileges"] = ActiveRecordBase<privilege>.FindAll();
            PropertyBag["group"] = ActiveRecordBase<user_group>.Find(id);
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            RenderView("edit");
        }
        /// <summary> </summary>
        public void new_group() {
            logger.writelog("Creating group", getView(), getAction());
            PropertyBag["privileges"] = ActiveRecordBase<privilege>.FindAll();
            PropertyBag["user_groups"] = ActiveRecordBase<user_group>.FindAll();
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            RenderView("edit");
        }
        /// <summary> </summary>
        public void update_group([ARDataBind("group", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] user_group group
            ,int[] privileges
            ) {
            try {
                logger.writelog("Saving group", getView(), getAction(), group.baseid);
                Flash["message"] ="Saved group setings.";
                
                group.privileges.Clear();
                if (privileges != null) {
                    foreach (int id in privileges) {
                        group.privileges.Add(ActiveRecordBase<privilege>.Find(id));
                    }
                }
                
                ActiveRecordMediator<user_group>.Save(group);
                if (group == userService.getUser().groups) userService.setUser();
            } catch (Exception ex) {
                Flash["error"] = ex.Message;
                Flash["accesslevel"] = group;
                logger.writelog("Failed to save group", getView(), getAction(), group.baseid);
                if (group.baseid > 0) {
                    RedirectToAction("edit_group", new string[] { "id", group.baseid.ToString() });
                } else {
                    RedirectToAction("new_group");
                }
                return;
            }
            RedirectToAction("list_groups");
        }
        /// <summary> </summary>
        public void delete_group(int id) {
            user_group group = ActiveRecordBase<user_group>.Find(id);
            //Flash["error"] = "At the moment no one has rights to delete a group but the system.";
            try {
                Flash["message"] = "A group, <strong>" + group.name + "</strong>, has been <strong>deleted</strong>.";
                logger.writelog("Deleted group", getView(), getAction(), group.baseid);
                ActiveRecordMediator<user_group>.Delete(group);
            } catch (Exception ex) {
                Flash["message"] = "";
                logger.writelog("failed to Deleted", getView(), getAction(), group.baseid);
                Flash["error"] = ex.Message;
            }
            RedirectToAction("list_groups");
        }
        #endregion

        #region privileges
        /// <summary> </summary>
        public void edit_privilege(int id) {
            privilege privilege = ActiveRecordBase<privilege>.Find(id);
            logger.writelog("Editing privilege", getView(), getAction(), privilege.baseid);
            PropertyBag["privilege"] = privilege;
            RenderView("_edit_privilege");
        }
        /// <summary> </summary>
        public void new_privilege() {
            logger.writelog("Creating privilege", getView(), getAction());
            PropertyBag["privilege"] = new privilege();
            RenderView("_edit_privilege");
        }
        /// <summary> </summary>
        public void update_privilege(
            [ARDataBind("privilege", Validate = true, AutoLoad = AutoLoadBehavior.NewInstanceIfInvalidKey)] privilege privilege
            ) {
            try {
                logger.writelog("Saving privilege", getView(), getAction(), privilege.baseid);
                ActiveRecordMediator<privilege>.Save(privilege);
            } catch (Exception ex) {
                Flash["error"] = ex.Message;
                Flash["item"] = privilege;
                logger.writelog("Failed to save privilege", getView(), getAction(), privilege.baseid);
                if (privilege.baseid > 0) {
                    RedirectToAction("_edit_privilege", new string[] { "id", privilege.baseid.ToString() });
                } else {
                    RedirectToAction("_new_privilege");
                }
                return;
            }
            RedirectToAction("list_groups");
        }
        /// <summary> </summary>
        public void delete_privilege(int id) {
            privilege privilege = ActiveRecordBase<privilege>.Find(id);
            try {
                logger.writelog("Deleting privilege", getView(), getAction(), privilege.baseid);
                ActiveRecordMediator<privilege>.Delete(privilege);
            } catch (Exception ex) {
                logger.writelog("Failed to delete privilege", getView(), getAction(), privilege.baseid);
                Flash["error"] = ex.Message;
            }
            RedirectToAction("list");
        }
        #endregion
    }
        
    
}