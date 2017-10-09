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

 Date: 05/26/2017 11:56:03 AM
*/

-- ----------------------------
--  Table structure for t_user_permission
-- ----------------------------
DROP TABLE IF EXISTS "public"."t_user_permission";
CREATE TABLE "public"."t_user_permission" (
	"id" int4 NOT NULL DEFAULT nextval('s_user_permission'::regclass),
	"user_id" int4 NOT NULL,
	"org_id" int4 NOT NULL,
	"perm_id" int4 NOT NULL,
	"created_at" timestamp(6) NOT NULL DEFAULT now(),
	"updated_at" timestamp(6) NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."t_user_permission" OWNER TO "postgres";

COMMENT ON TABLE "public"."t_user_permission" IS '用户权限关系表';
COMMENT ON COLUMN "public"."t_user_permission"."user_id" IS '用户ID';
COMMENT ON COLUMN "public"."t_user_permission"."org_id" IS '所属机构ID';
COMMENT ON COLUMN "public"."t_user_permission"."perm_id" IS '权限ID';

-- ----------------------------
--  Records of t_user_permission
-- ----------------------------
BEGIN;
INSERT INTO "public"."t_user_permission" VALUES ('1000000002', '1000000002', '1000000000', '1000000000', '2017-05-26 01:39:56.095895', '2017-05-26 01:39:56.095895');
INSERT INTO "public"."t_user_permission" VALUES ('1000000003', '1000000002', '1000000000', '1000000001', '2017-05-26 01:40:03.717664', '2017-05-26 01:40:03.717664');
COMMIT;

-- ----------------------------
--  Primary key structure for table t_user_permission
-- ----------------------------
ALTER TABLE "public"."t_user_permission" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table t_user_permission
-- ----------------------------
ALTER TABLE "public"."t_user_permission" ADD CONSTRAINT "un_user_permission" UNIQUE ("user_id","org_id","perm_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table t_user_permission
-- ----------------------------
ALTER TABLE "public"."t_user_permission" ADD CONSTRAINT "fk_user_permission_org" FOREIGN KEY ("org_id") REFERENCES "public"."t_organization" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "public"."t_user_permission" ADD CONSTRAINT "fk_user_permission_user" FOREIGN KEY ("user_id") REFERENCES "public"."t_user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "public"."t_user_permission" ADD CONSTRAINT "fk_user_permission_perm" FOREIGN KEY ("perm_id") REFERENCES "public"."t_permission" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;

