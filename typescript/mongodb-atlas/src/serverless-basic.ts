import { Stack } from 'aws-cdk-lib';
import * as atlas from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';

// import { AtlasServerlessBasicProps } from '../common/props';

/** @type {*} */
const projectDefaults = {
  projectName: 'atlas-project-',
};

/** @type {*} */
const serverlessDefaults = {
  serverlessName: 'atlas-serverless-',
};
/** @type {*} */
const dbDefaults = {
  dbName: 'admin',
  username: 'atlas-user',
  password: 'atlas-pwd',
  roles: [
    {
      roleName: 'atlasAdmin',
      databaseName: 'admin',
    },
  ],
};


export interface AtlasServerlessBasicProps {
  /**
     * The project ID for the serverless instance
     * @default create a new project
     */
  readonly projectId?: string;
  readonly profile: string;
  readonly orgId: string;
  readonly serverlessInstanceName?: string;
  /**
	 * aws region code
	 * @default stack.env.region if available otherwise 'us-east-1'
	 */
  readonly region?: string;
	/**
	 * @default 0.0.0.0/0
	 */
	readonly ipAccessList?: string[];
}


export class AtlasServerlessBasic extends Construct {
  /**
   * @description
   * @type {project.CfnProject}
   * @memberof AtlasServerlessBasic
   */
  readonly mProject: atlas.CfnProject;
  /**
   * @description
   * @type {atlas.CfnCluster}
   * @memberof AtlasServerlessBasic
   */
  readonly mserverless: atlas.CfnServerlessInstance;
  /**
   * @description
   * @type {user.CfnDatabaseUser}
   * @memberof AtlasServerlessBasic
   */
  readonly mDBUser: atlas.CfnDatabaseUser;
  /**
   * @description
   * @type {ipAccessList.CfnProjectIpAccessList}
   * @memberof AtlasServerlessBasic
   */
  readonly ipAccessList: atlas.CfnProjectIpAccessList;

  constructor(scope: Construct, id: string, props: AtlasServerlessBasicProps) {
    super(scope, id);

    const stack = Stack.of(this);

    // Create a new MongoDB Atlas Project
    this.mProject = new atlas.CfnProject(this, 'project-'.concat(id), {
      profile: props.profile,
      name: `${id}-project`,
      orgId: props.orgId,
    });

    // Create a new serverless Instance and pass project ID
    this.mserverless = new atlas.CfnServerlessInstance(
      this,
      'serverless-'.concat(id),
      {
        projectId: this.mProject.attrId,
        name:
          props.serverlessInstanceName ?? `${id}-serverless-instance`,
        providerSettings: {
          providerName:
            atlas.ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
          	regionName: stack.region ?? 'us-east-1',
        },
        profile: props.profile,
        continuousBackupEnabled: this.node.tryGetContext(
          'continuousBackupEnabled',
        ),
        ...props.serverlessProps,
      },
    );
    this.mserverless.addDependency(this.mProject);
    // Create a new MongoDB Atlas Database User
    this.mDBUser = new atlas.CfnDatabaseUser(this, 'db-user-'.concat(id), {
      profile: props.profile,
      databaseName: props.dbUserProps?.databaseName || dbDefaults.dbName,
      projectId: this.mProject.attrId,
      username: props.dbUserProps?.username || dbDefaults.username,
      roles: props.dbUserProps?.roles || dbDefaults.roles,
      password: props.dbUserProps?.password || dbDefaults.password,
      ...props.dbUserProps,
    });
    this.mDBUser.addDependency(this.mProject);
    // Create a new MongoDB Atlas Project IP Access List
    this.ipAccessList = new atlas.CfnProjectIpAccessList(
      this,
      'ip-access-list-'.concat(id),
      {
        profile: props.profile,
        projectId: this.mProject.attrId,
        accessList: props.ipAccessList,
      },
    );
    this.ipAccessList.addDependency(this.mProject);
  }
}

// function randomNumber() {
//   const min = 10;
//   const max = 9999999;
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }