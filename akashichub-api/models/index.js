import User from "./User.js";
import Resource from "./Resource.js";
import Tag from "./Tag.js";
import ResourceTag from "./ResourceTag.js";
import ResourceRelationship from "./ResourceRelationship.js";

// 定義模型關聯

// User - Resource (一對多關聯)
User.hasMany(Resource, {
  foreignKey: "CreatedBy",
  as: "CreatedResources"
});

Resource.belongsTo(User, {
  foreignKey: "CreatedBy",
  as: "Creator"
});

// User - Tag (一對多關聯)
User.hasMany(Tag, {
  foreignKey: "CreatedBy",
  as: "CreatedTags"
});

Tag.belongsTo(User, {
  foreignKey: "CreatedBy",
  as: "Creator"
});

// Resource - Tag (多對多關聯)
Resource.belongsToMany(Tag, {
  through: ResourceTag,
  foreignKey: "ResourceId",
  otherKey: "TagId",
  as: "Tags"
});

Tag.belongsToMany(Resource, {
  through: ResourceTag,
  foreignKey: "TagId",
  otherKey: "ResourceId",
  as: "Resources"
});

// Resource - ResourceRelationship (自關聯)
Resource.belongsToMany(Resource, {
  through: ResourceRelationship,
  as: "RelatedResources",
  foreignKey: "SourceResourceId",
  otherKey: "TargetResourceId"
});

Resource.belongsToMany(Resource, {
  through: ResourceRelationship,
  as: "SourceResources",
  foreignKey: "TargetResourceId",
  otherKey: "SourceResourceId"
});

// 直接關聯到 ResourceRelationship
Resource.hasMany(ResourceRelationship, {
  foreignKey: "SourceResourceId",
  as: "OutgoingRelationships"
});

Resource.hasMany(ResourceRelationship, {
  foreignKey: "TargetResourceId",
  as: "IncomingRelationships"
});

ResourceRelationship.belongsTo(Resource, {
  foreignKey: "SourceResourceId",
  as: "SourceResource"
});

ResourceRelationship.belongsTo(Resource, {
  foreignKey: "TargetResourceId",
  as: "TargetResource"
});

// ResourceTag 關聯
ResourceTag.belongsTo(Resource, { foreignKey: "ResourceId" });
ResourceTag.belongsTo(Tag, { foreignKey: "TagId" });

// 導出所有模型
export {
  User,
  Resource,
  Tag,
  ResourceTag,
  ResourceRelationship
};