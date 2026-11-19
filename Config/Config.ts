//Step-1: 
import dotenv from 'dotenv';
import path from 'path';
// Load config/.env regardless of the directory the tests are launched from
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

//Step-2: 
const VALID_ENVS = ['dev', 'qa', 'prod'] as const;
type EnvNames = typeof VALID_ENVS[number];
//const DEFAULT_ENV: EnvNames = 'qa';

const RawEnv = process.env.ACTIVE_ENV ?? '';  //const RawEnv = process.env.ACTIVE_ENV?.trim().toLowerCase();
const ActiveEnv = RawEnv.trim().toLowerCase() as EnvNames;  //const ActiveEnv = (RawEnv || DEFAULT_ENV) as EnvNames;
if (!VALID_ENVS.includes(ActiveEnv)) {
    throw new Error(`Invalid ACTIVE_ENV: '${ActiveEnv}'. Available environments are: ${VALID_ENVS.join(', ')}.`);

} else {
    console.log(`Active environment: ${ActiveEnv}`);
}

//Step-3: 
function Required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required Environment variable is missing: '${name}' for the ActiveEnv: '${ActiveEnv}'`);
    }
    return value;
}

interface WebConfig {
    url: string;
    username: string;
    password: string;
}

interface DbConfig {
    server: string;
    username: string;
    password: string;
}

interface SmtpConfig {
    server: string;
}

// Everything an app needs for one environment
export interface EnvConfig {
    web: WebConfig;
    db: DbConfig;
    smtp: SmtpConfig;
}

type AppNames = 'orge' | 'facets';
// Each environment is a factory, so Required() only runs for the active environment
type EnvCredConfigType = Record<AppNames, Record<EnvNames, () => EnvConfig>>;

const EnvCredConfig: EnvCredConfigType = {
    orge: {
        dev: () => ({
            web: {
                url: Required('ORGE_DEV_WEB_URL'),
                username: Required('ORGE_DEV_WEB_USERNAME'),
                password: Required('ORGE_DEV_WEB_PASSWORD')
            },
            db: {
                server: Required('ORGE_DEV_DB_SERVER'),
                username: Required('ORGE_DEV_DB_USERNAME'),
                password: Required('ORGE_DEV_DB_PASSWORD')
            },
            smtp: {
                server: Required('ORGE_SMTP_SERVER')
            }
        }),
        qa: () => ({
            web: {
                url: Required('ORGE_QA_WEB_URL'),
                username: Required('ORGE_QA_WEB_USERNAME'),
                password: Required('ORGE_QA_WEB_PASSWORD')
            },
            db: {
                server: Required('ORGE_QA_DB_SERVER'),
                username: Required('ORGE_QA_DB_USERNAME'),
                password: Required('ORGE_QA_DB_PASSWORD'),
            },
            smtp: {
                server: Required('ORGE_SMTP_SERVER')
            }
        }),
        prod: () => ({
            web: {
                url: Required('ORGE_PROD_WEB_URL'),
                username: Required('ORGE_PROD_WEB_USERNAME'),
                password: Required('ORGE_PROD_WEB_PASSWORD')
            },
            db: {
                server: Required('ORGE_PROD_DB_SERVER'),
                username: Required('ORGE_PROD_DB_USERNAME'),
                password: Required('ORGE_PROD_DB_PASSWORD')
            },
            smtp: {
                server: Required('ORGE_SMTP_SERVER')
            }
        })
    },
    facets: {
        dev: () => ({
            web: {
                url: Required('FACETS_DEV_WEB_URL'),
                username: Required('FACETS_DEV_WEB_USERNAME'),
                password: Required('FACETS_DEV_WEB_PASSWORD')
            },
            db: {
                server: Required('FACETS_DEV_DB_SERVER'),
                username: Required('FACETS_DEV_DB_USERNAME'),
                password: Required('FACETS_DEV_DB_PASSWORD')
            },
            smtp: {
                server: Required('FACETS_SMTP_SERVER')
            }
        }),
        qa: () => ({
            web: {
                url: Required('FACETS_QA_WEB_URL'),
                username: Required('FACETS_QA_WEB_USERNAME'),
                password: Required('FACETS_QA_WEB_PASSWORD')
            },
            db: {
                server: Required('FACETS_QA_DB_SERVER'),
                username: Required('FACETS_QA_DB_USERNAME'),
                password: Required('FACETS_QA_DB_PASSWORD')
            },
            smtp: {
                server: Required('FACETS_SMTP_SERVER')
            }
        }),
        prod: () => ({
            web: {
                url: Required('FACETS_PROD_WEB_URL'),
                username: Required('FACETS_PROD_WEB_USERNAME'),
                password: Required('FACETS_PROD_WEB_PASSWORD')
            },
            db: {
                server: Required('FACETS_PROD_DB_SERVER'),
                username: Required('FACETS_PROD_DB_USERNAME'),
                password: Required('FACETS_PROD_DB_PASSWORD')
            },
            smtp: {
                server: Required('FACETS_SMTP_SERVER')
            }
        })
    }
};

export type AppName = keyof typeof EnvCredConfig;
export function AccessCreds(appName: AppName): EnvConfig {
    return EnvCredConfig[appName][ActiveEnv]();
}

// Ready-to-use creds for the active environment
export const Orge = AccessCreds('orge');
export const Facets = AccessCreds('facets');
