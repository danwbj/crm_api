/*
 Navicat Premium Data Transfer

 Source Server         : PGdocker
 Source Server Type    : PostgreSQL
 Source Server Version : 90502
 Source Host           : localhost
 Source Database       : isee
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 90502
 File Encoding         : utf-8

 Date: 05/26/2017 11:55:55 AM
*/

-- ----------------------------
--  Table structure for t_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."t_user";
CREATE TABLE "public"."t_user" (
	"id" int4 NOT NULL DEFAULT nextval('s_user'::regclass),
	"org_id" int4 NOT NULL,
	"email" varchar(255) NOT NULL COLLATE "default",
	"password" varchar(255) NOT NULL COLLATE "default",
	"name" varchar(255) NOT NULL COLLATE "default",
	"mobile" varchar(255) NOT NULL COLLATE "default",
	"avatar" varchar(255) NOT NULL COLLATE "default",
	"type" int4 NOT NULL DEFAULT 0,
	"status" int4 NOT NULL DEFAULT 1,
	"created_at" timestamp(6) NOT NULL DEFAULT now(),
	"updated_at" timestamp(6) NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."t_user" OWNER TO "postgres";

COMMENT ON TABLE "public"."t_user" IS '用户表';
COMMENT ON COLUMN "public"."t_user"."org_id" IS '所属机构ID';
COMMENT ON COLUMN "public"."t_user"."email" IS '用户名:邮箱地址';
COMMENT ON COLUMN "public"."t_user"."password" IS '密码';
COMMENT ON COLUMN "public"."t_user"."name" IS '真实姓名';
COMMENT ON COLUMN "public"."t_user"."mobile" IS '移动电话';
COMMENT ON COLUMN "public"."t_user"."avatar" IS '用户头像';
COMMENT ON COLUMN "public"."t_user"."type" IS '用户类别:0 普通用户 1 超级用户';
COMMENT ON COLUMN "public"."t_user"."status" IS '状态:0 禁用 1 生效';

-- ----------------------------
--  Records of t_user
-- ----------------------------
BEGIN;
INSERT INTO "public"."t_user" VALUES ('1000000002', '1000000000', 'zhangsan@ms.com', '96e79218965eb72c92a549dd5a330112', '张三', '13212321232', 'uploads/pic/2017-5-9/3e1c6c60-348e-11e7-8282-51ac35d6fb08.png', '1', '1', '2017-05-26 01:36:01.903747', '2017-05-26 01:36:01.903747');
COMMIT;

-- ----------------------------
--  Primary key structure for table t_user
-- ----------------------------
ALTER TABLE "public"."t_user" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table t_user
-- ----------------------------
ALTER TABLE "public"."t_user" ADD CONSTRAINT "un_user" UNIQUE ("email") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table t_user
-- ----------------------------
ALTER TABLE "public"."t_user" ADD CONSTRAINT "fk_user_org" FOREIGN KEY ("org_id") REFERENCES "public"."t_organization" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;

