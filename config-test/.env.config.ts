# ---------------------------------------------------------------------------
# Active environment - dev | qa | prod   (Config.ts falls back to 'qa')
# ---------------------------------------------------------------------------
ACTIVE_ENV=qa

# ---------------------------------------------------------------------------
# Fallback Timeouts
# ---------------------------------------------------------------------------
DEFAULT_ELEMENT_TIMEOUT=8000
DEFAULT_NAVIGATION_TIMEOUT=10000

# ===========================================================================
# DEV
# ===========================================================================
# --- Orge ---
DEV_ORGE_WEB_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
DEV_ORGE_WEB_USERNAME=Admin
DEV_ORGE_WEB_PASSWORD=admin123
DEV_ORGE_DB_SERVER=
DEV_ORGE_DB_USER=
DEV_ORGE_DB_PASSWORD=
DEV_ORGE_API_BASEURL=https://opensource-demo.orangehrmlive.com/web/index.php/api/v2
DEV_ORGE_SMTP_SERVER=

# --- Facets ---
DEV_FACETS_WEB_URL=
DEV_FACETS_WEB_USERNAME=
DEV_FACETS_WEB_PASSWORD=
DEV_FACETS_DB_SERVER=
DEV_FACETS_DB_USER=
DEV_FACETS_DB_PASSWORD=
DEV_FACETS_API_BASEURL=
DEV_FACETS_SMTP_SERVER=

# ===========================================================================
# QA
# ===========================================================================
# --- Orge ---
QA_ORGE_WEB_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
QA_ORGE_WEB_USERNAME=Admin
QA_ORGE_WEB_PASSWORD=admin123
QA_ORGE_DB_SERVER=
QA_ORGE_DB_USER=
QA_ORGE_DB_PASSWORD=
QA_ORGE_API_BASEURL=https://opensource-demo.orangehrmlive.com/web/index.php/api/v2
QA_ORGE_SMTP_SERVER=

# --- Facets ---
QA_FACETS_WEB_URL=
QA_FACETS_WEB_USERNAME=
QA_FACETS_WEB_PASSWORD=
QA_FACETS_DB_SERVER=
QA_FACETS_DB_USER=
QA_FACETS_DB_PASSWORD=
QA_FACETS_API_BASEURL=
QA_FACETS_SMTP_SERVER=

# ===========================================================================
# PROD
# ===========================================================================
# --- Orge ---
PROD_ORGE_WEB_URL=
PROD_ORGE_WEB_USERNAME=
PROD_ORGE_WEB_PASSWORD=
PROD_ORGE_DB_SERVER=
PROD_ORGE_DB_USER=
PROD_ORGE_DB_PASSWORD=
PROD_ORGE_API_BASEURL=
PROD_ORGE_SMTP_SERVER=

# --- Facets ---
PROD_FACETS_WEB_URL=
PROD_FACETS_WEB_USERNAME=
PROD_FACETS_WEB_PASSWORD=
PROD_FACETS_DB_SERVER=
PROD_FACETS_DB_USER=
PROD_FACETS_DB_PASSWORD=
PROD_FACETS_API_BASEURL=
PROD_FACETS_SMTP_SERVER=

# ===========================================================================
# APP SPECIFIC COMP/CONTROLS TIMEOUTS ACCROSS ALL ENV
# ===========================================================================
# --- Orge ---
ORGE_ELEMENT_TIMEOUT=10000
ORGE_NAVIGATION_TIMEOUT=20000
ORGE_LEFT_NAV_TIMEOUT=50000
# --- Facets ---
FACETS_ELEMENT_TIMEOUT=15000
FACETS_NAVIGATION_TIMEOUT=20000
