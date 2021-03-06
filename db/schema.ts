import { AppProvider, Application, checkAppConfig } from '../core/app';
import { Console, Arguments } from '../console/command';
import { getConnectionManager } from 'typeorm';
import { File } from '../core/filesystem';
import { SeedService } from './service';
import { Error } from '../core/error';
import { _ } from '../core/misc';

/**
 * Sync schema of the connection
 */
export async function syncSchema(connectionName?: string): Promise<void> {
  await getConnectionManager().get(connectionName).syncSchema();
}

const SEEDER_TEMPLATE: string = _.trimStart(`
import { SeedService } from 'exort/db';

export class {class} extends SeedService {

  public async run(): Promise<void> {

  }
}\n`);

/**
 * Provide schema commands
 */
export function provideSchemaCommands(databaseSourceDir?: string, databaseDistDir?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    if (databaseSourceDir) {
      databaseSourceDir = _.trimEnd(databaseSourceDir, '/');
    } else {
      databaseSourceDir = `${app.rootDir}/src/server/database`;
    }

    if (databaseDistDir) {
      databaseDistDir = _.trimEnd(databaseDistDir, '/');
    } else {
      databaseDistDir = `${app.dir}/database`;
    }

    Console.addCommand({
      command: 'schema:sync',
      desc: 'Sync models and database schema',
      params: {
        'connection': {
          required: false
        }
      },
      async handler(argv: Arguments) {
        await syncSchema(argv.connection);
      }
    });

    Console.addCommand({
      command: 'seed:run',
      desc: 'Run database seeder',
      params: {
        'class': {
          required: false,
          default: 'DefaultSeeder'
        }
      },
      async handler(argv: Arguments) {
        let seederClass = _.requireClass(`${databaseDistDir}/seeds/${argv.class}`);
        if (!_.classExtends(seederClass, SeedService)) {
          throw new Error(`${seederClass.name} doesn't extend SeedService`);
        }
        await app.context.make<SeedService>(seederClass as any).run();
      }
    });

    Console.addCommand({
      command: 'seed:make',
      desc: 'Create database seeder',
      params: {
        'class': {
          required: true
        }
      },
      async handler(argv: Arguments) {
        if (await File.exists(`${databaseSourceDir}/seeds/${argv.class}.ts`)) {
          throw new Error(`${argv.class}.ts already exists`);
        }
        await File.create(`${databaseSourceDir}/seeds/${argv.class}.ts`, SEEDER_TEMPLATE.replace('{class}', argv.class), 'text/plain');
      }
    });
  };
}
