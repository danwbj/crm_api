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

 Date: 05/26/2017 11:55:48 AM
*/

-- ----------------------------
--  Table structure for t_permission
-- ----------------------------
DROP TABLE IF EXISTS "public"."t_permission";
CREATE TABLE "public"."t_permission" (
	"id" int4 NOT NULL DEFAULT nextval('s_permission'::regclass),
	"name" varchar(255) NOT NULL COLLATE "default",
	"route" varchar(255) NOT NULL COLLATE "default",
	"description" varchar(255) COLLATE "default",
	"created_at" timestamp(6) NOT NULL DEFAULT now(),
	"updated_at" timestamp(6) NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."t_permission" OWNER TO "postgres";

COMMENT ON TABLE "public"."t_permission" IS '权限表';
COMMENT ON COLUMN "public"."t_permission"."name" IS '权限名称';
COMMENT ON COLUMN "public"."t_permission"."route" IS '模块路由';
COMMENT ON COLUMN "public"."t_permission"."description" IS '权限描述';

-- ----------------------------
--  Records of t_permission
-- ----------------------------
BEGIN;
INSERT INTO "public"."t_permission" VALUES ('1000000000', '用户管理', 'users', '用户管理', '2017-05-26 01:34:17.453706', '2017-05-26 01:34:17.453706');
INSERT INTO "public"."t_permission" VALUES ('1000000001', '微服务', 'ucenter', '微服务', '2017-05-26 01:34:27.05003', '2017-05-26 01:34:27.05003');
COMMIT;

-- ----------------------------
--  Primary key structure for table t_permission
-- ----------------------------
ALTER TABLE "public"."t_permission" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table t_permission
-- ----------------------------
ALTER TABLE "public"."t_permission" ADD CONSTRAINT "un_permission" UNIQUE ("route") NOT DEFERRABLE INITIALLY IMMEDIATE;

