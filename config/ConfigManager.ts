import dotenv from 'dotenv';
import path from 'path';

// Load config/.env regardless of the directory the tests are launched from
dotenv.config({ path: path.resolve(__dirname, '.env') });

/* -------------------------------------------------------------------------
   1. INTERFACES - limited to the important credentials only
   ------------------------------------------------------------------------- */
// web creds interface
export interface WebConfig {
    url: string;
    username: string;
    password: string;
}
// db creds interface
export interface DbConfig {
    server: string;
    username: string;
    password: string;
}
// smtp creds interface
export interface SmtpConfig {
    server: string;
}
// app config - the credentials an app owns
export interface AppConfig {
    web: WebConfig;
    db: DbConfig;
    smtp: SmtpConfig;
}

/* -------------------------------------------------------------------------
   2. TYPES - restrict the supported environments and app names
   ------------------------------------------------------------------------- */
export type EnvName = 'dev' | 'qa' | 'prod';
export type AppName = 'orge' | 'facets';

// Active environment read from .env - defaults to qa when not provided
const ACTIVE_ENV: EnvName = (process.env.ACTIVE_ENV as EnvName) || 'qa';

/* -------------------------------------------------------------------------
   3. CONFIG OBJECT - app name is the top-level key, environments nested inside.
      Shape:  ORGE { dev {}, qa {}, prod {} }
      (the old `apps` wrapper key is removed)
   ------------------------------------------------------------------------- */
const envCredConfig: Record<AppName, Record<EnvName, AppConfig>> = {
    orge: {
        dev: {
            web: {
                url: String(process.env.DEV_ORGE_WEB_URL),
                username: process.env.DEV_ORGE_WEB_USERNAME!,
                password: process.env.DEV_ORGE_WEB_PASSWORD!
            },
            db: {
                server: process.env.DEV_ORGE_DB_SERVER!,
                username: process.env.DEV_ORGE_DB_USER!,
                password: process.env.DEV_ORGE_DB_PASSWORD!
            },
            smtp: {
                server: process.env.DEV_ORGE_SMTP_SERVER!
            }
        },
        qa: {
            web: {
                url: process.env.QA_ORGE_WEB_URL!,
                username: process.env.QA_ORGE_WEB_USERNAME!,
                password: process.env.QA_ORGE_WEB_PASSWORD!
            },
            db: {
                server: process.env.QA_ORGE_DB_SERVER!,
                username: process.env.QA_ORGE_DB_USER!,
                password: process.env.QA_ORGE_DB_PASSWORD!
            },
            smtp: {
                server: process.env.QA_ORGE_SMTP_SERVER!
            }
        },
        prod: {
            web: {
                url: process.env.PROD_ORGE_WEB_URL!,
                username: process.env.PROD_ORGE_WEB_USERNAME!,
                password: process.env.PROD_ORGE_WEB_PASSWORD!
            },
            db: {
                server: process.env.PROD_ORGE_DB_SERVER!,
                username: process.env.PROD_ORGE_DB_USER!,
                password: process.env.PROD_ORGE_DB_PASSWORD!
            },
            smtp: {
                server: process.env.PROD_ORGE_SMTP_SERVER!
            }
        }
    },
    facets: {
        dev: {
            web: {
                url: process.env.DEV_FACETS_WEB_URL!,
                username: process.env.DEV_FACETS_WEB_USERNAME!,
                password: process.env.DEV_FACETS_WEB_PASSWORD!
            },
            db: {
                server: process.env.DEV_FACETS_DB_SERVER!,
                username: process.env.DEV_FACETS_DB_USER!,
                password: process.env.DEV_FACETS_DB_PASSWORD!
            },
            smtp: {
                server: process.env.DEV_FACETS_SMTP_SERVER!
            }
        },
        qa: {
            web: {
                url: process.env.QA_FACETS_WEB_URL!,
                username: process.env.QA_FACETS_WEB_USERNAME!,
                password: process.env.QA_FACETS_WEB_PASSWORD!
            },
            db: {
                server: process.env.QA_FACETS_DB_SERVER!,
                username: process.env.QA_FACETS_DB_USER!,
                password: process.env.QA_FACETS_DB_PASSWORD!
            },
            smtp: {
                server: process.env.QA_FACETS_SMTP_SERVER!
            }
        },
        prod: {
            web: {
                url: process.env.PROD_FACETS_WEB_URL!,
                username: process.env.PROD_FACETS_WEB_USERNAME!,
                password: process.env.PROD_FACETS_WEB_PASSWORD!
            },
            db: {
                server: process.env.PROD_FACETS_DB_SERVER!,
                username: process.env.PROD_FACETS_DB_USER!,
                password: process.env.PROD_FACETS_DB_PASSWORD!
            },
            smtp: {
                server: process.env.PROD_FACETS_SMTP_SERVER!
            }
        }
    }
};

/* -------------------------------------------------------------------------
   4. ACCESS FUNCTION - the "challenging part"
      With the new shape we first index by appName, then by the ACTIVE_ENV.
      So resolution is: envCredConfig[appName][ACTIVE_ENV]
   ------------------------------------------------------------------------- */
function accessCreds(appName: AppName): AppConfig {
    const app = envCredConfig[appName];
    if (!app) {
        const availableApps = Object.keys(envCredConfig).map(k => `"${k}"`).join(', ');
        throw new Error(`App '${appName}' is not configured.\nAvailable apps - ${availableApps}`);
    }

    const creds = app[ACTIVE_ENV];
    if (!creds) {
        const availableEnvs = Object.keys(app).map(k => `"${k}"`).join(', ');
        throw new Error(`App '${appName}' has no config for '${ACTIVE_ENV}' environment.\nAvailable environments - ${availableEnvs}`);
    }

    return creds;
}

/* -------------------------------------------------------------------------
   5. EXPORTED CREDS - final resolved values used inside the page methods
   ------------------------------------------------------------------------- */
export const orgeCreds = accessCreds('orge');
export const facetsCreds = accessCreds('facets');

