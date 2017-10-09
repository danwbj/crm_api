-------------------------------------------------------------------------------
--  Primary Key
-------------------------------------------------------------------------------
alter table t_organization add constraint pk_organization primary key(id);
alter table t_user add constraint pk_user primary key(id);
alter table t_permission add constraint pk_permission primary key(id);
alter table t_user_permission add constraint pk_user_permission primary key(id);

-------------------------------------------------------------------------------
--  Foreign Key
-------------------------------------------------------------------------------
alter table t_user add constraint fk_user_org foreign key (org_id) references t_organization(id);
alter table t_user_permission add constraint fk_user_permission_user foreign key (user_id) references t_user(id);
alter table t_user_permission add constraint fk_user_permission_org foreign key (org_id) references t_organization(id);
alter table t_user_permission add constraint fk_user_permission_perm foreign key (perm_id) references t_permission(id);

-------------------------------------------------------------------------------
--  Unique
-------------------------------------------------------------------------------
alter table t_organization add constraint un_organization unique (name);
alter table t_user add constraint un_user unique (email);
alter table t_permission add constraint un_permission unique (route);
alter table t_user_permission add constraint un_user_permission unique (user_id, org_id, perm_id);

-------------------------------------------------------------------------------
--  Not Null
-------------------------------------------------------------------------------
alter table t_organization alter column name set not null;
alter table t_organization alter column contact set not null;
alter table t_organization alter column mobile set not null;
alter table t_organization alter column address set not null;
alter table t_organization alter column created_at set not null;
alter table t_organization alter column updated_at set not null;

alter table t_user alter column org_id set not null;
alter table t_user alter column email set not null;
alter table t_user alter column password set not null;
alter table t_user alter column name set not null;
alter table t_user alter column mobile set not null;
alter table t_user alter column avatar set not null;
alter table t_user alter column status set not null;
alter table t_user alter column type set not null;
alter table t_user alter column created_at set not null;
alter table t_user alter column updated_at set not null;

alter table t_permission alter column name set not null;
alter table t_permission alter column route set not null;
alter table t_permission alter column created_at set not null;
alter table t_permission alter column updated_at set not null;

alter table t_user_permission alter column user_id set not null;
alter table t_user_permission alter column org_id set not null;
alter table t_user_permission alter column perm_id set not null;
alter table t_user_permission alter column created_at set not null;
alter table t_user_permission alter column updated_at set not null;



-------------------------------------------------------------------------------
--  Default Value
-------------------------------------------------------------------------------
alter table t_organization alter column created_at set default now();
alter table t_organization alter column updated_at set default now();

alter table t_user alter column status set default 1;
alter table t_user alter column type set default 0;
alter table t_user alter column created_at set default now();
alter table t_user alter column updated_at set default now();

alter table t_permission alter column created_at set default now();
alter table t_permission alter column updated_at set default now();

alter table t_user_permission alter column created_at set default now();
alter table t_user_permission alter column updated_at set default now();

