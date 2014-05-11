/*!
----------------------------------------------------

&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&__&&&&&&&&&&&&___&&&&___&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&/\ \__&&&&&&&&/\_ \&&/\_ \&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&____\ \ ,_\&&&&&__\//\ \&\//\ \&&&&&&&__&&&&&_&__&&&&&&&
&&&&/',__\\ \ \/&&&/'__`\\ \ \&&\ \ \&&&&/'__`\&&/\`'__\&&&&&
&&&/\__, `\\ \ \_&/\  __/&\_\ \_&\_\ \_&/\ \L\.\_\ \ \/&&&&&&
&&&\/\____/&\ \__\\ \____\/\____\/\____\\ \__/.\_\\ \_\&&&&&&
&&&&\/___/&&&\/__/&\/____/\/____/\/____/&\/__/\/_/&\/_/&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&~J.L.B.~&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

----------------------------------------------------
* #Stellar AMS  
* A file/user/resource managment system for WSU
* Copyright (c) 2012-13 
* Author: Jeremy Bass <jeremy.bass@wsu.edu>
*
* Version 0.1
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
* Help : https://github.com/jeremyBass/jTrack/wiki/options
* Devoloping party: Washington State University  
*/
----------------------------------------------------

About ----------------------------------------------

Why Stellar as a name?  Because of it's vastness in scope matching.

----------------------------------------------------


Install --------------------------------------------

To install follower the wizard.  If the installed.txt is located in
that root, delete it to get the wizard. (/install/install.castle)

NOTE: If the installed.txt is removed and you didn't mean it to, 
simple add a new one with the text "true" and the installed site will be showen

----------------------------------------------------



USED packages --------------------------------------

The MonoRail project is set up and ready to run 
using VS.Net web project support

Some considerations if you are using 
Windsor integration:

Windsor Container Integration
-----------------------------

If you are using the Windsor container integration 
you must remember to register all new controllers on 
the Config/controllers.config file

ViewComponents must be registered as well. Filters 
can be optionally registered on the container.

Connection strings
------------------

See the Config/properties.config

ActiveRecord Integration Facility
---------------------------------

If you have chosen to use this facility, remember
to add a reference to the assembly that contains
the ActiveRecord types (your domain model).

If something needs to be included, check the
Config/facilities.config

NHibernate Integration Facility
-------------------------------

If you have chosen to use this facility, remember
to bring the hbm files or referencing the 
assemblies that contains the NHibernate xml mappings.

If something needs to be included, check the
Config/facilities.config

