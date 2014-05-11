USE [research_site] 
    GO 
    DECLARE @SQL varchar(4000)=''
SELECT @SQL = @SQL + 'ALTER TABLE ' + FK.TABLE_NAME + ' DROP CONSTRAINT [' + RTRIM(C.CONSTRAINT_NAME) +'];' + CHAR(13)
--SELECT K_Table = FK.TABLE_NAME, FK_Column = CU.COLUMN_NAME, PK_Table = PK.TABLE_NAME, PK_Column = PT.COLUMN_NAME, Constraint_Name = C.CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS C
 INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK
    ON C.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
 INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK
    ON C.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
 INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE CU
    ON C.CONSTRAINT_NAME = CU.CONSTRAINT_NAME
 INNER JOIN (
            SELECT i1.TABLE_NAME, i2.COLUMN_NAME
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS i1
             INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE i2
                ON i1.CONSTRAINT_NAME = i2.CONSTRAINT_NAME
            WHERE i1.CONSTRAINT_TYPE = 'PRIMARY KEY'
           ) PT
    ON PT.TABLE_NAME = PK.TABLE_NAME

--EXEC (@SQL)
GO
    
    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKFE2BF54B0DC91A]') AND parent_obj = OBJECT_ID('meta_data_date'))
alter table meta_data_date  drop constraint FKFE2BF54B0DC91A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKA1D6A05385A87919]') AND parent_obj = OBJECT_ID('options'))
alter table options  drop constraint FKA1D6A05385A87919


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK142AADA985A87919]') AND parent_obj = OBJECT_ID('_base'))
alter table _base  drop constraint FK142AADA985A87919


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK142AADA91E4993AD]') AND parent_obj = OBJECT_ID('_base'))
alter table _base  drop constraint FK142AADA91E4993AD


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK53AE44D86C02F0A6]') AND parent_obj = OBJECT_ID('_base_to_users'))
alter table _base_to_users  drop constraint FK53AE44D86C02F0A6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK53AE44D82994A220]') AND parent_obj = OBJECT_ID('_base_to_users'))
alter table _base_to_users  drop constraint FK53AE44D82994A220


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKFFE211B8C38101B7]') AND parent_obj = OBJECT_ID('_base_to_taxonomy_types'))
alter table _base_to_taxonomy_types  drop constraint FKFFE211B8C38101B7


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKFFE211B8E601F301]') AND parent_obj = OBJECT_ID('_base_to_taxonomy_types'))
alter table _base_to_taxonomy_types  drop constraint FKFFE211B8E601F301


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK385C5F5CC38101B7]') AND parent_obj = OBJECT_ID('_base_to_taxonomy'))
alter table _base_to_taxonomy  drop constraint FK385C5F5CC38101B7


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK385C5F5C42662F8]') AND parent_obj = OBJECT_ID('_base_to_taxonomy'))
alter table _base_to_taxonomy  drop constraint FK385C5F5C42662F8


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKC432D0AB6C02F0A6]') AND parent_obj = OBJECT_ID('reference_to_base'))
alter table reference_to_base  drop constraint FKC432D0AB6C02F0A6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKC432D0ABED58DEB8]') AND parent_obj = OBJECT_ID('reference_to_base'))
alter table reference_to_base  drop constraint FKC432D0ABED58DEB8


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKB73EC70CD79F461]') AND parent_obj = OBJECT_ID('posting_type_action'))
alter table posting_type_action  drop constraint FKB73EC70CD79F461


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK516218C6A79831E2]') AND parent_obj = OBJECT_ID('posting_type_to_action'))
alter table posting_type_to_action  drop constraint FK516218C6A79831E2


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK516218C697CAFA4C]') AND parent_obj = OBJECT_ID('posting_type_to_action'))
alter table posting_type_to_action  drop constraint FK516218C697CAFA4C


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63B8BA52CEEB67BA]') AND parent_obj = OBJECT_ID('substance'))
alter table substance  drop constraint FK63B8BA52CEEB67BA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63B8BA524DBCCAD6]') AND parent_obj = OBJECT_ID('substance'))
alter table substance  drop constraint FK63B8BA524DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63B8BA524A6313E3]') AND parent_obj = OBJECT_ID('substance'))
alter table substance  drop constraint FK63B8BA524A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63B8BA52399C8ADA]') AND parent_obj = OBJECT_ID('substance'))
alter table substance  drop constraint FK63B8BA52399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK9AC3B518B3C2C773]') AND parent_obj = OBJECT_ID('drug_to_substances'))
alter table drug_to_substances  drop constraint FK9AC3B518B3C2C773


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK9AC3B518C96E0F97]') AND parent_obj = OBJECT_ID('drug_to_substances'))
alter table drug_to_substances  drop constraint FK9AC3B518C96E0F97


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK73FECE9C2509F382]') AND parent_obj = OBJECT_ID('posting_type'))
alter table posting_type  drop constraint FK73FECE9C2509F382


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK418EA0A2BBA94AF]') AND parent_obj = OBJECT_ID('user_group'))
alter table user_group  drop constraint FK418EA0A2BBA94AF


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK13BD389E727021A0]') AND parent_obj = OBJECT_ID('groups_to_privilege'))
alter table groups_to_privilege  drop constraint FK13BD389E727021A0


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK13BD389E9322F6FF]') AND parent_obj = OBJECT_ID('groups_to_privilege'))
alter table groups_to_privilege  drop constraint FK13BD389E9322F6FF


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3A8330202EA5C3EF]') AND parent_obj = OBJECT_ID('reference'))
alter table reference  drop constraint FK3A8330202EA5C3EF


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3A8330204DBCCAD6]') AND parent_obj = OBJECT_ID('reference'))
alter table reference  drop constraint FK3A8330204DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3A8330204A6313E3]') AND parent_obj = OBJECT_ID('reference'))
alter table reference  drop constraint FK3A8330204A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3A833020399C8ADA]') AND parent_obj = OBJECT_ID('reference'))
alter table reference  drop constraint FK3A833020399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKA71545FF4B1813E0]') AND parent_obj = OBJECT_ID('privilege_type'))
alter table privilege_type  drop constraint FKA71545FF4B1813E0


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKE595065B4087A75A]') AND parent_obj = OBJECT_ID('module'))
alter table module  drop constraint FKE595065B4087A75A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKC2651722AC4D41B6]') AND parent_obj = OBJECT_ID('field_types'))
alter table field_types  drop constraint FKC2651722AC4D41B6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKC26517226608375]') AND parent_obj = OBJECT_ID('field_types'))
alter table field_types  drop constraint FKC26517226608375


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKC265172269ED5D97]') AND parent_obj = OBJECT_ID('field_types'))
alter table field_types  drop constraint FKC265172269ED5D97


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK210F2028DD955F6A]') AND parent_obj = OBJECT_ID('user_groups_to_field_type'))
alter table user_groups_to_field_type  drop constraint FK210F2028DD955F6A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF60B0A27D922D1]') AND parent_obj = OBJECT_ID('appuser'))
alter table appuser  drop constraint FKF60B0A27D922D1


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF60B0A62BA4FC0]') AND parent_obj = OBJECT_ID('appuser'))
alter table appuser  drop constraint FKF60B0A62BA4FC0


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK4097F19E2994A220]') AND parent_obj = OBJECT_ID('posting_to_users'))
alter table posting_to_users  drop constraint FK4097F19E2994A220


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK4097F19E6E5F9586]') AND parent_obj = OBJECT_ID('posting_to_users'))
alter table posting_to_users  drop constraint FK4097F19E6E5F9586


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF702185CD29EA79]') AND parent_obj = OBJECT_ID('posting'))
alter table posting  drop constraint FKF702185CD29EA79


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF7021854DBCCAD6]') AND parent_obj = OBJECT_ID('posting'))
alter table posting  drop constraint FKF7021854DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF7021854A6313E3]') AND parent_obj = OBJECT_ID('posting'))
alter table posting  drop constraint FKF7021854A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF702185399C8ADA]') AND parent_obj = OBJECT_ID('posting'))
alter table posting  drop constraint FKF702185399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63260F4FBD3FEC52]') AND parent_obj = OBJECT_ID('posting_to_postings'))
alter table posting_to_postings  drop constraint FK63260F4FBD3FEC52


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK63260F4F1B3E3A3A]') AND parent_obj = OBJECT_ID('posting_to_postings'))
alter table posting_to_postings  drop constraint FK63260F4F1B3E3A3A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKEB6FFC226E5F9586]') AND parent_obj = OBJECT_ID('posting_to_fields'))
alter table posting_to_fields  drop constraint FKEB6FFC226E5F9586


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK8102A7AEAAE9FBC9]') AND parent_obj = OBJECT_ID('contact_profile'))
alter table contact_profile  drop constraint FK8102A7AEAAE9FBC9


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK8102A7AE399C8ADA]') AND parent_obj = OBJECT_ID('contact_profile'))
alter table contact_profile  drop constraint FK8102A7AE399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK10ADA27FCCD7D431]') AND parent_obj = OBJECT_ID('taxonomy'))
alter table taxonomy  drop constraint FK10ADA27FCCD7D431


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK10ADA27F4DBCCAD6]') AND parent_obj = OBJECT_ID('taxonomy'))
alter table taxonomy  drop constraint FK10ADA27F4DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK10ADA27F4A6313E3]') AND parent_obj = OBJECT_ID('taxonomy'))
alter table taxonomy  drop constraint FK10ADA27F4A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK10ADA27F399C8ADA]') AND parent_obj = OBJECT_ID('taxonomy'))
alter table taxonomy  drop constraint FK10ADA27F399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK10ADA27FCEB8532E]') AND parent_obj = OBJECT_ID('taxonomy'))
alter table taxonomy  drop constraint FK10ADA27FCEB8532E


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK9CFCD7FCCA89C9D]') AND parent_obj = OBJECT_ID('privilege'))
alter table privilege  drop constraint FK9CFCD7FCCA89C9D


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK9CFCD7FC494F06F9]') AND parent_obj = OBJECT_ID('privilege'))
alter table privilege  drop constraint FK9CFCD7FC494F06F9


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKED62EAAC6C4880CC]') AND parent_obj = OBJECT_ID('clinical'))
alter table clinical  drop constraint FKED62EAAC6C4880CC


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKED62EAAC4DBCCAD6]') AND parent_obj = OBJECT_ID('clinical'))
alter table clinical  drop constraint FKED62EAAC4DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKED62EAAC4A6313E3]') AND parent_obj = OBJECT_ID('clinical'))
alter table clinical  drop constraint FKED62EAAC4A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKED62EAAC399C8ADA]') AND parent_obj = OBJECT_ID('clinical'))
alter table clinical  drop constraint FKED62EAAC399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKDCDA61CB2BE079E]') AND parent_obj = OBJECT_ID('clinical_to_treatments'))
alter table clinical_to_treatments  drop constraint FKDCDA61CB2BE079E


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKDCDA61CD394A4AC]') AND parent_obj = OBJECT_ID('clinical_to_treatments'))
alter table clinical_to_treatments  drop constraint FKDCDA61CD394A4AC


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3656FD28B2BE079E]') AND parent_obj = OBJECT_ID('clinical_to_drugs'))
alter table clinical_to_drugs  drop constraint FK3656FD28B2BE079E


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3656FD28C96E0F97]') AND parent_obj = OBJECT_ID('clinical_to_drugs'))
alter table clinical_to_drugs  drop constraint FK3656FD28C96E0F97


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3695FA7075B8D72F]') AND parent_obj = OBJECT_ID('treatment'))
alter table treatment  drop constraint FK3695FA7075B8D72F


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3695FA704DBCCAD6]') AND parent_obj = OBJECT_ID('treatment'))
alter table treatment  drop constraint FK3695FA704DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3695FA704A6313E3]') AND parent_obj = OBJECT_ID('treatment'))
alter table treatment  drop constraint FK3695FA704A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3695FA70399C8ADA]') AND parent_obj = OBJECT_ID('treatment'))
alter table treatment  drop constraint FK3695FA70399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD6110FBBD394A4AC]') AND parent_obj = OBJECT_ID('treatment_to_drugs'))
alter table treatment_to_drugs  drop constraint FKD6110FBBD394A4AC


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD6110FBBC96E0F97]') AND parent_obj = OBJECT_ID('treatment_to_drugs'))
alter table treatment_to_drugs  drop constraint FKD6110FBBC96E0F97


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCDFBA8DB81B13617]') AND parent_obj = OBJECT_ID('connections_master'))
alter table connections_master  drop constraint FKCDFBA8DB81B13617


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCDFBA8DBBB3372DB]') AND parent_obj = OBJECT_ID('connections_master'))
alter table connections_master  drop constraint FKCDFBA8DBBB3372DB


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCDFBA8DB3A8C8D83]') AND parent_obj = OBJECT_ID('connections_master'))
alter table connections_master  drop constraint FKCDFBA8DB3A8C8D83


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCDFBA8DBDAE72ACA]') AND parent_obj = OBJECT_ID('connections_master'))
alter table connections_master  drop constraint FKCDFBA8DBDAE72ACA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK744E77CF6F21FA69]') AND parent_obj = OBJECT_ID('connections_slave'))
alter table connections_slave  drop constraint FK744E77CF6F21FA69


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK744E77CFBB3372DB]') AND parent_obj = OBJECT_ID('connections_slave'))
alter table connections_slave  drop constraint FK744E77CFBB3372DB


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK744E77CF3A8C8D83]') AND parent_obj = OBJECT_ID('connections_slave'))
alter table connections_slave  drop constraint FK744E77CF3A8C8D83


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK744E77CFDAE72ACA]') AND parent_obj = OBJECT_ID('connections_slave'))
alter table connections_slave  drop constraint FK744E77CFDAE72ACA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD7C6779D3EB2B83]') AND parent_obj = OBJECT_ID('drug'))
alter table drug  drop constraint FKD7C6779D3EB2B83


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD7C6779D4DBCCAD6]') AND parent_obj = OBJECT_ID('drug'))
alter table drug  drop constraint FKD7C6779D4DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD7C6779D4A6313E3]') AND parent_obj = OBJECT_ID('drug'))
alter table drug  drop constraint FKD7C6779D4A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKD7C6779D399C8ADA]') AND parent_obj = OBJECT_ID('drug'))
alter table drug  drop constraint FKD7C6779D399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3E4DB2BC96E0F97]') AND parent_obj = OBJECT_ID('drug_to_drug_market'))
alter table drug_to_drug_market  drop constraint FK3E4DB2BC96E0F97


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3E4DB2BE18CF6D]') AND parent_obj = OBJECT_ID('drug_to_drug_market'))
alter table drug_to_drug_market  drop constraint FK3E4DB2BE18CF6D


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK46958004DCDA3E5]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK46958004DCDA3E5


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK469580044DBCCAD6]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK469580044DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK469580044A6313E3]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK469580044A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK46958004399C8ADA]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK46958004399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK46958004E87BB6E5]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK46958004E87BB6E5


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK469580041E4993AD]') AND parent_obj = OBJECT_ID('menu_option'))
alter table menu_option  drop constraint FK469580041E4993AD


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCD6497A97028C002]') AND parent_obj = OBJECT_ID('drug_market'))
alter table drug_market  drop constraint FKCD6497A97028C002


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCD6497A94DBCCAD6]') AND parent_obj = OBJECT_ID('drug_market'))
alter table drug_market  drop constraint FKCD6497A94DBCCAD6


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCD6497A94A6313E3]') AND parent_obj = OBJECT_ID('drug_market'))
alter table drug_market  drop constraint FKCD6497A94A6313E3


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKCD6497A9399C8ADA]') AND parent_obj = OBJECT_ID('drug_market'))
alter table drug_market  drop constraint FKCD6497A9399C8ADA


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKB995793D1168691B]') AND parent_obj = OBJECT_ID('fields'))
alter table fields  drop constraint FKB995793D1168691B


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FKF4787C5159EFCBC9]') AND parent_obj = OBJECT_ID('user_meta_data'))
alter table user_meta_data  drop constraint FKF4787C5159EFCBC9


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK80FBBF954B0DC91A]') AND parent_obj = OBJECT_ID('meta_data'))
alter table meta_data  drop constraint FK80FBBF954B0DC91A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK3127B7754B0DC91A]') AND parent_obj = OBJECT_ID('meta_data_geo'))
alter table meta_data_geo  drop constraint FK3127B7754B0DC91A


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK2B63AA8B3A8C8D83]') AND parent_obj = OBJECT_ID('logs'))
alter table logs  drop constraint FK2B63AA8B3A8C8D83


    if exists (select 1 from sysobjects where id = OBJECT_ID(N'[FK2B63AA8BD5C98639]') AND parent_obj = OBJECT_ID('logs'))
alter table logs  drop constraint FK2B63AA8BD5C98639


    if exists (select * from dbo.sysobjects where id = object_id(N'meta_data_date') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table meta_data_date

    if exists (select * from dbo.sysobjects where id = object_id(N'options') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table options

    if exists (select * from dbo.sysobjects where id = object_id(N'_base') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table _base

    if exists (select * from dbo.sysobjects where id = object_id(N'_base_to_users') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table _base_to_users

    if exists (select * from dbo.sysobjects where id = object_id(N'_base_to_taxonomy_types') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table _base_to_taxonomy_types

    if exists (select * from dbo.sysobjects where id = object_id(N'_base_to_taxonomy') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table _base_to_taxonomy

    if exists (select * from dbo.sysobjects where id = object_id(N'reference_to_base') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table reference_to_base

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_type_action') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_type_action

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_type_to_action') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_type_to_action

    if exists (select * from dbo.sysobjects where id = object_id(N'substance') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table substance

    if exists (select * from dbo.sysobjects where id = object_id(N'drug_to_substances') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table drug_to_substances

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_type') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_type

    if exists (select * from dbo.sysobjects where id = object_id(N'user_group') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table user_group

    if exists (select * from dbo.sysobjects where id = object_id(N'groups_to_privilege') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table groups_to_privilege

    if exists (select * from dbo.sysobjects where id = object_id(N'reference') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table reference

    if exists (select * from dbo.sysobjects where id = object_id(N'privilege_type') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table privilege_type

    if exists (select * from dbo.sysobjects where id = object_id(N'module') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table module

    if exists (select * from dbo.sysobjects where id = object_id(N'field_types') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table field_types

    if exists (select * from dbo.sysobjects where id = object_id(N'user_groups_to_field_type') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table user_groups_to_field_type

    if exists (select * from dbo.sysobjects where id = object_id(N'appuser') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table appuser

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_to_users') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_to_users

    if exists (select * from dbo.sysobjects where id = object_id(N'posting') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_to_postings') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_to_postings

    if exists (select * from dbo.sysobjects where id = object_id(N'posting_to_fields') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table posting_to_fields

    if exists (select * from dbo.sysobjects where id = object_id(N'contact_profile') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table contact_profile

    if exists (select * from dbo.sysobjects where id = object_id(N'taxonomy') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table taxonomy

    if exists (select * from dbo.sysobjects where id = object_id(N'privilege') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table privilege

    if exists (select * from dbo.sysobjects where id = object_id(N'clinical') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table clinical

    if exists (select * from dbo.sysobjects where id = object_id(N'clinical_to_treatments') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table clinical_to_treatments

    if exists (select * from dbo.sysobjects where id = object_id(N'clinical_to_drugs') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table clinical_to_drugs

    if exists (select * from dbo.sysobjects where id = object_id(N'treatment') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table treatment

    if exists (select * from dbo.sysobjects where id = object_id(N'treatment_to_drugs') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table treatment_to_drugs

    if exists (select * from dbo.sysobjects where id = object_id(N'connections_master') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table connections_master

    if exists (select * from dbo.sysobjects where id = object_id(N'connections_slave') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table connections_slave

    if exists (select * from dbo.sysobjects where id = object_id(N'drug') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table drug

    if exists (select * from dbo.sysobjects where id = object_id(N'drug_to_drug_market') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table drug_to_drug_market

    if exists (select * from dbo.sysobjects where id = object_id(N'menu_option') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table menu_option

    if exists (select * from dbo.sysobjects where id = object_id(N'drug_market') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table drug_market

    if exists (select * from dbo.sysobjects where id = object_id(N'fields') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table fields

    if exists (select * from dbo.sysobjects where id = object_id(N'user_meta_data') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table user_meta_data

    if exists (select * from dbo.sysobjects where id = object_id(N'meta_data') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table meta_data

    if exists (select * from dbo.sysobjects where id = object_id(N'site') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table site

    if exists (select * from dbo.sysobjects where id = object_id(N'meta_data_geo') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table meta_data_geo

    if exists (select * from dbo.sysobjects where id = object_id(N'taxonomy_type') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table taxonomy_type

    if exists (select * from dbo.sysobjects where id = object_id(N'logs') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table logs

    create table meta_data_date (
        meta_id INT IDENTITY NOT NULL,
       meta_key NVARCHAR(255) null,
       value DATETIME null,
       post INT null,
       primary key (meta_id)
    )

    create table options (
        option_id INT IDENTITY NOT NULL,
       value nvarchar(MAX) null,
       option_key NVARCHAR(255) null,
       is_overwritable BIT null,
       site INT null,
       primary key (option_id)
    )

    create table _base (
        id INT IDENTITY NOT NULL,
       alias NVARCHAR(255) null,
       creation_date DATETIME default GETDATE()  not null,
       updated_date DATETIME default GETDATE()  not null,
       published BIT null,
       checksum nvarchar(MAX) null,
       filehash nvarchar(MAX) null,
       static_file nvarchar(MAX) null,
       url NVARCHAR(255) null,
       position INT default 0  null,
       sort INT default 0  null,
       revision INT null,
       version INT null,
       root BIT null,
       deleted BIT default 0  null,
       is_active BIT default 0  null,
       is_default BIT default 0  null,
       is_visible BIT default 1  null,
       is_core BIT default 0  null,
       is_visible_to_others BIT default 0  null,
       is_frontend BIT default 1  null,
       is_admin BIT default 0  null,
       admin_url NVARCHAR(255) null,
       is_link BIT default 0  null,
       is_editable BIT default 1  null,
       is_frontend_editable BIT default 1  null,
       is_Public BIT default 1  null,
       protect_post nvarchar(MAX) null,
       is_deletable BIT default 1  null,
       is_cachable BIT default 1  null,
       is_trackable BIT default 1  null,
       loads_file BIT default 0  null,
       tmp BIT default 0  null,
       editable BIT default 0  null,
       gets_media BIT default 0  null,
       gets_url BIT default 0  null,
       is_tabable_content BIT default 0  null,
       is_summarizable BIT default 0  null,
       is_taggable BIT default 1  null,
       gets_metadata BIT default 1  null,
       is_taxonomyable BIT default 1  null,
       is_categorized BIT default 1  null,
       is_templatable BIT default 1  null,
       seen INT null,
       options nvarchar(MAX) null,
       theme nvarchar(MAX) null,
       parent INT null,
       site INT null,
       primary key (id)
    )

    create table _base_to_users (
        id INT not null,
       user_id INT not null
    )

    create table _base_to_taxonomy_types (
        baseid INT not null,
       taxonomy_type_id INT not null
    )

    create table _base_to_taxonomy (
        baseid INT not null,
       taxonomy_id INT not null
    )

    create table reference_to_base (
        id INT not null,
       reference_id INT not null
    )

    create table posting_type_action (
        posting_type_actions_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       primary key (posting_type_actions_id)
    )

    create table posting_type_to_action (
        posting_type_actions_id INT not null,
       posting_type_id INT not null
    )

    create table substance (
        substance_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       generic_name nvarchar(MAX) null,
       lab_code nvarchar(MAX) null,
       chemical_name nvarchar(MAX) null,
       molecular_formula nvarchar(MAX) null,
       mechanism_of_action nvarchar(MAX) null,
       pro_drug nvarchar(MAX) null,
       active_moiety nvarchar(MAX) null,
       major_metabolites nvarchar(MAX) null,
       active_agent_structure nvarchar(MAX) null,
       cas_reg_number nvarchar(MAX) null,
       japanese_accepted_name nvarchar(MAX) null,
       british_accepted_name nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (substance_id)
    )

    create table drug_to_substances (
        substance_id INT not null,
       drug_id INT not null
    )

    create table posting_type (
        posting_type_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       is_Code BIT default 0  null,
       is_Core BIT default 0  null,
       useTiny BIT default 1  null,
       overwriteable BIT default 1  null,
       use_posting_templates BIT default 0  null,
       use_layout_templates BIT default 0  null,
       primary key (posting_type_id)
    )

    create table user_group (
        user_groups_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       default_group BIT default 0  null,
       isAdmin BIT default 0  null,
       allow_signup BIT default 0  null,
       primary key (user_groups_id)
    )

    create table groups_to_privilege (
        user_groups_id INT not null,
       privileges_id INT not null
    )

    create table reference (
        reference_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       url nvarchar(MAX) null,
       type nvarchar(MAX) null,
       notes nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (reference_id)
    )

    create table privilege_type (
        privilege_type_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       discription NVARCHAR(255) null,
       primary key (privilege_type_id)
    )

    create table module (
        module_id INT not null,
       notes nvarchar(MAX) null,
       installed BIT null,
       primary key (module_id)
    )

    create table field_types (
        field_type_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       attr nvarchar(MAX) null,
       type NVARCHAR(255) null,
       fieldset INT null,
       is_public BIT default 1  null,
       notes INT null,
       template INT null,
       primary key (field_type_id)
    )

    create table user_groups_to_field_type (
        field_type_id INT not null,
       user_group_id INT not null
    )

    create table appuser (
        users_id INT not null,
       nid NVARCHAR(255) null,
       password NVARCHAR(255) null,
       display_name NVARCHAR(255) null,
       logedin BIT default 0  null,
       active BIT default 0  null,
       last_active DATETIME null,
       groups INT null,
       primary key (users_id)
    )

    create table posting_to_users (
        user_id INT not null,
       post_id INT not null
    )

    create table posting (
        post_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       is_Code BIT null,
       useTiny BIT null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (post_id)
    )

    create table posting_to_postings (
        parent INT not null,
       child INT not null
    )

    create table posting_to_fields (
        post_id INT not null,
       field_id INT not null
    )

    create table contact_profile (
        contact_profile_id INT not null,
       title NVARCHAR(255) null,
       first_name NVARCHAR(255) null,
       middle_name NVARCHAR(255) null,
       last_name NVARCHAR(255) null,
       email NVARCHAR(255) null,
       phone NVARCHAR(255) null,
       isDefault BIT default 0  null,
       isPublic BIT default 1  null,
       allowContact BIT default 1  null,
       owner INT null,
       primary key (contact_profile_id)
    )

    create table taxonomy (
        taxonomy_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       attr NVARCHAR(255) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       taxonomy_type INT null,
       primary key (taxonomy_id)
    )

    create table privilege (
        privileges_id INT not null,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       manager BIT default 0  null,
       discription NVARCHAR(255) null,
       owner INT null,
       primary key (privileges_id)
    )

    create table clinical (
        clinical_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       title nvarchar(MAX) null,
       ln_clinical_t nvarchar(MAX) null,
       max_dose nvarchar(MAX) null,
       min_dose nvarchar(MAX) null,
       adherence nvarchar(MAX) null,
       durability_tolerability nvarchar(MAX) null,
       durability_resistance_barrier nvarchar(MAX) null,
       durability_missed_dose nvarchar(MAX) null,
       time_to_load_suppression nvarchar(MAX) null,
       percentage_achieving_viral_load_suppression nvarchar(MAX) null,
       viral_load_suppression_cutoff nvarchar(MAX) null,
       pharmacology_comments nvarchar(MAX) null,
       biological_half_life nvarchar(MAX) null,
       metabolites_of_parent nvarchar(MAX) null,
       fasting_bioavailability nvarchar(MAX) null,
       fasting_auc nvarchar(MAX) null,
       fasting_auc_unit nvarchar(MAX) null,
       fasting_auc_last_value nvarchar(MAX) null,
       fasting_cmax nvarchar(MAX) null,
       fasting_tmax nvarchar(MAX) null,
       fed_bioavailability nvarchar(MAX) null,
       fed_auc nvarchar(MAX) null,
       fed_auc_unit nvarchar(MAX) null,
       fed_auc_last_value nvarchar(MAX) null,
       fed_cmax nvarchar(MAX) null,
       fed_tmax nvarchar(MAX) null,
       steady_state_cmax nvarchar(MAX) null,
       steady_state_cmin nvarchar(MAX) null,
       steady_state_tmax nvarchar(MAX) null,
       steady_state_auc nvarchar(MAX) null,
       steady_state_auc_unit nvarchar(MAX) null,
       resistance nvarchar(MAX) null,
       genetic_mutation nvarchar(MAX) null,
       discontinuation_adverse_events nvarchar(MAX) null,
       discontinuation_virologic_failure nvarchar(MAX) null,
       discontinuation_followup nvarchar(MAX) null,
       discontinuation_other nvarchar(MAX) null,
       toxicity nvarchar(MAX) null,
       study_type nvarchar(MAX) null,
       study_phase nvarchar(MAX) null,
       study_sample_size nvarchar(MAX) null,
       study_location nvarchar(MAX) null,
       study_sick_healthy nvarchar(MAX) null,
       study_length nvarchar(MAX) null,
       study_length_measurement nvarchar(MAX) null,
       toxicity_sae nvarchar(MAX) null,
       toxicity_sae_moa_dmpk nvarchar(MAX) null,
       toxicity_other nvarchar(MAX) null,
       toxicity_other_moa_dmpk nvarchar(MAX) null,
       toxicity_drug_to_drug_interactions nvarchar(MAX) null,
       toxicity_drug_to_drug_interactions_moa_dmpk nvarchar(MAX) null,
       toxicity_ae_chronic nvarchar(MAX) null,
       toxicity_ae_chronic_moa_dmpk nvarchar(MAX) null,
       toxicity_ae_advanced_grade nvarchar(MAX) null,
       toxicity_ae_advanced_grade_moa_dmpk nvarchar(MAX) null,
       adherance_convenience_pillburden nvarchar(MAX) null,
       adherance_convenience_palatablilty nvarchar(MAX) null,
       adherance_convenience_diet_constraints nvarchar(MAX) null,
       adherance_convenience_diet_constraints_moa_dmpk nvarchar(MAX) null,
       adherance_convenience_co_dosing_constraints nvarchar(MAX) null,
       adherance_convenience_co_dosing_constraints_moa_dmpk nvarchar(MAX) null,
       adherance_convenience_dose_timing_constraints nvarchar(MAX) null,
       adherance_convenience_dose_timing_constraints_moa_dmpk nvarchar(MAX) null,
       adherance_convenience_frequency nvarchar(MAX) null,
       adherance_convenience_frequency_moa_dmpk nvarchar(MAX) null,
       adherance_tolerability_lost_to_follow_up nvarchar(MAX) null,
       adherance_tolerability_other_tolerabilities nvarchar(MAX) null,
       adherance_tolerability_ae_acute nvarchar(MAX) null,
       adherance_tolerability_ae_acute_moa_dmpk nvarchar(MAX) null,
       adherance_tolerability_ae_mild_grade nvarchar(MAX) null,
       adherance_tolerability_ae_mild_grade_moa_dmpk nvarchar(MAX) null,
       forgiveness_genetic_barrier_to_resistance nvarchar(MAX) null,
       forgiveness_virological_failure nvarchar(MAX) null,
       forgiveness_forgiveness nvarchar(MAX) null,
       forgiveness_forgiveness_moa_dmpk nvarchar(MAX) null,
       forgiveness_drug_to_drug_interactions_efficacy_reduction nvarchar(MAX) null,
       forgiveness_drug_to_drug_interactions_efficacy_reduction_moa_dmpk nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (clinical_id)
    )

    create table clinical_to_treatments (
        clinical_id INT not null,
       treatment_id INT not null
    )

    create table clinical_to_drugs (
        clinical_id INT not null,
       drug_id INT not null
    )

    create table treatment (
        treatment_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       record_id nvarchar(MAX) null,
       acronym nvarchar(MAX) null,
       discription nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (treatment_id)
    )

    create table treatment_to_drugs (
        treatment_id INT not null,
       drug_id INT not null
    )

    create table connections_master (
        connections_master_id INT not null,
       notes nvarchar(MAX) null,
       api_url nvarchar(MAX) null,
       access_token nvarchar(MAX) null,
       client_id nvarchar(MAX) null,
       _key nvarchar(MAX) null,
       secret nvarchar(MAX) null,
       callback_url nvarchar(MAX) null,
       _site INT null,
       _user INT null,
       _group INT null,
       primary key (connections_master_id)
    )

    create table connections_slave (
        connections_slave_id INT not null,
       notes nvarchar(MAX) null,
       api_url nvarchar(MAX) null,
       access_token nvarchar(MAX) null,
       client_id nvarchar(MAX) null,
       _key nvarchar(MAX) null,
       secret nvarchar(MAX) null,
       callback_url nvarchar(MAX) null,
       _site INT null,
       _user INT null,
       _group INT null,
       primary key (connections_slave_id)
    )

    create table drug (
        drug_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       lab_code nvarchar(MAX) null,
       common_name_or_abbreviation nvarchar(MAX) null,
       brand_name nvarchar(MAX) null,
       innovator_company nvarchar(MAX) null,
       commercial_company nvarchar(MAX) null,
       manufacturer nvarchar(MAX) null,
       approved_for nvarchar(MAX) null,
       new_drug_code nvarchar(MAX) null,
       investigational nvarchar(MAX) null,
       sra nvarchar(MAX) null,
       sra_approval_status nvarchar(MAX) null,
       sra_approval_date nvarchar(MAX) null,
       label_claim nvarchar(MAX) null,
       dosing nvarchar(MAX) null,
       dose_form nvarchar(MAX) null,
       route_of_administration nvarchar(MAX) null,
       frequency nvarchar(MAX) null,
       pill_burden nvarchar(MAX) null,
       inactive_ingredients nvarchar(MAX) null,
       alternative_indications nvarchar(MAX) null,
       special_considerations nvarchar(MAX) null,
       special_populations nvarchar(MAX) null,
       storage_condition nvarchar(MAX) null,
       lmic_1l nvarchar(MAX) null,
       lmic_2l nvarchar(MAX) null,
       lmic_3l nvarchar(MAX) null,
       clin_phase_1 nvarchar(MAX) null,
       clin_phase_1_date nvarchar(MAX) null,
       clin_phase_2 nvarchar(MAX) null,
       clin_phase_2_date nvarchar(MAX) null,
       clin_phase_3 nvarchar(MAX) null,
       clin_phase_3_date nvarchar(MAX) null,
       chai_ceiling_price nvarchar(MAX) null,
       chai_ceiling_price_date nvarchar(MAX) null,
       patients_on_therapy nvarchar(MAX) null,
       patients_on_therapy_year nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (drug_id)
    )

    create table drug_to_drug_market (
        drug_id INT not null,
       drug_market_id INT not null
    )

    create table menu_option (
        menu_option_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       menu_text NVARCHAR(255) null,
       show BIT null,
       post_type INT null,
       editing INT null,
       owner INT null,
       post INT null,
       parent INT null,
       primary key (menu_option_id)
    )

    create table drug_market (
        drug_market_id INT not null,
       name NVARCHAR(255) null,
       content nvarchar(MAX) null,
       publish_time DATETIME default GETDATE()  not null,
       outputError DATETIME null,
       year nvarchar(MAX) null,
       chai_ceiling_price nvarchar(MAX) null,
       patients_on_therapy nvarchar(MAX) null,
       source_one nvarchar(MAX) null,
       source_one_price nvarchar(MAX) null,
       source_two nvarchar(MAX) null,
       source_two_price nvarchar(MAX) null,
       post_type INT null,
       editing INT null,
       owner INT null,
       primary key (drug_market_id)
    )

    create table fields (
        field_id INT IDENTITY NOT NULL,
       value NVARCHAR(255) null,
       owner INT null,
       type INT null,
       primary key (field_id)
    )

    create table user_meta_data (
        meta_id INT IDENTITY NOT NULL,
       meta_key NVARCHAR(255) null,
       value nvarchar(MAX) null,
       appuser INT null,
       primary key (meta_id)
    )

    create table meta_data (
        meta_id INT IDENTITY NOT NULL,
       meta_key NVARCHAR(255) null,
       value nvarchar(MAX) null,
       post INT null,
       primary key (meta_id)
    )

    create table site (
        site_id INT IDENTITY NOT NULL,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       siteroot nvarchar(MAX) null,
       base_url nvarchar(MAX) null,
       local_path nvarchar(MAX) null,
       static_directories nvarchar(MAX) null,
       static_rendering BIT null,
       is_default BIT null,
       primary key (site_id)
    )

    create table meta_data_geo (
        meta_id INT IDENTITY NOT NULL,
       meta_key NVARCHAR(255) null,
       coordinate geography null,
       post INT null,
       primary key (meta_id)
    )

    create table taxonomy_type (
        taxonomy_type_id INT IDENTITY NOT NULL,
       name NVARCHAR(255) null,
       alias NVARCHAR(255) null,
       allows_multiple BIT default 1  null,
       is_mergable BIT default 1  null,
       is_visible BIT default 0  null,
       is_core BIT default 0  null,
       primary key (taxonomy_type_id)
    )

    create table logs (
        log_id INT IDENTITY NOT NULL,
       entry NVARCHAR(255) null,
       code NVARCHAR(255) null,
       obj_id INT null,
       action NVARCHAR(255) null,
       controller NVARCHAR(255) null,
       nid NVARCHAR(255) null,
       ip NVARCHAR(255) null,
       dtOfLog DATETIME null,
       _user INT null,
       item INT null,
       primary key (log_id)
    )

    alter table meta_data_date 
        add constraint FKFE2BF54B0DC91A 
        foreign key (post) 
        references _base

    alter table options 
        add constraint FKA1D6A05385A87919 
        foreign key (site) 
        references site

    alter table _base 
        add constraint FK142AADA985A87919 
        foreign key (site) 
        references site

    alter table _base 
        add constraint FK142AADA91E4993AD 
        foreign key (parent) 
        references _base

    alter table _base_to_users 
        add constraint FK53AE44D86C02F0A6 
        foreign key (id) 
        references _base

    alter table _base_to_users 
        add constraint FK53AE44D82994A220 
        foreign key (user_id) 
        references appuser

    alter table _base_to_taxonomy_types 
        add constraint FKFFE211B8C38101B7 
        foreign key (baseid) 
        references _base

    alter table _base_to_taxonomy_types 
        add constraint FKFFE211B8E601F301 
        foreign key (taxonomy_type_id) 
        references taxonomy_type

    alter table _base_to_taxonomy 
        add constraint FK385C5F5CC38101B7 
        foreign key (baseid) 
        references _base

    alter table _base_to_taxonomy 
        add constraint FK385C5F5C42662F8 
        foreign key (taxonomy_id) 
        references taxonomy

    alter table reference_to_base 
        add constraint FKC432D0AB6C02F0A6 
        foreign key (id) 
        references _base

    alter table reference_to_base 
        add constraint FKC432D0ABED58DEB8 
        foreign key (reference_id) 
        references reference

    alter table posting_type_action 
        add constraint FKB73EC70CD79F461 
        foreign key (posting_type_actions_id) 
        references _base

    alter table posting_type_to_action 
        add constraint FK516218C6A79831E2 
        foreign key (posting_type_actions_id) 
        references posting_type_action

    alter table posting_type_to_action 
        add constraint FK516218C697CAFA4C 
        foreign key (posting_type_id) 
        references posting_type

    alter table substance 
        add constraint FK63B8BA52CEEB67BA 
        foreign key (substance_id) 
        references _base

    alter table substance 
        add constraint FK63B8BA524DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table substance 
        add constraint FK63B8BA524A6313E3 
        foreign key (editing) 
        references appuser

    alter table substance 
        add constraint FK63B8BA52399C8ADA 
        foreign key (owner) 
        references appuser

    alter table drug_to_substances 
        add constraint FK9AC3B518B3C2C773 
        foreign key (substance_id) 
        references substance

    alter table drug_to_substances 
        add constraint FK9AC3B518C96E0F97 
        foreign key (drug_id) 
        references drug

    alter table posting_type 
        add constraint FK73FECE9C2509F382 
        foreign key (posting_type_id) 
        references _base

    alter table user_group 
        add constraint FK418EA0A2BBA94AF 
        foreign key (user_groups_id) 
        references _base

    alter table groups_to_privilege 
        add constraint FK13BD389E727021A0 
        foreign key (user_groups_id) 
        references user_group

    alter table groups_to_privilege 
        add constraint FK13BD389E9322F6FF 
        foreign key (privileges_id) 
        references privilege

    alter table reference 
        add constraint FK3A8330202EA5C3EF 
        foreign key (reference_id) 
        references _base

    alter table reference 
        add constraint FK3A8330204DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table reference 
        add constraint FK3A8330204A6313E3 
        foreign key (editing) 
        references appuser

    alter table reference 
        add constraint FK3A833020399C8ADA 
        foreign key (owner) 
        references appuser

    alter table privilege_type 
        add constraint FKA71545FF4B1813E0 
        foreign key (privilege_type_id) 
        references _base

    alter table module 
        add constraint FKE595065B4087A75A 
        foreign key (module_id) 
        references _base

    alter table field_types 
        add constraint FKC2651722AC4D41B6 
        foreign key (field_type_id) 
        references _base

    alter table field_types 
        add constraint FKC26517226608375 
        foreign key (notes) 
        references posting

    alter table field_types 
        add constraint FKC265172269ED5D97 
        foreign key (template) 
        references posting

    alter table user_groups_to_field_type 
        add constraint FK210F2028DD955F6A 
        foreign key (field_type_id) 
        references field_types

    alter table appuser 
        add constraint FKF60B0A27D922D1 
        foreign key (users_id) 
        references _base

    alter table appuser 
        add constraint FKF60B0A62BA4FC0 
        foreign key (groups) 
        references user_group

    alter table posting_to_users 
        add constraint FK4097F19E2994A220 
        foreign key (user_id) 
        references appuser

    alter table posting_to_users 
        add constraint FK4097F19E6E5F9586 
        foreign key (post_id) 
        references posting

    alter table posting 
        add constraint FKF702185CD29EA79 
        foreign key (post_id) 
        references _base

    alter table posting 
        add constraint FKF7021854DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table posting 
        add constraint FKF7021854A6313E3 
        foreign key (editing) 
        references appuser

    alter table posting 
        add constraint FKF702185399C8ADA 
        foreign key (owner) 
        references appuser

    alter table posting_to_postings 
        add constraint FK63260F4FBD3FEC52 
        foreign key (parent) 
        references posting

    alter table posting_to_postings 
        add constraint FK63260F4F1B3E3A3A 
        foreign key (child) 
        references posting

    alter table posting_to_fields 
        add constraint FKEB6FFC226E5F9586 
        foreign key (post_id) 
        references posting

    alter table contact_profile 
        add constraint FK8102A7AEAAE9FBC9 
        foreign key (contact_profile_id) 
        references _base

    alter table contact_profile 
        add constraint FK8102A7AE399C8ADA 
        foreign key (owner) 
        references appuser

    alter table taxonomy 
        add constraint FK10ADA27FCCD7D431 
        foreign key (taxonomy_id) 
        references _base

    alter table taxonomy 
        add constraint FK10ADA27F4DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table taxonomy 
        add constraint FK10ADA27F4A6313E3 
        foreign key (editing) 
        references appuser

    alter table taxonomy 
        add constraint FK10ADA27F399C8ADA 
        foreign key (owner) 
        references appuser

    alter table taxonomy 
        add constraint FK10ADA27FCEB8532E 
        foreign key (taxonomy_type) 
        references taxonomy_type

    alter table privilege 
        add constraint FK9CFCD7FCCA89C9D 
        foreign key (privileges_id) 
        references _base

    alter table privilege 
        add constraint FK9CFCD7FC494F06F9 
        foreign key (owner) 
        references privilege_type

    alter table clinical 
        add constraint FKED62EAAC6C4880CC 
        foreign key (clinical_id) 
        references _base

    alter table clinical 
        add constraint FKED62EAAC4DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table clinical 
        add constraint FKED62EAAC4A6313E3 
        foreign key (editing) 
        references appuser

    alter table clinical 
        add constraint FKED62EAAC399C8ADA 
        foreign key (owner) 
        references appuser

    alter table clinical_to_treatments 
        add constraint FKDCDA61CB2BE079E 
        foreign key (clinical_id) 
        references clinical

    alter table clinical_to_treatments 
        add constraint FKDCDA61CD394A4AC 
        foreign key (treatment_id) 
        references treatment

    alter table clinical_to_drugs 
        add constraint FK3656FD28B2BE079E 
        foreign key (clinical_id) 
        references clinical

    alter table clinical_to_drugs 
        add constraint FK3656FD28C96E0F97 
        foreign key (drug_id) 
        references drug

    alter table treatment 
        add constraint FK3695FA7075B8D72F 
        foreign key (treatment_id) 
        references _base

    alter table treatment 
        add constraint FK3695FA704DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table treatment 
        add constraint FK3695FA704A6313E3 
        foreign key (editing) 
        references appuser

    alter table treatment 
        add constraint FK3695FA70399C8ADA 
        foreign key (owner) 
        references appuser

    alter table treatment_to_drugs 
        add constraint FKD6110FBBD394A4AC 
        foreign key (treatment_id) 
        references treatment

    alter table treatment_to_drugs 
        add constraint FKD6110FBBC96E0F97 
        foreign key (drug_id) 
        references drug

    alter table connections_master 
        add constraint FKCDFBA8DB81B13617 
        foreign key (connections_master_id) 
        references _base

    alter table connections_master 
        add constraint FKCDFBA8DBBB3372DB 
        foreign key (_site) 
        references site

    alter table connections_master 
        add constraint FKCDFBA8DB3A8C8D83 
        foreign key (_user) 
        references appuser

    alter table connections_master 
        add constraint FKCDFBA8DBDAE72ACA 
        foreign key (_group) 
        references user_group

    alter table connections_slave 
        add constraint FK744E77CF6F21FA69 
        foreign key (connections_slave_id) 
        references _base

    alter table connections_slave 
        add constraint FK744E77CFBB3372DB 
        foreign key (_site) 
        references site

    alter table connections_slave 
        add constraint FK744E77CF3A8C8D83 
        foreign key (_user) 
        references appuser

    alter table connections_slave 
        add constraint FK744E77CFDAE72ACA 
        foreign key (_group) 
        references user_group

    alter table drug 
        add constraint FKD7C6779D3EB2B83 
        foreign key (drug_id) 
        references _base

    alter table drug 
        add constraint FKD7C6779D4DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table drug 
        add constraint FKD7C6779D4A6313E3 
        foreign key (editing) 
        references appuser

    alter table drug 
        add constraint FKD7C6779D399C8ADA 
        foreign key (owner) 
        references appuser

    alter table drug_to_drug_market 
        add constraint FK3E4DB2BC96E0F97 
        foreign key (drug_id) 
        references drug

    alter table drug_to_drug_market 
        add constraint FK3E4DB2BE18CF6D 
        foreign key (drug_market_id) 
        references drug_market

    alter table menu_option 
        add constraint FK46958004DCDA3E5 
        foreign key (menu_option_id) 
        references _base

    alter table menu_option 
        add constraint FK469580044DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table menu_option 
        add constraint FK469580044A6313E3 
        foreign key (editing) 
        references appuser

    alter table menu_option 
        add constraint FK46958004399C8ADA 
        foreign key (owner) 
        references appuser

    alter table menu_option 
        add constraint FK46958004E87BB6E5 
        foreign key (post) 
        references posting

    alter table menu_option 
        add constraint FK469580041E4993AD 
        foreign key (parent) 
        references _base

    alter table drug_market 
        add constraint FKCD6497A97028C002 
        foreign key (drug_market_id) 
        references _base

    alter table drug_market 
        add constraint FKCD6497A94DBCCAD6 
        foreign key (post_type) 
        references posting_type

    alter table drug_market 
        add constraint FKCD6497A94A6313E3 
        foreign key (editing) 
        references appuser

    alter table drug_market 
        add constraint FKCD6497A9399C8ADA 
        foreign key (owner) 
        references appuser

    alter table fields 
        add constraint FKB995793D1168691B 
        foreign key (type) 
        references field_types

    alter table user_meta_data 
        add constraint FKF4787C5159EFCBC9 
        foreign key (appuser) 
        references appuser

    alter table meta_data 
        add constraint FK80FBBF954B0DC91A 
        foreign key (post) 
        references _base

    alter table meta_data_geo 
        add constraint FK3127B7754B0DC91A 
        foreign key (post) 
        references _base

    alter table logs 
        add constraint FK2B63AA8B3A8C8D83 
        foreign key (_user) 
        references appuser

    alter table logs 
        add constraint FK2B63AA8BD5C98639 
        foreign key (item) 
        references _base

    


/*

We are just added functions and indexs here that can't be auto generated


*/










/* clear functions */
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CalculateDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [CalculateDistance]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LatitudePlusDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [LatitudePlusDistance]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LongitudePlusDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [LongitudePlusDistance]
GO




/* These functions are for scearhing by zip codes
IF  EXISTS (SELECT * FROM sys.indexes  WHERE name  = N'[IX_campus_longitude_latitude]')
DROP INDEX [IX_campus_longitude_latitude] ON [campus]
GO
CREATE NONCLUSTERED INDEX IX_campus_longitude_latitude ON dbo.[campus]([longitude],[latitude], [zipcode])
GO
 */
/* Make functions to set up the searching but radius of a zip
CREATE FUNCTION [CalculateDistance]
	(@Longitude1 DECIMAL(8,5), 
	 @Latitude1  DECIMAL(8,5),
	 @Longitude2 DECIMAL(8,5),
	 @Latitude2  DECIMAL(8,5))
	RETURNS FLOAT
	AS
	BEGIN
	DECLARE @Temp FLOAT
	SET @Temp = SIN(@Latitude1/57.2957795130823) * SIN(@Latitude2/57.2957795130823) + COS(@Latitude1/57.2957795130823) * COS(@Latitude2/57.2957795130823) * COS(@Longitude2/57.2957795130823 - @Longitude1/57.2957795130823)
	IF @Temp > 1 
		SET @Temp = 1
	ELSE IF @Temp < -1
		SET @Temp = -1
	RETURN (3958.75586574 * ACOS(@Temp))
	END
GO

CREATE FUNCTION [dbo].[LatitudePlusDistance](@StartLatitude FLOAT, @Distance FLOAT) RETURNS FLOAT
AS
BEGIN
	RETURN (SELECT @StartLatitude + SQRT(@Distance * @Distance / 4766.8999155991))
	END
GO

CREATE FUNCTION [LongitudePlusDistance]
	(@StartLongitude FLOAT,
	 @StartLatitude FLOAT,
	 @Distance FLOAT)
RETURNS FLOAT
AS
BEGIN
	RETURN (SELECT @StartLongitude + SQRT(@Distance * @Distance / (4784.39411916406 * COS(2 * @StartLatitude / 114.591559026165) * COS(2 * @StartLatitude / 114.591559026165))))
	END
GO
INSERT INTO [campus]
			([name],[city],[state],[state_abbrev],[latitude],[longitude],[zipcode])
		VALUES
			('Pullman','Pullman','Washington','WA',46.7320368670458,-117.15451240539551,'99163'),
			('Tri-Cities','Richland','Washington','WA',46.32994669896143,-119.26323562860489,'99354'),
			('Vancouver','Vancouver','Washington','WA',45.73226906648018,-122.63564944267273,'98686'),
			('Riverpoint','Spokane','Washington','WA',47.66110972448931,-117.40625381469726,'99210')
GO
 */