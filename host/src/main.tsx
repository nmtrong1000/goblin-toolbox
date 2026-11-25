/*
 * Module Federation needs this async boundary: shared singletons (React, i18next) are negotiated
 * before the app's own imports run. Importing bootstrap statically breaks sharing with remotes.
 */
void import('#/bootstrap.tsx');
