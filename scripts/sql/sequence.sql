-------------------------------------------------------------------------------
--  Create Sequence
-------------------------------------------------------------------------------
create sequence s_organization start 1000000000 owned by t_organization.id;
create sequence s_user start 1000000000 owned by t_user.id;
create sequence s_permission start 1000000000 owned by t_permission.id;
create sequence s_user_permission start 1000000000 owned by t_user_permission.id;

alter table t_organization alter column id set default nextval('s_organization');
alter table t_user alter column id set default nextval('s_user');
alter table t_permission alter column id set default nextval('s_permission');
alter table t_user_permission alter column id set default nextval('s_user_permission');
