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

 Date: 05/26/2017 11:55:40 AM
*/

-- ----------------------------
--  Table structure for t_organization
-- ----------------------------
DROP TABLE IF EXISTS "public"."t_organization";
CREATE TABLE "public"."t_organization" (
	"id" int4 NOT NULL DEFAULT nextval('s_organization'::regclass),
	"org_id" int4,
	"name" varchar(255) NOT NULL COLLATE "default",
	"contact" varchar(255) NOT NULL COLLATE "default",
	"mobile" varchar(255) NOT NULL COLLATE "default",
	"address" varchar(255) NOT NULL COLLATE "default",
	"description" varchar(255) COLLATE "default",
	"created_at" timestamp(6) NOT NULL DEFAULT now(),
	"updated_at" timestamp(6) NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."t_organization" OWNER TO "postgres";

COMMENT ON TABLE "public"."t_organization" IS '机构表';
COMMENT ON COLUMN "public"."t_organization"."org_id" IS '上级机构ID';
COMMENT ON COLUMN "public"."t_organization"."name" IS '机构名称';
COMMENT ON COLUMN "public"."t_organization"."contact" IS '联系人';
COMMENT ON COLUMN "public"."t_organization"."mobile" IS '联系电话';
COMMENT ON COLUMN "public"."t_organization"."address" IS '机构地址';
COMMENT ON COLUMN "public"."t_organization"."description" IS '机构描述';

-- ----------------------------
--  Records of t_organization
-- ----------------------------
BEGIN;
INSERT INTO "public"."t_organization" VALUES ('1000000002', null, '中国', '张某某', '13211111111', '中国', '会场服务', '2017-04-18 10:46:59.128691', '2017-05-26 02:09:06.299256');
INSERT INTO "public"."t_organization" VALUES ('1000000000', '1000000002', '北京', '张某某', '13211111111', '北京市望京', '会场服务', '2017-04-18 10:46:59.128691', '2017-05-26 01:30:25.252207');
COMMIT;

-- ----------------------------
--  Primary key structure for table t_organization
-- ----------------------------
ALTER TABLE "public"."t_organization" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table t_organization
-- ----------------------------
ALTER TABLE "public"."t_organization" ADD CONSTRAINT "un_organization" UNIQUE ("name") NOT DEFERRABLE INITIALLY IMMEDIATE;

