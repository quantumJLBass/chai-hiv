#region Directives
using stellar.Models;
using stellar.Services;

using System;
using System.Linq;
using System.Data;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web;
//using MonoRailHelper;

using System.Collections.Generic;
using System.Text.RegularExpressions;
using Castle.ActiveRecord.Queries;
using Castle.ActiveRecord;
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class searchService {
        /// <summary> </summary>
        public void user_keywordAutoComplete(string name_startsWith, string callback) {

            String term = name_startsWith.Trim();

            SortedDictionary<string, int> results = Controllers.usersController.search_user_string(term);

            /* end of this hacky thing.. now you need to return a place id tied so un hack it */
            String labelsList = "";
            foreach (String key in results.Keys) {
                if (!key.StartsWith("RELATED|")) {
                    string name = key.Split(':')[1];
                    labelsList += @"{";
                    labelsList += @"""label"":""" + name + @""",";
                    labelsList += @"""value"":""" + name + @""",";
                    labelsList += @"""_id"":""" + int.Parse(results[key].ToString()) + @""",";
                    labelsList += @"""related"":""false""";
                    labelsList += @"},";
                }
            }


            bool hasRelated = false;

            foreach (String key in results.Keys) {
                if (key.StartsWith("RELATED|")) {

                    if (!hasRelated) {
                        labelsList += @"{";
                        labelsList += @"""label"":""------"",";
                        labelsList += @"""value"":""------"",";
                        labelsList += @"""_id"":""------"",";
                        labelsList += @"""related"":""header""";
                        labelsList += @"},";
                    }
                    hasRelated = true;
                    string name = key.Split('|')[1].Split(':')[1];
                    labelsList += @"{";
                    labelsList += @"""label"":""" + name + @""",";
                    labelsList += @"""value"":""" + name + @""",";
                    labelsList += @"""_id"":""" + int.Parse(results[key].ToString()) + @""",";
                    labelsList += @"""related"":""true""";
                    labelsList += @"},";
                }
            }

            String json = "[" + labelsList.TrimEnd(',') + "]";

            if (!string.IsNullOrEmpty(callback)) {
                json = callback + "(" + json + ")";
            }
        }

        /// <summary> </summary>
        public static posting[] searchAndAddResultsToHashtable(String hql, String searchterm) {
            SimpleQuery<posting> query = new SimpleQuery<posting>(typeof(posting), hql);
            query.SetParameter("searchterm", "%" + searchterm + "%");
            return query.Execute();
        }
        /// <summary> </summary>
        public static SortedDictionary<string, int> search_event_string(string term) {
            // Use hashtable to store name/value pairs
            SortedDictionary<string, int> results = new SortedDictionary<string, int>();
            //id is for order
            int i = 0;

            // Trying a different Query method
            // Here was the all inclusive query (not used for now except for reference)
            /*String overallsqlstring = @"from place p where 
                   p.abbrev_name LIKE :searchterm 
                or p.prime_name like :searchterm
                or (p in (select p from p.tags as t where t.name like :searchterm)) 
                or (p in (select p from p.names as n where n.name like :searchterm))
                ";
            */

            // Search place prime name
            String searchprime_name = @"SELECT p FROM place AS p WHERE p.name LIKE '%" + term + "%'";

            SimpleQuery<posting> pq = new SimpleQuery<posting>(typeof(posting), searchprime_name);
            posting[] places = pq.Execute();

            foreach (posting place in places) {
                //results[i.ToString() + ":" + place.prime_name] = place.baseid;
                if (results.Any(item => item.Key.Split(':')[1].Trim() == place.name.Trim())
                    && results.Any(item => item.Value == place.baseid)
                    ) {
                } else {
                    results.Add(i.ToString() + ":" + place.name.Trim(), place.baseid);
                    i++;
                }
            }

            // Search place abbrev
            String searchabbrev = @"from place p where 
                   p.abbrev_name LIKE :searchterm 
                ";

            foreach (posting place in searchAndAddResultsToHashtable(searchabbrev, term)) {
                //results[i.ToString()+":"+place.abbrev_name] = place.baseid;
                if (results.Any(item => item.Key.Split(':')[1].Trim() == place.name.Trim())
                    && results.Any(item => item.Value == place.baseid)
                    ) {
                } else {
                    results.Add(i.ToString() + ":" + place.name.Trim(), place.baseid);
                    i++;
                }
            }

            // Search tags
            String sql = "SELECT DISTINCT t FROM tags AS t WHERE NOT t.name = 'NULL'";
            if (!String.IsNullOrEmpty(term)) {
                sql += " AND t.name LIKE  '%" + term + "%'";
            }
            SimpleQuery<taxonomy> q = new SimpleQuery<taxonomy>(typeof(taxonomy), sql);
            taxonomy[] tags = q.Execute();
            // Loop through the tags' places
            /* foreach (tags tag in tags) {
                 String ids = "";
                 foreach (cal_events place in tag.items) {
                     if (String.IsNullOrEmpty(ids))
                         ids = place.baseid.ToString();
                     else
                         ids += "," + place.baseid.ToString();

                     if (results.Any(item => item.Key.Split(':')[1] == place.name.Trim())
                         && results.Any(item => item.Value == place.baseid)
                         ) {
                     } else {
                         results.Add("RELATED|" + i.ToString() + ":" + place.name.Trim(), place.baseid);
                         i++;
                     }
                 }
                 //results[i.ToString() + ":" + tag.name] = ids;
             }*/
            return results;
        }
        /// <summary> </summary>
        public static List<posting> filterPage(String term) {
            List<posting> listtems = new List<posting>();
            int sid = 0;
            if (!int.TryParse(term, out sid)) {
                term = term.Trim();
                SortedDictionary<string, int> results = search_event_string(term);
                foreach (int res in results.Values) {
                    listtems.Add(ActiveRecordBase<posting>.Find(res));
                }

            }
            if (sid > 0) {

                listtems.Add(ActiveRecordBase<posting>.Find(sid));
            }
            return listtems;
        }


    }
}
