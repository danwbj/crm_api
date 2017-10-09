-------------------------------------------------------------------------------
--  Create Table
-------------------------------------------------------------------------------
create table t_organization (
	id integer,
	org_id integer,
	name varchar(255),
	contact varchar(255),
	mobile varchar(255),
	address varchar(255),
	description varchar(255),
	created_at timestamp with time zone,
	updated_at timestamp with time zone
);

create table t_user (
	id integer,
	org_id integer,
	email varchar(255),
	password varchar(255),
	name varchar(255),
	mobile varchar(255),
	avatar varchar(255),
	type integer,
	status integer,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
);

create table t_permission (
	id integer,
	name varchar(255),
	sort integer,
	route varchar(255),
	description varchar(255),
	created_at timestamp with time zone,
	updated_at timestamp with time zone
);

create table t_user_permission (
	id integer,
	user_id integer,
	org_id integer,
	perm_id integer,
	created_at timestamp with time zone,
	updated_at timestamp with time zone	
);
