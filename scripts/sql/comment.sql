-------------------------------------------------------------------------------
--  Comment
-------------------------------------------------------------------------------
comment on table t_organization is '机构表';
comment on column t_organization.org_id is '上级机构ID';
comment on column t_organization.name is '机构名称';
comment on column t_organization.contact is '联系人';
comment on column t_organization.mobile is '联系电话';
comment on column t_organization.address is '机构地址';
comment on column t_organization.description is '机构描述';

comment on table t_user is '用户表';
comment on column t_user.org_id is '所属机构ID';
comment on column t_user.email is '用户名:邮箱地址';
comment on column t_user.password is '密码';
comment on column t_user.name is '真实姓名';
comment on column t_user.mobile is '移动电话';
comment on column t_user.avatar is '用户头像';
comment on column t_user.type is '用户类别:0 普通用户 1 超级用户';
comment on column t_user.status is '状态:0 禁用 1 生效';

comment on table t_permission is '权限表';
comment on column t_permission.name is '权限名称';
comment on column t_permission.route is '模块路由';
comment on column t_permission.description is '权限描述';

comment on table t_user_permission is '用户权限关系表';
comment on column t_user_permission.user_id is '用户ID';
comment on column t_user_permission.org_id is '所属机构ID';
comment on column t_user_permission.perm_id is '权限ID';


