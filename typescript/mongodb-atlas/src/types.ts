import * as atlas from 'awscdk-resources-mongodbatlas';

export enum ClusterType {
  REPLICASET = 'REPLICASET',
  SHARDED = 'SHARDED',
  GEOSHARDED = 'GEOSHARDED',
};

export interface ProjectOptions {
  /**
   * Name of the project to create.
   * @default auto-generated.
   */
  readonly name?: string;
  /**
   * Unique identifier of the organization within which to create the project.
   * @default auto-generated.
   */
  readonly orgId: string;
  /**
   * Unique 24-hexadecimal digit string that identifies the Atlas user account to be granted the `Project Owner`
   * role on the specified project. If you set this parameter, it overrides the default value of the oldest `Organization Owner`.
   */
  readonly projectOwnerId?: string;
  /**
   * Flag that indicates whether to create the project with default alert settings.
   */
  readonly withDefaultAlertsSettings?: boolean;
  /**
   * The number of Atlas clusters deployed in the project.
   */
  readonly clusterCount?: number;
  /**
   * Project settings.
   */
  readonly projectSettings?: atlas.ProjectSettings;
  /**
   * Project team.
   */
  readonly projectTeams?: atlas.ProjectTeam[];
  /**
   * Project API key.
   */
  readonly projectApiKeys?: atlas.ProjectApiKey[];
}
export interface ClusterOptions {
  /**
   * Advanced configuration details to add for one cluster in the specified project.
   */
  readonly advancedSettings?: atlas.ProcessArgs;
  /**
   * Flag that indicates whether the cluster can perform backups. If set to true, the cluster can perform backups.
   * You must set this value to true for NVMe clusters. Backup uses Cloud Backups for dedicated clusters and Shared Cluster
   * Backups for tenant clusters. If set to false, the cluster doesn't use backups.
   */
  readonly backupEnabled?: boolean;
  /**
   * Settings needed to configure the MongoDB Connector for Business Intelligence for this cluster.
   */
  readonly biConnector?: atlas.CfnClusterPropsBiConnector;
  /**
   * Configuration of nodes that comprise the cluster. Atlas accepts: `REPLICASET`, `SHARDED`, `GEOSHARDED`.
   * @default ClusterType.REPLICASET
   */
  readonly clusterType?: ClusterType;
  /**
   * Set of connection strings that your applications use to connect to this cluster. Use the parameters
   * in this object to connect your applications to this cluster.
   * See the MongoDB [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/) reference for further details.
   * @default REPLICASET
   */
  readonly connectionStrings?: atlas.ConnectionStrings;
  /**
   * Storage capacity that the host's root volume possesses expressed in gigabytes. Increase this number to add capacity.
   * MongoDB Cloud requires this parameter if you set replicationSpecs. If you specify a disk size below the minimum (10 GB),
   * this parameter defaults to the minimum disk size value. Storage charge calculations depend on whether you choose the
   * default value or a custom value. The maximum value for disk storage cannot exceed 50 times the maximum RAM for the selected cluster.
   * If you require more storage space, consider upgrading your cluster to a higher tier.
   */
  readonly diskSizeGb?: number;
  /**
   * Cloud service provider that manages your customer keys to provide an additional layer of encryption at rest
   * for the cluster. To enable customer key management for encryption at rest, the cluster replicationSpecs[n].regionConfigs[m].{type}Specs.instanceSize
   * setting must be M10 or higher and "backupEnabled" : false or omitted entirely.
   */
  readonly encryptionAtRestProvider?: atlas.CfnClusterPropsEncryptionAtRestProvider;
  /**
   * The project ID.
   */
  // readonly projectId: string;
  /**
   * Collection of key-value pairs between 1 and 255 characters in length that tag and categorize the cluster.
   * The MongoDB Cloud console doesn't display your labels.
   */
  readonly labels?: atlas.CfnClusterPropsLabels[];
  /**
   * Major MongoDB version of the cluster. MongoDB Cloud deploys the cluster with the latest stable release of the specified
   * version.
   */
  readonly mongoDbMajorVersion?: string;
  /**
   * Human-readable label that identifies the advanced cluster.
   * @default - auto-generated.
   */
  readonly name?: string;
  /**
   * Flag that indicates whether the cluster is paused or not.
   * @default auto-generated
   */
  readonly paused?: boolean;
  /**
   * Flag that indicates whether the cluster uses continuous cloud backups.
   */
  readonly pitEnabled?: boolean;
  /**
   * List of settings that configure your cluster regions. For Global Clusters, each object in the array represents a zone
   * where your clusters nodes deploy. For non-Global replica sets and sharded clusters, this array has one object representing
   * where your clusters nodes deploy.
   */
  readonly replicationSpecs?: atlas.AdvancedReplicationSpec[];
  /**
   * Root Certificate Authority that MongoDB Cloud cluster uses. MongoDB Cloud supports Internet Security Research Group.
   */
  readonly rootCertType?: string;
  /**
   * Method by which the cluster maintains the MongoDB versions. If value is CONTINUOUS, you must not specify
   * mongoDBMajorVersion
   */
  readonly versionReleaseSystem?: string;
  /**
   * Flag that indicates whether termination protection is enabled on the cluster. If set to true, MongoDB Cloud won't delete
   * the cluster. If set to false, MongoDB Cloud will delete the cluster.
   */
  readonly terminationProtectionEnabled?: boolean;
}
/**
 * @description
 * @export
 * @interface DatabaseUserProps
 */
export interface DatabaseUserOptions {
  /**
   * Date and time when MongoDB Cloud deletes the user. This parameter expresses its value in the ISO 8601 timestamp
   * format in UTC and can include the time zone designation. You must specify a future date that falls within one week
   * of making the Application Programming Interface (API) request.
   */
  readonly deleteAfterDate?: string;
  /**
   * Human-readable label that indicates whether the new database user authenticates with the Amazon Web Services (AWS)
   * Identity and Access Management (IAM) credentials associated with the user or the user's role. Default value is `NONE`.
   */
  readonly awsiamType?: atlas.CfnDatabaseUserPropsAwsiamType;
  /**
   * MongoDB database against which the MongoDB database user authenticates. MongoDB database users must provide both a
   * username and authentication database to log into MongoDB.  Default value is `admin`.
   */
  readonly databaseName?: string;
  /**
   * List that contains the key-value pairs for tagging and categorizing the MongoDB database user. The labels that you define
   * do not appear in the console.
   * @default admin
   */
  readonly labels?: atlas.LabelDefinition[];
  /**
   * Method by which the provided username is authenticated. Default value is `NONE`.
   */
  readonly ldapAuthType?: atlas.CfnDatabaseUserPropsLdapAuthType;
  /**
   * Method that briefs who owns the certificate provided. Default value is `NONE`.
   */
  readonly x509Type?: atlas.CfnDatabaseUserPropsX509Type;
  /**
   * The user’s password. This field is not included in the entity returned from the server.
   */
  readonly password?: string;
  /**
   * Unique 24-hexadecimal digit string that identifies your Atlas Project.
   */
  readonly projectId?: string;
  /**
   * List that provides the pairings of one role with one applicable database.
   *
   * @default - [{ roleName: "atlasAdmin", databaseName: "admin" }],
   */
  readonly roles?: atlas.RoleDefinition[];
  /**
   * List that contains clusters and MongoDB Atlas Data Lakes that this database user can access. If omitted,
   * MongoDB Cloud grants the database user access to all the clusters and MongoDB Atlas Data Lakes in the project.
   */
  readonly scopes?: atlas.ScopeDefinition[];
  /**
   * Human-readable label that represents the user that authenticates to MongoDB. The format of this label depends on
   * the method of authentication. This will be USER_ARN or ROLE_ARN if AWSIAMType is USER or ROLE. Refer https://www.mongodb.com/docs/atlas/reference/api-resources-spec/#tag/Database-Users/operation/createDatabaseUser for details.
   * @default cdk-user
   */
  readonly username?: string;
}
/**
 * @description Returns, adds, edits, and removes network access limits to database deployments in MongoDB Cloud.
 * @export
 * @interface IpAccessListProps
 */
export interface IpAccessListOptions {
  /**
   * Access list definition.
   */
  readonly accessList: atlas.AccessListDefinition[];
  /**
   * Unique 24-hexadecimal digit string that identifies your project.
   * @default allow-all
   */
  // readonly projectId?: string;
  /**
   * Number of documents returned in this response.
   */
  readonly totalCount?: number;
  /**
   * List options.
   */
  readonly listOptions?: atlas.ListOptions;
}

export interface AccessList {
  readonly ipAddress: string;
  readonly comment: string;
}

export enum EbsVolumeType {
  STANDARD = 'STANDARD',
}

export enum InstanceSize {
  M10 = 'M10',
}

/**
 * supported AWS regions
 * @see https://www.mongodb.com/docs/atlas/reference/amazon-aws/
 */
export enum AwsRegion {
  US_EAST_1 = 'US_EAST_1',
  US_WEST_2 = 'US_WEST_2',
  CA_CENTRAL_1 = 'CA_CENTRAL_1',
  US_EAST_2 = 'US_EAST_2',
  US_WEST_1 = 'US_WEST_1',
  SA_EAST_1 = 'SA_EAST_1'
}

export interface Specs {
  readonly ebsVolumeType: EbsVolumeType;
  readonly instanceSize: InstanceSize;
  readonly nodeCount: number;
}

export interface RegionConfig {
  readonly analyticsSpecs: Specs;
  readonly electableSpecs: Specs;
  readonly priority: number;
  readonly regionName: string;
}

export interface ReplicationSpecs {
  readonly numShards: number;
  readonly advancedRegionConfigs: RegionConfig[];
}