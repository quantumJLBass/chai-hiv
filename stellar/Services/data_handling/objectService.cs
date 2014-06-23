#region Directives
using stellar.Models;
using stellar.Services;
using Castle.ActiveRecord;
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
using System.Reflection;
using NHibernate.Criterion;
using System.Security;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.ComponentModel;
using System.Collections;

//using System.Linq;

using System.Xml.Linq;
using System.Xml.XPath;
using System.Dynamic;
using System.Runtime.Serialization;
#endregion

namespace stellar.Services {
    /// <summary>
    /// This is where we get methods to handle and access objects to reading the 
    /// complied parts of the app it's self.
    /// </summary>
    public class objectService {
        /* come back to this 
        function Retry(Delegate func, int numberOfTimes){
            try
            { func.Invoke(); }
            catch { if(numberOfTimes blabla) func.Invoke(); etc. etc. }
        }
        */
        #region(info)



        #endregion


        #region(app level object read/write)
        /// <summary>
        /// This will list out all the methods that are publicly avaible
        /// </summary>
        /// <param name="Service">The Serivce we wish to look into</param>
        /// <returns>List of hashtables - the hashtable is the method name and it's value is it's parameter count</returns>
        public static List<Hashtable> get_service_methods(String Service) {
            MethodInfo[] methodInfos = Type.GetType("stellar.Services." + Service).GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance | BindingFlags.FlattenHierarchy | BindingFlags.DeclaredOnly);
            List<Hashtable> methods = new List<Hashtable>();
            foreach (MethodInfo item in methodInfos) {
                Hashtable meth_obj = new Hashtable();
                meth_obj.Add(item.Name, item.GetParameters().Count());
                methods.Add(meth_obj);
            }
            return methods;
        }
        /// <summary>
        /// This will get the summary of the method matched by it's paramerter count
        /// </summary>
        /// <param name="Service">The Serivce we wish to look into</param>
        /// <param name="method">The name of the method we want</param>
        /// <param name="selected">The number of paramerters it should have to avoid an ambiguous method exception</param>
        /// <returns>String - The summary of the method we looked up.  Return with empty string if no match is found</returns>
        public static String get_method_summary(String Service, String method, int selected) {
            String output = "";
            MethodInfo[] methodInfos = Type.GetType("stellar.Services." + Service).GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance);

            foreach (MethodInfo item in methodInfos) {
                if (item.Name == method && item.GetParameters().Count() == selected) {
                    ParameterInfo[] Parameters = item.GetParameters();
                    List<Type> types = new List<Type>();
                    foreach (ParameterInfo pram in Parameters.OrderBy(x => x.Position)) {
                        types.Add(pram.ParameterType);
                    }
                        return Type.GetType("stellar.Services." + Service).GetGenericMethod(item.Name, types.ToArray()).GetXmlDocumentation(file_info.root_path() + "/bin/stellar.xml");
                }
            }
            return output;
        }



        /// <summary>
        /// This will get the parameters of the method matched by it's paramerter count
        /// </summary>
        /// <param name="Service">The Serivce we wish to look into</param>
        /// <param name="method">The name of the method we want</param>
        /// <param name="selected">The number of paramerters it should have to avoid an ambiguous method exception</param>
        /// <returns>Hashtable - The parameters of the method we looked up.</returns>
        public static Hashtable get_method_parameters(String Service, String method,int selected) {
            Hashtable output = new Hashtable();
            MethodInfo[] methodInfos = Type.GetType("stellar.Services." + Service).GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance);

            foreach (MethodInfo item in methodInfos) {
                if (item.Name == method && item.GetParameters().Count() == selected) {
                    ParameterInfo[] Parameters = item.GetParameters();
                    List<Type> types = new List<Type>();
                    foreach (ParameterInfo pram in Parameters.OrderBy(x => x.Position)) {
                        types.Add(pram.ParameterType);
                    }

                    var i = 0;
                    foreach (ParameterInfo pram in Parameters.OrderByDescending(x => x.Position)) {
                        String paraminfo = Type.GetType("stellar.Services." + Service).GetGenericMethod(item.Name, types.ToArray()).GetParameters()[pram.Position].GetXmlDocumentation(file_info.root_path() + "/bin/stellar.xml");
                        output.Add(i, new string[] { pram.Name, pram.ParameterType.Name, paraminfo });
                        i++;
                    }

                }
            }
            return output;
        }


        /// <summary>
        /// This will get the return of the method matched by it's paramerter count
        /// </summary>
        /// <param name="Service">The Serivce we wish to look into</param>
        /// <param name="method">The name of the method we want</param>
        /// <param name="selected">The number of paramerters it should have to avoid an ambiguous method exception</param>
        /// <returns>String - The return of the method we looked up.  Return with empty string if no match is found</returns>
        public static String get_method_return(String Service, String method, int selected) {
            String output = "";
            MethodInfo[] methodInfos = Type.GetType("stellar.Services." + Service).GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance);

            foreach (MethodInfo item in methodInfos) {
                if (item.Name == method && item.GetParameters().Count() == selected) {

                    ParameterInfo[] Parameters = item.GetParameters();
                    List<Type> types = new List<Type>();
                    foreach (ParameterInfo pram in Parameters.OrderBy(x => x.Position)) {
                        types.Add(pram.ParameterType);
                    }

                    return Type.GetType("stellar.Services." + Service).GetGenericMethod(item.Name, types.ToArray()).ReturnParameter.GetXmlDocumentation(file_info.root_path() + "/bin/stellar.xml");

                }
            }
            return output;
        }


        /// <summary> </summary>
        public static List<String> get_type_properties(String type) {
            List<String> prop_list = new List<String>();

            Type t = Type.GetType("stellar.Models." + type);

            foreach (PropertyDescriptor descriptor in TypeDescriptor.GetProperties(t)) {
                prop_list.Add(descriptor.Name);
                //object value = descriptor.GetValue(obj);
            }
            return prop_list;
        }
        /// <summary> </summary>
        public static List<String> get_type_properties_with_type(String type) {
            List<String> prop_list = new List<String>();

            Type t = Type.GetType("stellar.Models." + type);
            
            foreach (PropertyDescriptor descriptor in TypeDescriptor.GetProperties(t)) {

                String propType = Type.GetType("stellar.Models." + descriptor).Name;

                prop_list.Add(descriptor.Name + "(" + propType + ")");
                //object value = descriptor.GetValue(obj);
            }
            return prop_list;
        }
        #endregion

        #region(creation)
        /// <summary>
        /// Create an array form a string
        /// </summary>
        /// <param name="str">The string to break apart.</param>
        /// <returns>String[] - an array of strings</returns>
        public static String[] explode(String str) {
            return explode(str, ",");
        }

        /// <summary>
        /// Create an array form a string
        /// </summary>
        /// <param name="str">The string to break apart.</param>
        /// <param name="split_by">What to brake the string apart by.</param>
        /// <returns>String[] - an array of strings</returns>
        public static String[] explode(String str, String split_by) {
            return str.Split(new string[] { split_by }, StringSplitOptions.None);
        }


        /* make a query string a param list ** needs to abstract it so it can take name=val&foo=bar  and  name="value" foo = "bar" */
        /// <summary>
        /// Create a Hashtable from a string in normal name value pair lexicons
        /// </summary>
        /// <param name="paramList">The string to pull name value pairs out of</param>
        /// <param name="paramtable">The hashtable to marge into</param>
        /// <returns>Hashtable of the name value pairs</returns>
        /// <remarks>NOTE WE SHOULD CHANGE THIS TO NOT FORCE A MARGE</remarks>
        public static Hashtable pull_params(String paramList, Hashtable paramtable) {
            string pattern = @"(?<block>(?<name>\w+)=""(?<value>.*?)"")";
            MatchCollection matches = Regex.Matches(paramList, pattern);
            foreach (Match match in matches) {
                String block = "";
                String name = "";
                String value = "";

                block = match.Groups["block"].Value;
                name = match.Groups["name"].Value.ToLower();
                value = renderService.proccessText(new Hashtable(), match.Groups["value"].Value, false);

                if (!String.IsNullOrWhiteSpace(value) && !String.IsNullOrWhiteSpace(name)) {

                    if (!paramtable.ContainsKey(name) && paramtable[name] == null) {
                        paramtable.Add(name, value);
                    } else {
                        paramtable[name] = value;
                    }
                }
            }
            return paramtable;
        }

        #endregion

        #region(object manipulation)

        /// <summary> </summary>
        public static dynamic make_model_property_item<t>(String prop_name) where t : new() {
            dynamic item = ActiveRecordBase<t>.FindFirst(
                    new List<AbstractCriterion>() { Expression.Eq("alias", prop_name) }.ToArray()
                  );
            return item;
        }

        /// <summary> </summary>
        public static dynamic make_model_property_list<t>() where t : new() {
            dynamic item = ActiveRecordBase<t>.FindAll().ToList();
            return item;
        }


        /*delete */
        /// <summary>
        /// Take the monorail PropertyBag and pushes it to a Hashtable
        /// </summary>
        /// <remarks>DEPECATITED</remarks>
        public static Hashtable marge_params(IDictionary PropertyBag, Hashtable paramtable) {
            return PropertyBag_to_params(PropertyBag,paramtable);
        }
        /**/


       
        /// <summary>
        /// Marge to Hashtables but don't overwrite if a key is there
        /// </summary>
        /// <param name="newitems">The Hashtable of we are marging into</param>
        /// <param name="paramtable">The Hashtable of key,values we wish to marge</param>
        public static Hashtable merge_tables(Hashtable newitems, Hashtable paramtable) {
            return merge_tables(newitems, paramtable, false);
        }
        /// <summary>
        /// Marge to Hashtables and overwrite if a key is there if flaged to do so
        /// </summary>
        /// <param name="newitems">The Hashtable of we are marging into</param>
        /// <param name="paramtable">The Hashtable of key,values we wish to marge</param>
        /// <param name="overwrite">To overwrite or not to</param>
        public static Hashtable merge_tables(Hashtable newitems, Hashtable paramtable, Boolean overwrite) {
            foreach (var key in newitems.Keys) {
                if (paramtable[key] == null && !paramtable.ContainsKey(key)) {
                    paramtable.Add(key, newitems[key]);
                }

                if (overwrite) {
                    paramtable[key] = newitems[key];
                }
            }
            return paramtable;
        }


        /// <summary>
        /// Marge to Hashtables and overwrite if a key is there if flaged to do so
        /// </summary>
        /// <param name="primary_list">The List of we are marging into</param>
        /// <param name="list">The List of key,values we wish to marge</param>
        /// <remarks>NEED FIX</remarks>
        public static dynamic merge_lists(dynamic primary_list, dynamic list) {


            var mergedList = primary_list.AddRange(list);

            return mergedList;
        }




        /// <summary>
        /// Copy a Hashtable to the monorail PropertyBag 
        /// </summary>
        /// <param name="PropertyBag">The bag to write to</param>
        /// <param name="paramtable">The table to copy</param>
        /// <returns>IDictionary (PropertyBag) - The monorail PropertyBag we marged into.</returns>
        public static IDictionary params_to_PropertyBag(IDictionary PropertyBag, Hashtable paramtable) {
            foreach (var key in paramtable.Keys) {
                if (!paramtable.ContainsKey(key) && paramtable[key] == null) {
                    PropertyBag.Add(key, PropertyBag[key]);
                } else {
                    PropertyBag[key] = PropertyBag[key];
                }
            }
            return PropertyBag;
        }
        /// <summary>
        /// Copy the monorail PropertyBag to a Hashtable
        /// </summary>
        /// <param name="PropertyBag">The bag to use</param>
        /// <param name="paramtable">The table to write to</param>
        /// <returns>Hashtable - The table we marged into.</returns>
        public static Hashtable PropertyBag_to_params(IDictionary PropertyBag, Hashtable paramtable) {
            foreach (var key in PropertyBag.Keys) {
                if (!paramtable.ContainsKey(key) && paramtable[key] == null) {
                    paramtable.Add(key, PropertyBag[key]);
                } else {
                    paramtable[key] = PropertyBag[key];
                }
            }
            return paramtable;
        }

        #endregion

    }

    #region(Xml class directly related)
    /// <summary>
    /// Provides extension methods for reading XML comments from reflected members.
    /// </summary>
    public static class XmlDocumentationExtensions {

        private static Dictionary<string, XDocument> cachedXml;

        /// <summary>
        /// Static constructor.
        /// </summary>
        static XmlDocumentationExtensions() {
            cachedXml = new Dictionary<string, XDocument>(StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Returns the expected name for a member element in the XML documentation file.
        /// </summary>
        /// <param name="member">The reflected member.</param>
        /// <returns>The name of the member element.</returns>
        private static string GetMemberElementName(MemberInfo member) {
            char prefixCode;
            string memberName = (member is Type)
                ? ((Type)member).FullName                               // member is a Type
                : (member.DeclaringType.FullName + "." + member.Name);  // member belongs to a Type

            switch (member.MemberType) {
                case MemberTypes.Constructor:
                    // XML documentation uses slightly different constructor names
                    memberName = memberName.Replace(".ctor", "#ctor");
                    goto case MemberTypes.Method;
                case MemberTypes.Method:
                    prefixCode = 'M';

                    // parameters are listed according to their type, not their name
                    string paramTypesList = String.Join(
                        ",",
                        ((MethodBase)member).GetParameters()
                            .Cast<ParameterInfo>()
                            .Select(x => x.ParameterType.FullName
                        ).ToArray()
                    );
                    if (!String.IsNullOrEmpty(paramTypesList))
                        memberName += "(" + paramTypesList + ")";
                    break;

                case MemberTypes.Event:
                    prefixCode = 'E';
                    break;

                case MemberTypes.Field:
                    prefixCode = 'F';
                    break;

                case MemberTypes.NestedType:
                    // XML documentation uses slightly different nested type names
                    memberName = memberName.Replace('+', '.');
                    goto case MemberTypes.TypeInfo;
                case MemberTypes.TypeInfo:
                    prefixCode = 'T';
                    break;

                case MemberTypes.Property:
                    prefixCode = 'P';
                    break;

                default:
                    throw new ArgumentException("Unknown member type", "member");
            }

            // elements are of the form "M:Namespace.Class.Method"
            return String.Format("{0}:{1}", prefixCode, memberName);
        }

        /// <summary>
        /// Returns the XML documentation (summary tag) for the specified member.
        /// </summary>
        /// <param name="member">The reflected member.</param>
        /// <returns>The contents of the summary tag for the member.</returns>
        public static string GetXmlDocumentation(this MemberInfo member) {
            AssemblyName assemblyName = member.Module.Assembly.GetName();
            return GetXmlDocumentation(member, assemblyName.Name + ".xml");
        }

        /// <summary>
        /// Returns the XML documentation (summary tag) for the specified member.
        /// </summary>
        /// <param name="member">The reflected member.</param>
        /// <param name="pathToXmlFile">Path to the XML documentation file.</param>
        /// <returns>The contents of the summary tag for the member.</returns>
        public static string GetXmlDocumentation(this MemberInfo member, string pathToXmlFile) {
            AssemblyName assemblyName = member.Module.Assembly.GetName();
            XDocument xml = null;

            if (cachedXml.ContainsKey(assemblyName.FullName))
                xml = cachedXml[assemblyName.FullName];
            else
                cachedXml[assemblyName.FullName] = (xml = XDocument.Load(pathToXmlFile));

            return GetXmlDocumentation(member, xml);
        }

        /// <summary>
        /// Returns the XML documentation (summary tag) for the specified member.
        /// </summary>
        /// <param name="member">The reflected member.</param>
        /// <param name="xml">XML documentation.</param>
        /// <returns>The contents of the summary tag for the member.</returns>
        public static string GetXmlDocumentation(this MemberInfo member, XDocument xml) {
            return xml.XPathEvaluate(
                String.Format(
                    "string(/doc/members/member[@name='{0}']/summary)",
                    GetMemberElementName(member)
                )
            ).ToString().Trim();
        }

        /// <summary>
        /// Returns the XML documentation (returns/param tag) for the specified parameter.
        /// </summary>
        /// <param name="parameter">The reflected parameter (or return value).</param>
        /// <returns>The contents of the returns/param tag for the parameter.</returns>
        public static string GetXmlDocumentation(this ParameterInfo parameter) {
            AssemblyName assemblyName = parameter.Member.Module.Assembly.GetName();
            return GetXmlDocumentation(parameter, assemblyName.Name + ".xml");
        }

        /// <summary>
        /// Returns the XML documentation (returns/param tag) for the specified parameter.
        /// </summary>
        /// <param name="parameter">The reflected parameter (or return value).</param>
        /// <param name="pathToXmlFile">Path to the XML documentation file.</param>
        /// <returns>The contents of the returns/param tag for the parameter.</returns>
        public static string GetXmlDocumentation(this ParameterInfo parameter, string pathToXmlFile) {
            AssemblyName assemblyName = parameter.Member.Module.Assembly.GetName();
            XDocument xml = null;

            if (cachedXml.ContainsKey(assemblyName.FullName))
                xml = cachedXml[assemblyName.FullName];
            else
                cachedXml[assemblyName.FullName] = (xml = XDocument.Load(pathToXmlFile));

            return GetXmlDocumentation(parameter, xml);
        }

        /// <summary>
        /// Returns the XML documentation (returns/param tag) for the specified parameter.
        /// </summary>
        /// <param name="parameter">The reflected parameter (or return value).</param>
        /// <param name="xml">XML documentation.</param>
        /// <returns>The contents of the returns/param tag for the parameter.</returns>
        public static string GetXmlDocumentation(this ParameterInfo parameter, XDocument xml) {
            if (parameter.IsRetval || String.IsNullOrEmpty(parameter.Name))
                return xml.XPathEvaluate(
                    String.Format(
                        "string(/doc/members/member[@name='{0}']/returns)",
                        GetMemberElementName(parameter.Member)
                    )
                ).ToString().Trim();
            else
                return xml.XPathEvaluate(
                    String.Format(
                        "string(/doc/members/member[@name='{0}']/param[@name='{1}'])",
                        GetMemberElementName(parameter.Member),
                        parameter.Name
                    )
                ).ToString().Trim();
        }

    }
    #endregion


    /// <summary> </summary>
    public class DynamicEntity : DynamicObject {
        private IDictionary<string, object> _values;

        /// <summary> </summary>
        public DynamicEntity(IDictionary<string, object> values) {
            _values = values;
        }


        /// <summary> </summary>
        public override bool TryGetMember(GetMemberBinder binder, out object result) {
            if (_values.ContainsKey(binder.Name)) {
                result = _values[binder.Name];
                return true;
            }
            result = null;
            return false;
        }
    }
    /// <summary> </summary>
    [Serializable]
    public class MyJsonDictionary<K, V> : ISerializable {
        Dictionary<K, V> dict = new Dictionary<K, V>();

        /// <summary> </summary>
        public MyJsonDictionary() { }

        /// <summary> </summary>
        protected MyJsonDictionary(SerializationInfo info, StreamingContext context) {
            throw new NotImplementedException();
        }

        /// <summary> </summary>
        public void GetObjectData(SerializationInfo info, StreamingContext context) {
            foreach (K key in dict.Keys) {
                info.AddValue(key.ToString(), dict[key]);
            }
        }

        /// <summary> </summary>
        public void Add(K key, V value) {
            dict.Add(key, value);
        }

        /// <summary> </summary>
        public V this[K index] {
            set { dict[index] = value; }
            get { return dict[index]; }
        }
    }
    /// <summary> </summary>
    public static class HashtableExtensions {
        /// <summary> </summary>
        public static void UpdateWith(this Hashtable first, Hashtable second) {
            foreach (DictionaryEntry item in second) {
                first[item.Key] = item.Value;
            }
        }
    }



    /// <summary> </summary>
    public static class TypeExtensions {
        /// <summary> </summary>
        private class SimpleTypeComparer : IEqualityComparer<Type> {
            public bool Equals(Type x, Type y) {
                return x.Assembly == y.Assembly &&
                    x.Namespace == y.Namespace &&
                    x.Name == y.Name;
            }

            public int GetHashCode(Type obj) {
                throw new NotImplementedException();
            }
        }

        /// <summary> </summary>
        public static MethodInfo GetGenericMethod(this Type type, string name, Type[] parameterTypes) {
            var methods = type.GetMethods();
            foreach (var method in methods.Where(m => m.Name == name)) {
                var methodParameterTypes = method.GetParameters().Select(p => p.ParameterType).ToArray();

                if (methodParameterTypes.SequenceEqual(parameterTypes, new SimpleTypeComparer())) {
                    return method;
                }
            }

            return null;
        }


        /// <summary>
        /// Type t;
        /// 
        /// t = TypeExtensions.GetTypeFromSimpleName("string");
        /// t = TypeExtensions.GetTypeFromSimpleName("int[]");
        /// t = TypeExtensions.GetTypeFromSimpleName("decimal?");
        /// </summary>
        /// <param name="typeName"></param>
        /// <returns></returns>
        public static Type GetTypeFromSimpleName(string typeName) {
            if (typeName == null)
                throw new ArgumentNullException("typeName");

            bool isArray = false, isNullable = false;

            if (typeName.IndexOf("[]") != -1) {
                isArray = true;
                typeName = typeName.Remove(typeName.IndexOf("[]"), 2);
            }

            if (typeName.IndexOf("?") != -1) {
                isNullable = true;
                typeName = typeName.Remove(typeName.IndexOf("?"), 1);
            }

            typeName = typeName.ToLower();

            string parsedTypeName = null;
            switch (typeName) {
                case "bool":
                case "boolean":
                    parsedTypeName = "System.Boolean";
                    break;
                case "byte":
                    parsedTypeName = "System.Byte";
                    break;
                case "char":
                    parsedTypeName = "System.Char";
                    break;
                case "datetime":
                    parsedTypeName = "System.DateTime";
                    break;
                case "datetimeoffset":
                    parsedTypeName = "System.DateTimeOffset";
                    break;
                case "decimal":
                    parsedTypeName = "System.Decimal";
                    break;
                case "double":
                    parsedTypeName = "System.Double";
                    break;
                case "float":
                    parsedTypeName = "System.Single";
                    break;
                case "int16":
                case "short":
                    parsedTypeName = "System.Int16";
                    break;
                case "int32":
                case "int":
                    parsedTypeName = "System.Int32";
                    break;
                case "int64":
                case "long":
                    parsedTypeName = "System.Int64";
                    break;
                case "object":
                    parsedTypeName = "System.Object";
                    break;
                case "sbyte":
                    parsedTypeName = "System.SByte";
                    break;
                case "string":
                    parsedTypeName = "System.String";
                    break;
                case "timespan":
                    parsedTypeName = "System.TimeSpan";
                    break;
                case "uint16":
                case "ushort":
                    parsedTypeName = "System.UInt16";
                    break;
                case "uint32":
                case "uint":
                    parsedTypeName = "System.UInt32";
                    break;
                case "uint64":
                case "ulong":
                    parsedTypeName = "System.UInt64";
                    break;
            }

            if (parsedTypeName != null) {
                if (isArray)
                    parsedTypeName = parsedTypeName + "[]";

                if (isNullable)
                    parsedTypeName = String.Concat("System.Nullable`1[", parsedTypeName, "]");
            } else
                parsedTypeName = typeName;

            // Expected to throw an exception in case the type has not been recognized.
            return Type.GetType(parsedTypeName);
        }

    }
}
